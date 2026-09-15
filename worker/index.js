import "dotenv/config";
import cron from "node-cron";
import pool from "./db/index.js";
import { checkUrl } from "./checker.js";

const BATCH = Number(process.env.WORKER_BATCH_SIZE) || 50;
const CRON = process.env.WORKER_CRON || "* * * * *";
const CONCURRENCY = Number(process.env.WORKER_CONCURRENCY) || 5;

let isRunning = false;
let task = null;

const claimDueMonitors = async () => {
  const result = await pool.query(
    `
      SELECT id, user_id, url, current_status, check_interval_seconds
      FROM monitors
      WHERE next_check_at <= NOW()
      ORDER BY next_check_at ASC
      LIMIT $1
    `,
    [BATCH]
  );
  return result.rows;
};

const processMonitor = async (monitor) => {
  const prevStatus = monitor.current_status;
  const probe = await checkUrl(monitor.url);
  const success = probe.status === "UP";
  const errorType = probe.error ? String(probe.error).slice(0, 50) : null;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `
        INSERT INTO checks (monitor_id, status_code, response_time_ms, success, error_type)
        VALUES ($1, $2, $3, $4, $5)
      `,
      [monitor.id, probe.statusCode, probe.responseTime, success, errorType]
    );

    await client.query(
      `
        UPDATE monitors
        SET current_status = $1,
            consecutive_failures = CASE WHEN $2 THEN 0 ELSE consecutive_failures + 1 END,
            last_checked_at = NOW(),
            next_check_at = NOW() + (check_interval_seconds || ' seconds')::interval,
            updated_at = NOW()
        WHERE id = $3
      `,
      [probe.status, success, monitor.id]
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  if (prevStatus !== probe.status) {
    console.log(
      `[worker] TRANSITION ${prevStatus}->${probe.status} monitor=${monitor.id} url=${monitor.url}`
    );
    // TODO step-2 (email): lookup enabled alerts for monitor.id,
    // send via Resend, INSERT INTO alert_logs. MVP only logs.
  } else {
    console.log(
      `[worker] ${monitor.id} ${monitor.url} -> ${probe.status} ${probe.statusCode ?? "-"} ${probe.responseTime}ms`
    );
  }
};

const runWithConcurrency = async (items, limit, fn) => {
  const results = [];
  for (let i = 0; i < items.length; i += limit) {
    const batch = items.slice(i, i + limit);
    const settled = await Promise.allSettled(batch.map((item) => fn(item)));
    results.push(...settled);
  }
  return results;
};

const tick = async () => {
  if (isRunning) {
    console.log("[worker] previous tick still running, skipping");
    return;
  }
  isRunning = true;
  try {
    const due = await claimDueMonitors();
    console.log(`[worker] tick claimed=${due.length}`);
    if (due.length === 0) return;
    const settled = await runWithConcurrency(due, CONCURRENCY, processMonitor);
    const failed = settled.filter((r) => r.status === "rejected");
    for (const f of failed) {
      console.error("[worker] monitor failed", f.reason);
    }
    console.log(`[worker] tick done ok=${settled.length - failed.length} failed=${failed.length}`);
  } catch (error) {
    console.error("[worker] tick error", error);
  } finally {
    isRunning = false;
  }
};

const shutdown = async (signal) => {
  console.log(`[worker] received ${signal}, shutting down`);
  if (task) task.stop();
  try {
    await pool.end();
  } catch (error) {
    console.error("[worker] pool.end error", error);
  }
  process.exit(0);
};

if (!process.env.DATABASE_URL) {
  console.error("[worker] DATABASE_URL is not set, exiting");
  process.exit(1);
}

console.log(`[worker] starting cron=${CRON} batch=${BATCH} concurrency=${CONCURRENCY}`);

await tick();
task = cron.schedule(CRON, () => {
  tick();
});

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

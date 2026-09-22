import "dotenv/config";
import cron from "node-cron";
import pool from "./db/index.js";
import { checkUrl } from "./checker.js";
import { isEmailConfigured, sendDownEmail, sendRecoveryEmail } from "./email.js";

const BATCH = Number(process.env.WORKER_BATCH_SIZE) || 50;
const CRON = process.env.WORKER_CRON || "* * * * *";
const CONCURRENCY = Number(process.env.WORKER_CONCURRENCY) || 5;
// Consecutive failures required before a DOWN email fires (flap protection).
const FAILURE_THRESHOLD = Math.max(1, Number(process.env.ALERT_FAILURE_THRESHOLD) || 2);

let isRunning = false;
let task = null;

const claimDueMonitors = async () => {
  const result = await pool.query(
    `
      SELECT id, user_id, name, url, current_status, consecutive_failures, check_interval_seconds
      FROM monitors
      WHERE next_check_at <= NOW()
      ORDER BY next_check_at ASC
      LIMIT $1
    `,
    [BATCH]
  );
  return result.rows;
};

const notifyTransition = async ({ monitor, type, probe }) => {
  if (!isEmailConfigured()) {
    console.log("[worker] email not configured, skipping notifications");
    return;
  }

  const alertsResult = await pool.query(
    `
      SELECT id, target, on_down, on_recovery
      FROM alerts
      WHERE monitor_id = $1 AND is_enabled = TRUE AND channel = 'EMAIL'
    `,
    [monitor.id]
  );
  const recipients = alertsResult.rows.filter((alert) =>
    type === "DOWN" ? alert.on_down : alert.on_recovery
  );

  if (recipients.length === 0) {
    console.log(`[worker] no enabled alerts for monitor=${monitor.id} type=${type}`);
    return;
  }

  for (const alert of recipients) {
    const payload = {
      to: alert.target,
      monitorName: monitor.name,
      url: monitor.url,
      statusCode: probe.statusCode,
      error: probe.error,
    };
    try {
      const { id } =
        type === "DOWN" ? await sendDownEmail(payload) : await sendRecoveryEmail(payload);
      await pool.query(
        `
          INSERT INTO alert_logs (monitor_id, alert_type, message, channel, delivery_status, provider_id, sent_at)
          VALUES ($1, $2, $3, 'EMAIL', 'SENT', $4, NOW())
        `,
        [
          monitor.id,
          type,
          `${monitor.name} ${type === "DOWN" ? "is DOWN" : "recovered"} (${monitor.url})`,
          id,
        ]
      );
      console.log(
        `[worker] email SENT to=${alert.target} monitor=${monitor.id} type=${type} provider=${id}`
      );
    } catch (error) {
      await pool.query(
        `
          INSERT INTO alert_logs (monitor_id, alert_type, message, channel, delivery_status, provider_id, sent_at)
          VALUES ($1, $2, $3, 'EMAIL', 'FAILED', NULL, NULL)
        `,
        [
          monitor.id,
          type,
          `${monitor.name} ${type} notify failed: ${String(error?.message || error).slice(0, 200)}`,
        ]
      );
      console.error(
        `[worker] email FAILED to=${alert.target} monitor=${monitor.id}`,
        error?.message || error
      );
    }
  }
};

const processMonitor = async (monitor) => {
  const prevStatus = monitor.current_status;
  const probe = await checkUrl(monitor.url);
  const success = probe.status === "UP";
  const errorType = probe.error ? String(probe.error).slice(0, 50) : null;

  const client = await pool.connect();
  let newFailures = success ? 0 : (monitor.consecutive_failures ?? 0) + 1;
  try {
    await client.query("BEGIN");

    await client.query(
      `
        INSERT INTO checks (monitor_id, status_code, response_time_ms, success, error_type)
        VALUES ($1, $2, $3, $4, $5)
      `,
      [monitor.id, probe.statusCode, probe.responseTime, success, errorType]
    );

    const updateRes = await client.query(
      `
        UPDATE monitors
        SET current_status = $1,
            consecutive_failures = CASE WHEN $2 THEN 0 ELSE consecutive_failures + 1 END,
            last_checked_at = NOW(),
            next_check_at = NOW() + (check_interval_seconds || ' seconds')::interval,
            updated_at = NOW()
        WHERE id = $3
        RETURNING consecutive_failures
      `,
      [probe.status, success, monitor.id]
    );
    newFailures = updateRes.rows[0].consecutive_failures;

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  // First-ever check (PENDING) only establishes a baseline — never notify on it.
  // DOWN emails fire exactly once, when consecutive failures cross
  // FAILURE_THRESHOLD (so a single blip stays silent and a sustained outage
  // pages once, even if the DOWN state was first set by a manual check).
  // Recovery emails fire on any DOWN -> UP flip.
  if (probe.status === "DOWN") {
    if (prevStatus === "PENDING") {
      console.log(`[worker] BASELINE DOWN monitor=${monitor.id} url=${monitor.url}`);
    } else if (newFailures === FAILURE_THRESHOLD) {
      console.log(
        `[worker] THRESHOLD ${prevStatus}->DOWN monitor=${monitor.id} failures=${newFailures}`
      );
      await notifyTransition({ monitor, type: "DOWN", probe }).catch((error) =>
        console.error("[worker] notify error", error)
      );
    } else if (newFailures < FAILURE_THRESHOLD) {
      console.log(
        `[worker] DOWN suppressed monitor=${monitor.id} failures=${newFailures}/${FAILURE_THRESHOLD}`
      );
    } else {
      console.log(
        `[worker] ${monitor.id} ${monitor.url} -> DOWN (still down, failures=${newFailures})`
      );
    }
  } else if (probe.status === "UP" && prevStatus === "DOWN") {
    console.log(`[worker] TRANSITION DOWN->UP monitor=${monitor.id} url=${monitor.url}`);
    await notifyTransition({ monitor, type: "RECOVERY", probe }).catch((error) =>
      console.error("[worker] notify error", error)
    );
  } else {
    if (prevStatus !== probe.status) {
      console.log(
        `[worker] TRANSITION ${prevStatus}->${probe.status} monitor=${monitor.id} url=${monitor.url}`
      );
    } else {
      console.log(
        `[worker] ${monitor.id} ${monitor.url} -> ${probe.status} ${probe.statusCode ?? "-"} ${probe.responseTime}ms`
      );
    }
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

console.log(`[worker] starting cron=${CRON} batch=${BATCH} concurrency=${CONCURRENCY} failureThreshold=${FAILURE_THRESHOLD}`);

await tick();
task = cron.schedule(CRON, () => {
  tick();
});

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

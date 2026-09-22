import pool from "../db/index.js";

const DEFAULT_TIMEOUT_MS = Number(process.env.MONITOR_TIMEOUT_MS) || 5000;

const classifyStatus = (statusCode) => (statusCode < 400 ? "UP" : "DOWN");

const toFriendlyError = (err) => {
  if (err?.name === "TimeoutError" || err?.name === "AbortError") {
    return "Request timeout";
  }
  const code = err?.cause?.code;
  if (code === "ENOTFOUND") return "DNS lookup failed";
  if (code === "ECONNREFUSED") return "Connection refused";
  if (code === "ECONNRESET") return "Connection reset";
  if (code === "EHOSTUNREACH" || code === "ENETUNREACH") {
    return "Host unreachable";
  }
  if (code === "ETIMEDOUT") return "Request timeout";
  return err?.cause?.message || err?.message || "Request failed";
};

export const checkUrl = async (url, options = {}) => {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const start = performance.now();
  const elapsed = () => Math.round(performance.now() - start);

  if (typeof url !== "string" || !url.trim()) {
    return {
      status: "DOWN",
      statusCode: null,
      responseTime: 0,
      error: "Invalid URL",
    };
  }

  let parsed;
  try {
    parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return {
        status: "DOWN",
        statusCode: null,
        responseTime: 0,
        error: "Only HTTP and HTTPS URLs are supported",
      };
    }
  } catch {
    return {
      status: "DOWN",
      statusCode: null,
      responseTime: 0,
      error: "Invalid URL",
    };
  }

  try {
    const res = await fetch(parsed.toString(), {
      signal: AbortSignal.timeout(timeoutMs),
      redirect: "follow",
      headers: { "User-Agent": "DownAlert-Monitor/1.0" },
    });
    await res.body?.cancel?.().catch(() => {});
    return {
      status: classifyStatus(res.status),
      statusCode: res.status,
      responseTime: elapsed(),
      error: null,
    };
  } catch (err) {
    return {
      status: "DOWN",
      statusCode: null,
      responseTime: elapsed(),
      error: toFriendlyError(err),
    };
  }
};

export default { checkUrl };

const MONITOR_COLUMNS = `
  id, user_id, name, url, check_interval_seconds,
  current_status, consecutive_failures,
  last_checked_at, next_check_at,
  created_at, updated_at
`;

const FREE_PLAN_MAX_MONITORS = 1;
const PAID_PLAN_MAX_MONITORS = 5;
const FREE_PLAN_MIN_INTERVAL = 300;

const assertWithinPlanLimits = async (userId, userPlan, checkIntervalSeconds) => {
  const isFree = userPlan !== "paid" && userPlan !== "pro" && userPlan !== "business";
  if (isFree && checkIntervalSeconds < FREE_PLAN_MIN_INTERVAL) {
    throw new Error("Check interval too frequent for free plan");
  }
  const countResult = await pool.query(
    "SELECT COUNT(*)::int AS count FROM monitors WHERE user_id = $1",
    [userId]
  );
  const count = countResult.rows[0].count;
  const maxAllowed = isFree ? FREE_PLAN_MAX_MONITORS : PAID_PLAN_MAX_MONITORS;
  if (count >= maxAllowed) {
    throw new Error("Monitor limit reached");
  }
};

export const createMonitor = async (userId, userPlan, data) => {
  await assertWithinPlanLimits(userId, userPlan, data.check_interval_seconds ?? 300);

  const result = await pool.query(
    `
      INSERT INTO monitors (user_id, name, url, check_interval_seconds)
      VALUES ($1, $2, $3, $4)
      RETURNING ${MONITOR_COLUMNS}
    `,
    [userId, data.name.trim(), data.url.trim(), data.check_interval_seconds ?? 300]
  );
  return result.rows[0];
};

export const listMonitors = async (userId) => {
  const result = await pool.query(
    `
      SELECT ${MONITOR_COLUMNS}
      FROM monitors
      WHERE user_id = $1
      ORDER BY created_at DESC
    `,
    [userId]
  );
  return result.rows;
};

export const getMonitorById = async (userId, monitorId) => {
  const result = await pool.query(
    `
      SELECT ${MONITOR_COLUMNS}
      FROM monitors
      WHERE id = $1 AND user_id = $2
    `,
    [monitorId, userId]
  );
  if (result.rows.length === 0) {
    throw new Error("Monitor not found");
  }
  return result.rows[0];
};

const ALLOWED_UPDATE_FIELDS = ["name", "url", "check_interval_seconds"];

export const updateMonitor = async (userId, userPlan, monitorId, patch) => {
  const isFree = userPlan !== "paid" && userPlan !== "pro" && userPlan !== "business";
  if (
    patch.check_interval_seconds !== undefined &&
    isFree &&
    patch.check_interval_seconds < FREE_PLAN_MIN_INTERVAL
  ) {
    throw new Error("Check interval too frequent for free plan");
  }

  const sets = [];
  const values = [];
  let index = 1;

  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (patch[field] === undefined) continue;
    if (field === "name" || field === "url") {
      sets.push(`${field} = $${index++}`);
      values.push(patch[field].trim());
    } else {
      sets.push(`${field} = $${index++}`);
      values.push(patch[field]);
    }
  }

  // URL change means previous UP/DOWN state is stale — reset to PENDING
  // so the worker re-checks immediately. Interval change also re-schedules.
  if (patch.url !== undefined) {
    sets.push(`current_status = 'PENDING'`);
    sets.push(`consecutive_failures = 0`);
    sets.push(`last_checked_at = NULL`);
    sets.push(`next_check_at = NOW()`);
  } else if (patch.check_interval_seconds !== undefined) {
    sets.push(`next_check_at = NOW()`);
  }

  sets.push(`updated_at = NOW()`);

  const result = await pool.query(
    `
      UPDATE monitors
      SET ${sets.join(", ")}
      WHERE id = $${index++} AND user_id = $${index++}
      RETURNING ${MONITOR_COLUMNS}
    `,
    [...values, monitorId, userId]
  );
  if (result.rows.length === 0) {
    throw new Error("Monitor not found");
  }
  return result.rows[0];
};

export const deleteMonitor = async (userId, monitorId) => {
  const result = await pool.query(
    "DELETE FROM monitors WHERE id = $1 AND user_id = $2 RETURNING id",
    [monitorId, userId]
  );
  if (result.rows.length === 0) {
    throw new Error("Monitor not found");
  }
  return { id: result.rows[0].id };
};

const CHECK_COLUMNS = `
  id, monitor_id, status_code, response_time_ms,
  success, error_type, checked_at
`;

export const listChecks = async (userId, monitorId, { limit = 50, offset = 0 } = {}) => {
  // Ownership check first — never expose another user's check history.
  await getMonitorById(userId, monitorId);

  const [checksResult, countResult] = await Promise.all([
    pool.query(
      `
        SELECT ${CHECK_COLUMNS}
        FROM checks
        WHERE monitor_id = $1
        ORDER BY checked_at DESC
        LIMIT $2 OFFSET $3
      `,
      [monitorId, limit, offset]
    ),
    pool.query("SELECT COUNT(*)::int AS total FROM checks WHERE monitor_id = $1", [
      monitorId,
    ]),
  ]);

  return {
    checks: checksResult.rows,
    pagination: { total: countResult.rows[0].total, limit, offset },
  };
};

export const runManualCheck = async (userId, monitorId) => {
  // Ownership check first — only the owner can trigger a probe.
  const monitor = await getMonitorById(userId, monitorId);

  const probe = await checkUrl(monitor.url);
  const success = probe.status === "UP";
  // error_type is VARCHAR(50) — truncate long transport messages.
  const errorType = probe.error ? String(probe.error).slice(0, 50) : null;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const checkResult = await client.query(
      `
        INSERT INTO checks (monitor_id, status_code, response_time_ms, success, error_type)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING ${CHECK_COLUMNS}
      `,
      [monitorId, probe.statusCode, probe.responseTime, success, errorType]
    );

    const monitorResult = await client.query(
      `
        UPDATE monitors
        SET current_status = $1,
            consecutive_failures = CASE WHEN $2 THEN 0 ELSE consecutive_failures + 1 END,
            last_checked_at = NOW(),
            next_check_at = NOW() + (check_interval_seconds || ' seconds')::interval,
            updated_at = NOW()
        WHERE id = $3 AND user_id = $4
        RETURNING ${MONITOR_COLUMNS}
      `,
      [probe.status, success, monitorId, userId]
    );

    await client.query("COMMIT");
    return { check: checkResult.rows[0], monitor: monitorResult.rows[0] };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Aggregated stats for one monitor — lets the dashboard avoid
// client-side math over raw check rows.
export const getMonitorStats = async (userId, monitorId, { window = 50 } = {}) => {
  await getMonitorById(userId, monitorId);

  const result = await pool.query(
    `
      WITH recent AS (
        SELECT success, response_time_ms, checked_at
        FROM checks
        WHERE monitor_id = $1
        ORDER BY checked_at DESC
        LIMIT $2
      )
      SELECT
        COUNT(*)::int AS total_checks,
        COUNT(*) FILTER (WHERE success)::int AS up_checks,
        AVG(response_time_ms)::float AS avg_response_ms,
        MAX(checked_at) AS last_check_at
      FROM recent
    `,
    [monitorId, window]
  );
  const row = result.rows[0];
  const total = row.total_checks ?? 0;
  const up = row.up_checks ?? 0;
  return {
    total_checks: total,
    up_checks: up,
    uptime_percent: total > 0 ? Number(((up / total) * 100).toFixed(2)) : null,
    avg_response_ms:
      row.avg_response_ms !== null ? Math.round(row.avg_response_ms) : null,
    last_check_at: row.last_check_at,
    window,
  };
};

const ALERT_LOG_COLUMNS = `
  id, monitor_id, alert_type, message, channel,
  delivery_status, provider_id, sent_at, created_at
`;

export const listAlertLogs = async (userId, monitorId, { limit = 20, offset = 0 } = {}) => {
  await getMonitorById(userId, monitorId);

  const [logsResult, countResult] = await Promise.all([
    pool.query(
      `
        SELECT ${ALERT_LOG_COLUMNS}
        FROM alert_logs
        WHERE monitor_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `,
      [monitorId, limit, offset]
    ),
    pool.query("SELECT COUNT(*)::int AS total FROM alert_logs WHERE monitor_id = $1", [
      monitorId,
    ]),
  ]);

  return {
    logs: logsResult.rows,
    pagination: { total: countResult.rows[0].total, limit, offset },
  };
};

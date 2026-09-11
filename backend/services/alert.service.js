import pool from "../db/index.js";

const ALERT_COLUMNS = `
  id, user_id, monitor_id, channel, target,
  on_down, on_recovery, is_enabled,
  created_at, updated_at
`;

const assertMonitorOwnedByUser = async (userId, monitorId) => {
  const result = await pool.query(
    "SELECT id FROM monitors WHERE id = $1 AND user_id = $2",
    [monitorId, userId]
  );
  if (result.rows.length === 0) {
    throw new Error("Monitor not found");
  }
};

export const createAlert = async (userId, data) => {
  await assertMonitorOwnedByUser(userId, data.monitor_id);

  try {
    const result = await pool.query(
      `
        INSERT INTO alerts (user_id, monitor_id, channel, target, on_down, on_recovery, is_enabled)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING ${ALERT_COLUMNS}
      `,
      [
        userId,
        data.monitor_id,
        data.channel ?? "EMAIL",
        data.target.trim(),
        data.on_down ?? true,
        data.on_recovery ?? true,
        data.is_enabled ?? true,
      ]
    );
    return result.rows[0];
  } catch (error) {
    if (error?.code === "23505") {
      throw new Error("Alert already exists");
    }
    throw error;
  }
};

export const listAlerts = async (userId) => {
  const result = await pool.query(
    `
      SELECT ${ALERT_COLUMNS}
      FROM alerts
      WHERE user_id = $1
      ORDER BY created_at DESC
    `,
    [userId]
  );
  return result.rows;
};

export const getAlertById = async (userId, alertId) => {
  const result = await pool.query(
    `
      SELECT ${ALERT_COLUMNS}
      FROM alerts
      WHERE id = $1 AND user_id = $2
    `,
    [alertId, userId]
  );
  if (result.rows.length === 0) {
    throw new Error("Alert not found");
  }
  return result.rows[0];
};

const ALLOWED_UPDATE_FIELDS = ["monitor_id", "channel", "target", "on_down", "on_recovery", "is_enabled"];

export const updateAlert = async (userId, alertId, patch) => {
  if (patch.monitor_id !== undefined) {
    await assertMonitorOwnedByUser(userId, patch.monitor_id);
  }

  const sets = [];
  const values = [];
  let index = 1;

  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (patch[field] === undefined) continue;
    if (field === "target") {
      sets.push(`${field} = $${index++}`);
      values.push(patch[field].trim());
    } else {
      sets.push(`${field} = $${index++}`);
      values.push(patch[field]);
    }
  }

  sets.push(`updated_at = NOW()`);

  try {
    const result = await pool.query(
      `
        UPDATE alerts
        SET ${sets.join(", ")}
        WHERE id = $${index++} AND user_id = $${index++}
        RETURNING ${ALERT_COLUMNS}
      `,
      [...values, alertId, userId]
    );
    if (result.rows.length === 0) {
      throw new Error("Alert not found");
    }
    return result.rows[0];
  } catch (error) {
    if (error.message === "Alert not found") throw error;
    if (error?.code === "23505") {
      throw new Error("Alert already exists");
    }
    if (error?.code === "23503") {
      throw new Error("Monitor not found");
    }
    throw error;
  }
};

export const deleteAlert = async (userId, alertId) => {
  const result = await pool.query(
    "DELETE FROM alerts WHERE id = $1 AND user_id = $2 RETURNING id",
    [alertId, userId]
  );
  if (result.rows.length === 0) {
    throw new Error("Alert not found");
  }
  return { id: result.rows[0].id };
};

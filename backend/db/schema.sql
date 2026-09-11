CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    plan VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'paid')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- MONITORS
CREATE TABLE IF NOT EXISTS monitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    url TEXT NOT NULL,
    check_interval_seconds INTEGER NOT NULL DEFAULT 300,
    current_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (current_status IN ('PENDING', 'UP', 'DOWN')),
    consecutive_failures INTEGER NOT NULL DEFAULT 0,
    last_checked_at TIMESTAMPTZ,
    next_check_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_monitors_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT check_interval_positive CHECK (check_interval_seconds > 0),

    CONSTRAINT consecutive_failures_positive CHECK (consecutive_failures >= 0)
);

-- CHECKS
CREATE TABLE IF NOT EXISTS checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monitor_id UUID NOT NULL,
    status_code INTEGER,
    response_time_ms INTEGER,
    success BOOLEAN NOT NULL,
    error_type VARCHAR(50),
    checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_checks_monitor
        FOREIGN KEY (monitor_id)
        REFERENCES monitors(id)
        ON DELETE CASCADE,

    CONSTRAINT response_time_positive
        CHECK (
            response_time_ms IS NULL
            OR response_time_ms >= 0
        )
);

-- ALERT LOGS
CREATE TABLE IF NOT EXISTS alert_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monitor_id UUID NOT NULL,
    alert_type VARCHAR(20) NOT NULL
        CHECK (alert_type IN ('DOWN', 'RECOVERY')),
    message TEXT NOT NULL,
    channel VARCHAR(20) NOT NULL DEFAULT 'EMAIL'
        CHECK (channel IN ('EMAIL')),
    delivery_status VARCHAR(20) NOT NULL DEFAULT 'SENT'
        CHECK (delivery_status IN ('SENT', 'FAILED')),
    provider_id TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_alert_logs_monitor
        FOREIGN KEY (monitor_id)
        REFERENCES monitors(id)
        ON DELETE CASCADE
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_monitors_user_id
ON monitors(user_id);

CREATE INDEX IF NOT EXISTS idx_monitors_next_check_at
ON monitors(next_check_at);

CREATE INDEX IF NOT EXISTS idx_monitors_status
ON monitors(current_status);

CREATE INDEX IF NOT EXISTS idx_checks_monitor_checked_at
ON checks(monitor_id, checked_at DESC);

CREATE INDEX IF NOT EXISTS idx_alert_logs_monitor_sent_at
ON alert_logs(monitor_id, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_users_email
ON users(email);

-- ALERTS (user-defined notification rules per monitor)
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    monitor_id UUID NOT NULL,
    channel VARCHAR(20) NOT NULL DEFAULT 'EMAIL' CHECK (channel IN ('EMAIL')),
    target VARCHAR(255) NOT NULL,
    on_down BOOLEAN NOT NULL DEFAULT TRUE,
    on_recovery BOOLEAN NOT NULL DEFAULT TRUE,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_alerts_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_alerts_monitor
        FOREIGN KEY (monitor_id)
        REFERENCES monitors(id)
        ON DELETE CASCADE,

    CONSTRAINT target_not_empty CHECK (char_length(trim(target)) > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_alerts_user_monitor_target
ON alerts(user_id, monitor_id, target);

CREATE INDEX IF NOT EXISTS idx_alerts_user_id
ON alerts(user_id);

CREATE INDEX IF NOT EXISTS idx_alerts_monitor_id
ON alerts(monitor_id);

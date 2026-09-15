// Typed REST client for the DownAlert backend API.
// Base URL comes from VITE_API_URL (see frontend/.env.example).

const rawBase = (import.meta as any).env?.VITE_API_URL as string | undefined;
export const API_URL = (rawBase && rawBase.trim() ? rawBase.trim() : "http://localhost:5000").replace(/\/$/, "");

const TOKEN_KEY = "downalert_token";

export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// ---------------------------------------------------------------------------
// API shapes (snake_case, exactly as the backend returns them)
// ---------------------------------------------------------------------------

export type Plan = "free" | "paid";
export type ApiMonitorStatus = "PENDING" | "UP" | "DOWN";

export interface ApiUser {
  id: string;
  email: string;
  plan: string;
  created_at: string;
  updated_at?: string;
}

export interface ApiMonitor {
  id: string;
  user_id: string;
  name: string;
  url: string;
  check_interval_seconds: number;
  current_status: ApiMonitorStatus;
  consecutive_failures: number;
  last_checked_at: string | null;
  next_check_at: string;
  created_at: string;
  updated_at: string;
}

export interface ApiCheck {
  id: string;
  monitor_id: string;
  status_code: number | null;
  response_time_ms: number | null;
  success: boolean;
  error_type: string | null;
  checked_at: string;
}

export interface ApiAlert {
  id: string;
  user_id: string;
  monitor_id: string;
  channel: string;
  target: string;
  on_down: boolean;
  on_recovery: boolean;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// UI shapes (camelCase, what Dashboard components consume)
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  plan: Plan;
  createdAt: string;
}

export type MonitorStatus = "operational" | "down" | "pending";

export interface Monitor {
  id: string;
  name: string;
  url: string;
  type: string;
  status: MonitorStatus;
  uptime: string;
  response: string;
  lastCheck: string;
  checkInterval: number;
  consecutiveFailures: number;
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  status: number;
  errors?: unknown;

  constructor(status: number, message: string, errors?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true } = options;
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (auth) {
    const token = getToken();
    if (!token) {
      throw new ApiError(401, "You are not logged in. Please log in again.");
    }
    headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Cannot reach the DownAlert API. Is the backend running?");
  }

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message =
      (data && typeof data.message === "string" && data.message) || `Request failed (${res.status})`;
    throw new ApiError(res.status, message, data?.errors);
  }

  return data as T;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const signup = async (email: string, password: string) => {
  const data = await request<{ user: ApiUser; token: string }>("/api/auth/signup", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
  setToken(data.token);
  return toUiUser(data.user);
};

export const login = async (email: string, password: string) => {
  const data = await request<{ user: ApiUser; token: string }>("/api/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
  setToken(data.token);
  return toUiUser(data.user);
};

export const me = async () => {
  const data = await request<{ user: ApiUser }>("/api/auth/me");
  return toUiUser(data.user);
};

export const logout = () => {
  clearToken();
};

// ---------------------------------------------------------------------------
// Monitors
// ---------------------------------------------------------------------------

export const listMonitors = async (): Promise<Monitor[]> => {
  const data = await request<{ monitors: ApiMonitor[] }>("/api/monitors");
  return data.monitors.map(toUiMonitor);
};

export const createMonitor = async (input: { name: string; url: string; check_interval_seconds: number }) => {
  const data = await request<{ monitor: ApiMonitor }>("/api/monitors", {
    method: "POST",
    body: input,
  });
  return toUiMonitor(data.monitor);
};

export const updateMonitor = async (
  id: string,
  patch: { name?: string; url?: string; check_interval_seconds?: number }
) => {
  const data = await request<{ monitor: ApiMonitor }>(`/api/monitors/${id}`, {
    method: "PATCH",
    body: patch,
  });
  return toUiMonitor(data.monitor);
};

export const deleteMonitor = async (id: string): Promise<void> => {
  await request(`/api/monitors/${id}`, { method: "DELETE" });
};

export const listChecks = async (monitorId: string, limit = 50): Promise<ApiCheck[]> => {
  const data = await request<{ checks: ApiCheck[] }>(
    `/api/monitors/${monitorId}/checks?limit=${limit}`
  );
  return data.checks;
};

export const runCheck = async (monitorId: string): Promise<Monitor> => {
  const data = await request<{ check: ApiCheck; monitor: ApiMonitor }>(
    `/api/monitors/${monitorId}/check`,
    { method: "POST" }
  );
  return hydrateMonitor(toUiMonitor(data.monitor), [data.check]);
};

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------

export const listAlerts = async (): Promise<ApiAlert[]> => {
  const data = await request<{ alerts: ApiAlert[] }>("/api/alerts");
  return data.alerts;
};

export const createAlert = async (input: {
  monitor_id: string;
  target: string;
  on_down?: boolean;
  on_recovery?: boolean;
}): Promise<ApiAlert> => {
  const data = await request<{ alert: ApiAlert }>("/api/alerts", {
    method: "POST",
    body: input,
  });
  return data.alert;
};

export const updateAlert = async (
  id: string,
  patch: { is_enabled?: boolean; target?: string; on_down?: boolean; on_recovery?: boolean }
): Promise<ApiAlert> => {
  const data = await request<{ alert: ApiAlert }>(`/api/alerts/${id}`, {
    method: "PATCH",
    body: patch,
  });
  return data.alert;
};

export const deleteAlert = async (id: string): Promise<void> => {
  await request(`/api/alerts/${id}`, { method: "DELETE" });
};

export const sendTestAlert = async (target: string): Promise<string> => {
  const data = await request<{ id: string }>("/api/alerts/test", {
    method: "POST",
    body: { target },
  });
  return data.id;
};

// ---------------------------------------------------------------------------
// Adapters + formatting
// ---------------------------------------------------------------------------

export const normalizePlan = (plan: string): Plan => (plan === "paid" ? "paid" : "free");

export const toUiUser = (u: ApiUser): User => ({
  id: u.id,
  email: u.email,
  plan: normalizePlan(u.plan),
  createdAt: u.created_at,
});

const toUiStatus = (s: ApiMonitorStatus): MonitorStatus =>
  s === "UP" ? "operational" : s === "DOWN" ? "down" : "pending";

export const toUiMonitor = (m: ApiMonitor): Monitor => ({
  id: m.id,
  name: m.name,
  url: m.url,
  type: "Website",
  status: toUiStatus(m.current_status),
  uptime: "—",
  response: "—",
  lastCheck: m.last_checked_at ? relativeTime(m.last_checked_at) : "Never",
  checkInterval: m.check_interval_seconds,
  consecutiveFailures: m.consecutive_failures,
});

/** Fill latency/uptime/last-check from real check rows (newest first). */
export const hydrateMonitor = (m: Monitor, checks: ApiCheck[]): Monitor => {
  if (checks.length === 0) return m;
  const latest = checks[0];
  const upCount = checks.filter((c) => c.success).length;
  return {
    ...m,
    response: latest.response_time_ms !== null ? `${latest.response_time_ms}ms` : "—",
    lastCheck: relativeTime(latest.checked_at),
    uptime: `${((upCount / checks.length) * 100).toFixed(2)}%`,
  };
};

export const relativeTime = (iso: string): string => {
  const diffMs = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diffMs) || diffMs < 0) return "Just now";
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
};

// ---------------------------------------------------------------------------
// Plan helpers (mirror backend/services/monitor.service.js limits)
// ---------------------------------------------------------------------------

export const isPaid = (plan: Plan): boolean => plan === "paid";

export const maxMonitors = (plan: Plan): number => (isPaid(plan) ? 5 : 1);

export const minInterval = (plan: Plan): number => (isPaid(plan) ? 60 : 300);

export const defaultInterval = (plan: Plan): number => (isPaid(plan) ? 60 : 300);

export const intervalLabel = (plan: Plan): string => (isPaid(plan) ? "1-minute" : "5-minute");

export const displayName = (email: string): string => {
  const local = email.split("@")[0] ?? email;
  const first = local.split(/[._-]+/)[0] ?? local;
  return first.charAt(0).toUpperCase() + first.slice(1);
};

export const friendlyApiError = (err: unknown): string => {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
};

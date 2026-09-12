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

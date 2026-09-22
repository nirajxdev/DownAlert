import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import pool from "./db/index.js";
import authRoutes from "./routes/auth.routes.js";
import alertsRoutes from "./routes/alerts.routes.js";
import monitorsRoutes from "./routes/monitors.routes.js";

const app = express();
app.set("trust proxy", 1);

// Security headers
app.use(helmet());

// Request logging (combined in production, dev otherwise)
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// CORS — comma-separated allowlist from CORS_ORIGIN, defaults to Vite dev.
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: (origin, cb) => {
      // Allow same-origin / curl / health checks with no Origin header.
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin ${origin}`));
    },
  })
);
app.use(express.json({ limit: "100kb" }));

// Rate limiting — strict on auth, lenient elsewhere.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many auth attempts, try again later." },
});
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, slow down." },
});
app.use("/api/auth", authLimiter);
app.use("/api", apiLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/alerts", alertsRoutes);
app.use("/api/monitors", monitorsRoutes);

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.status(200).json({
      success: true,
      message: "DownAlert API is running",
      database: "connected",
      timestamp: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({
      success: false,
      message: "Database connection error",
      error: error.message,
    });
  }
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Central error handler (must be last — catches CORS + JSON + unexpected errors)
app.use((err, req, res, _next) => {
  if (err?.message?.startsWith("CORS blocked")) {
    return res.status(403).json({ success: false, message: "Origin not allowed" });
  }
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "Invalid JSON body" });
  }
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

const port = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;

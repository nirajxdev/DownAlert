// Vercel serverless entry — re-exports the Express app without calling listen.
// Deploy `backend/` as its own Vercel project; all routes (/api/*) funnel here.
import app from "../server.js";

export default app;

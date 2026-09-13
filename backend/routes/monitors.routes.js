import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  createMonitorSchema,
  updateMonitorSchema,
  monitorIdParamSchema,
  checksQuerySchema,
} from "../validators/monitor.validator.js";
import {
  createMonitor,
  listMonitors,
  getMonitorById,
  updateMonitor,
  deleteMonitor,
  listChecks,
  runManualCheck,
} from "../services/monitor.service.js";

const router = express.Router();

// All monitor routes require authentication. Ownership (user_id)
// is enforced inside the service layer, never from client input.
router.use(authenticate);

const mapServiceError = (error) => {
  if (error.message === "Monitor not found") {
    return { status: 404, message: "Monitor not found" };
  }
  if (error.message === "Monitor limit reached") {
    return {
      status: 403,
      message: "Monitor limit reached for your plan. Upgrade to add more monitors.",
    };
  }
  if (error.message === "Check interval too frequent for free plan") {
    return {
      status: 403,
      message: "Free plan requires a check interval of at least 300 seconds.",
    };
  }
  return null;
};

// POST /api/monitors - Create a monitor
router.post("/", async (req, res) => {
  const validation = createMonitorSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid request data",
      errors: validation.error.issues,
    });
  }

  try {
    const monitor = await createMonitor(req.user.id, req.user.plan, validation.data);

    return res.status(201).json({
      success: true,
      message: "Monitor created successfully",
      monitor,
    });
  } catch (error) {
    console.error("Create monitor error:", error);

    const mapped = mapServiceError(error);
    if (mapped) {
      return res.status(mapped.status).json({ success: false, message: mapped.message });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// GET /api/monitors - List my monitors
router.get("/", async (req, res) => {
  try {
    const monitors = await listMonitors(req.user.id);

    return res.status(200).json({
      success: true,
      monitors,
    });
  } catch (error) {
    console.error("List monitors error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// GET /api/monitors/:id/checks - Check history for one of my monitors
router.get("/:id/checks", async (req, res) => {
  const paramValidation = monitorIdParamSchema.safeParse(req.params);

  if (!paramValidation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid monitor ID",
      errors: paramValidation.error.issues,
    });
  }

  const queryValidation = checksQuerySchema.safeParse(req.query);

  if (!queryValidation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid query parameters",
      errors: queryValidation.error.issues,
    });
  }

  try {
    const { checks, pagination } = await listChecks(
      req.user.id,
      paramValidation.data.id,
      queryValidation.data
    );

    return res.status(200).json({
      success: true,
      checks,
      pagination,
    });
  } catch (error) {
    console.error("List checks error:", error);

    if (error.message === "Monitor not found") {
      return res.status(404).json({
        success: false,
        message: "Monitor not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// POST /api/monitors/:id/check - Run an immediate probe for one of my monitors.
// Records the result in checks and updates the monitor status. Does not send
// email alerts — the worker handles DOWN/RECOVERY notifications on transitions.
router.post("/:id/check", async (req, res) => {
  const paramValidation = monitorIdParamSchema.safeParse(req.params);

  if (!paramValidation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid monitor ID",
      errors: paramValidation.error.issues,
    });
  }

  try {
    const { check, monitor } = await runManualCheck(req.user.id, paramValidation.data.id);

    return res.status(201).json({
      success: true,
      message: "Check completed successfully",
      check,
      monitor,
    });
  } catch (error) {
    console.error("Manual check error:", error);

    if (error.message === "Monitor not found") {
      return res.status(404).json({
        success: false,
        message: "Monitor not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// GET /api/monitors/:id - Get one of my monitors
router.get("/:id", async (req, res) => {
  const paramValidation = monitorIdParamSchema.safeParse(req.params);

  if (!paramValidation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid monitor ID",
      errors: paramValidation.error.issues,
    });
  }

  try {
    const monitor = await getMonitorById(req.user.id, paramValidation.data.id);

    return res.status(200).json({
      success: true,
      monitor,
    });
  } catch (error) {
    console.error("Get monitor error:", error);

    if (error.message === "Monitor not found") {
      return res.status(404).json({
        success: false,
        message: "Monitor not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// PATCH /api/monitors/:id - Update one of my monitors
router.patch("/:id", async (req, res) => {
  const paramValidation = monitorIdParamSchema.safeParse(req.params);

  if (!paramValidation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid monitor ID",
      errors: paramValidation.error.issues,
    });
  }

  const bodyValidation = updateMonitorSchema.safeParse(req.body);

  if (!bodyValidation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid request data",
      errors: bodyValidation.error.issues,
    });
  }

  try {
    const monitor = await updateMonitor(
      req.user.id,
      req.user.plan,
      paramValidation.data.id,
      bodyValidation.data
    );

    return res.status(200).json({
      success: true,
      message: "Monitor updated successfully",
      monitor,
    });
  } catch (error) {
    console.error("Update monitor error:", error);

    const mapped = mapServiceError(error);
    if (mapped) {
      return res.status(mapped.status).json({ success: false, message: mapped.message });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// DELETE /api/monitors/:id - Delete one of my monitors
router.delete("/:id", async (req, res) => {
  const paramValidation = monitorIdParamSchema.safeParse(req.params);

  if (!paramValidation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid monitor ID",
      errors: paramValidation.error.issues,
    });
  }

  try {
    await deleteMonitor(req.user.id, paramValidation.data.id);

    return res.status(200).json({
      success: true,
      message: "Monitor deleted successfully",
    });
  } catch (error) {
    console.error("Delete monitor error:", error);

    if (error.message === "Monitor not found") {
      return res.status(404).json({
        success: false,
        message: "Monitor not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;

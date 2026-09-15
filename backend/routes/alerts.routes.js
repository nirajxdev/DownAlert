import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  createAlertSchema,
  updateAlertSchema,
  alertIdParamSchema,
  testAlertSchema,
} from "../validators/alert.validator.js";
import {
  createAlert,
  listAlerts,
  getAlertById,
  updateAlert,
  deleteAlert,
} from "../services/alert.service.js";
import { sendTestEmail } from "../services/email.service.js";

const router = express.Router();

// All alert routes require authentication. Ownership (user_id)
// is enforced inside the service layer, never from client input.
router.use(authenticate);

// POST /api/alerts - Create a notification rule for one of my monitors
router.post("/", async (req, res) => {
  const validation = createAlertSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid request data",
      errors: validation.error.issues,
    });
  }

  try {
    const alert = await createAlert(req.user.id, validation.data);

    return res.status(201).json({
      success: true,
      message: "Alert created successfully",
      alert,
    });
  } catch (error) {
    console.error("Create alert error:", error);

    if (error.message === "Monitor not found") {
      return res.status(404).json({
        success: false,
        message: "Monitor not found",
      });
    }

    if (error.message === "Alert already exists") {
      return res.status(409).json({
        success: false,
        message: "An alert for this monitor and target already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// POST /api/alerts/test - Send a test email to verify delivery
router.post("/test", async (req, res) => {
  const validation = testAlertSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid request data",
      errors: validation.error.issues,
    });
  }

  try {
    const { id } = await sendTestEmail(validation.data.target);

    return res.status(200).json({
      success: true,
      message: "Test email sent successfully",
      id,
    });
  } catch (error) {
    console.error("Test alert error:", error);

    return res.status(502).json({
      success: false,
      message: "Failed to send test email",
    });
  }
});

// GET /api/alerts - List my alerts
router.get("/", async (req, res) => {
  try {
    const alerts = await listAlerts(req.user.id);

    return res.status(200).json({
      success: true,
      alerts,
    });
  } catch (error) {
    console.error("List alerts error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// GET /api/alerts/:id - Get one of my alerts
router.get("/:id", async (req, res) => {
  const paramValidation = alertIdParamSchema.safeParse(req.params);

  if (!paramValidation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid alert ID",
      errors: paramValidation.error.issues,
    });
  }

  try {
    const alert = await getAlertById(req.user.id, paramValidation.data.id);

    return res.status(200).json({
      success: true,
      alert,
    });
  } catch (error) {
    console.error("Get alert error:", error);

    if (error.message === "Alert not found") {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// PATCH /api/alerts/:id - Update one of my alerts
router.patch("/:id", async (req, res) => {
  const paramValidation = alertIdParamSchema.safeParse(req.params);

  if (!paramValidation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid alert ID",
      errors: paramValidation.error.issues,
    });
  }

  const bodyValidation = updateAlertSchema.safeParse(req.body);

  if (!bodyValidation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid request data",
      errors: bodyValidation.error.issues,
    });
  }

  try {
    const alert = await updateAlert(req.user.id, paramValidation.data.id, bodyValidation.data);

    return res.status(200).json({
      success: true,
      message: "Alert updated successfully",
      alert,
    });
  } catch (error) {
    console.error("Update alert error:", error);

    if (error.message === "Alert not found") {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    if (error.message === "Monitor not found") {
      return res.status(404).json({
        success: false,
        message: "Monitor not found",
      });
    }

    if (error.message === "Alert already exists") {
      return res.status(409).json({
        success: false,
        message: "An alert for this monitor and target already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// DELETE /api/alerts/:id - Delete one of my alerts
router.delete("/:id", async (req, res) => {
  const paramValidation = alertIdParamSchema.safeParse(req.params);

  if (!paramValidation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid alert ID",
      errors: paramValidation.error.issues,
    });
  }

  try {
    await deleteAlert(req.user.id, paramValidation.data.id);

    return res.status(200).json({
      success: true,
      message: "Alert deleted successfully",
    });
  } catch (error) {
    console.error("Delete alert error:", error);

    if (error.message === "Alert not found") {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;

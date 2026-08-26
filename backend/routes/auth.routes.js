import express from "express";
import { signup, login, getUserById } from "../services/auth.service.js";
import { signupSchema, loginSchema } from "../validators/auth.validator.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// POST /api/auth/signup - Register a new user
router.post("/signup", async (req, res) => {
  const validation = signupSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid request data",
      errors: validation.error.issues,
    });
  }

  try {
    const { user, token } = await signup(
      validation.data.email,
      validation.data.password
    );

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user,
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);

    if (error.message === "User already exists") {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// POST /api/auth/login - Log in an existing user
router.post("/login", async (req, res) => {
  const validation = loginSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid request data",
      errors: validation.error.issues,
    });
  }

  try {
    const { user, token } = await login(
      validation.data.email,
      validation.data.password
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);

    if (error.message === "invalid email or password") {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// GET /api/auth/me - Retrieve authenticated user profile
router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    if (error.message === "User not found") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;

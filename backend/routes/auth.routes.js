import express from "express";
import { signup } from "../services/auth.service.js";
import { signupSchema } from "../validators/auth.validator.js";

const router = express.Router();

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
    const user = await signup(
      validation.data.email,
      validation.data.password
    );

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user,
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

export default router;

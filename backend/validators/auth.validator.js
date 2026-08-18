import { z } from "zod";

export const signupSchema = z.object({
  email: z
    .string()
    .trim()
    .email("provide a valid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long"),
});

export default signupSchema;

import { z } from "zod";

export const createAlertSchema = z
  .object({
    monitor_id: z
      .string({ required_error: "Monitor ID is required" })
      .uuid("Monitor ID must be a valid UUID"),

    channel: z.enum(["EMAIL"]).default("EMAIL"),

    target: z
      .string({ required_error: "Target is required" })
      .trim()
      .min(1, "Target is required")
      .max(255, "Target must be at most 255 characters")
      .email("Target must be a valid email address"),

    on_down: z.boolean().default(true),

    on_recovery: z.boolean().default(true),

    is_enabled: z.boolean().default(true),
  })
  .strict();

export const updateAlertSchema = z
  .object({
    monitor_id: z.string().uuid("Monitor ID must be a valid UUID").optional(),

    channel: z.enum(["EMAIL"]).optional(),

    target: z
      .string()
      .trim()
      .min(1, "Target is required")
      .max(255, "Target must be at most 255 characters")
      .email("Target must be a valid email address")
      .optional(),

    on_down: z.boolean().optional(),

    on_recovery: z.boolean().optional(),

    is_enabled: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Nothing to update",
  });

export const alertIdParamSchema = z.object({
  id: z.string({ required_error: "Alert ID is required" }).uuid("Alert ID must be a valid UUID"),
});

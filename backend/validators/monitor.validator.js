import { z } from "zod";

const urlSchema = z
  .string({ required_error: "URL is required" })
  .trim()
  .min(1, "URL is required")
  .max(2048, "URL must be at most 2048 characters")
  .refine(
    (val) => {
      try {
        const parsed = new URL(val);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "URL must be a valid HTTP or HTTPS URL" }
  );

const nameSchema = z
  .string({ required_error: "Name is required" })
  .trim()
  .min(1, "Name is required")
  .max(100, "Name must be at most 100 characters");

const intervalSchema = z
  .number({ invalid_type_error: "Check interval must be a number" })
  .int("Check interval must be an integer")
  .min(60, "Check interval must be at least 60 seconds")
  .max(86400, "Check interval must be at most 86400 seconds")
  .default(300);

export const createMonitorSchema = z
  .object({
    name: nameSchema,
    url: urlSchema,
    check_interval_seconds: intervalSchema,
  })
  .strict();

export const updateMonitorSchema = z
  .object({
    name: nameSchema.optional(),
    url: urlSchema.optional(),
    check_interval_seconds: z
      .number({ invalid_type_error: "Check interval must be a number" })
      .int("Check interval must be an integer")
      .min(60, "Check interval must be at least 60 seconds")
      .max(86400, "Check interval must be at most 86400 seconds")
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Nothing to update",
  });

export const monitorIdParamSchema = z.object({
  id: z
    .string({ required_error: "Monitor ID is required" })
    .uuid("Monitor ID must be a valid UUID"),
});

export const checksQuerySchema = z.object({
  limit: z.coerce
    .number({ invalid_type_error: "Limit must be a number" })
    .int("Limit must be an integer")
    .min(1, "Limit must be at least 1")
    .max(100, "Limit must be at most 100")
    .default(50),
  offset: z.coerce
    .number({ invalid_type_error: "Offset must be an integer" })
    .int("Offset must be an integer")
    .min(0, "Offset must be at least 0")
    .default(0),
});

export const statsQuerySchema = z.object({
  window: z.coerce
    .number({ invalid_type_error: "Window must be a number" })
    .int("Window must be an integer")
    .min(1, "Window must be at least 1")
    .max(100, "Window must be at most 100")
    .default(50),
});

export const logsQuerySchema = z.object({
  limit: z.coerce
    .number({ invalid_type_error: "Limit must be a number" })
    .int("Limit must be an integer")
    .min(1, "Limit must be at least 1")
    .max(50, "Limit must be at most 50")
    .default(20),
  offset: z.coerce
    .number({ invalid_type_error: "Offset must be an integer" })
    .int("Offset must be an integer")
    .min(0, "Offset must be at least 0")
    .default(0),
});

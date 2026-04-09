import { z } from "zod/v4";

export const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100),
});

export const updateProjectSettingsSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  primary_color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color")
    .optional(),
  widget_style: z
    .enum(["carousel", "grid", "wall", "minimal"])
    .optional(),
  thank_you_message: z.string().max(500).optional(),
});

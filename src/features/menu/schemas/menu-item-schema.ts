import { z } from "zod";

export const menuItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(100, "Name must not exceed 100 characters."),

  label: z
    .string()
    .trim()
    .min(1, "Label is required.")
    .max(100, "Label must not exceed 100 characters."),

  route: z.string().trim().max(300, "Route must not exceed 300 characters."),

  icon: z.string().trim().max(100, "Icon name must not exceed 100 characters."),

  parentMenuItemId: z.string(),

  permissionId: z.string(),

  sortOrder: z
    .number()
    .int("Sort order must be a whole number.")
    .min(0, "Sort order cannot be negative."),
});

export type MenuItemFormValues = z.infer<typeof menuItemSchema>;

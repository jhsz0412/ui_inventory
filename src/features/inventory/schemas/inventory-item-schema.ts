import { z } from "zod";

export const inventoryItemSchema = z.object({
  itemCode: z
    .string()
    .trim()
    .min(1, "Item code is required.")
    .max(50, "Item code must not exceed 50 characters."),
  name: z
    .string()
    .trim()
    .min(1, "Item name is required.")
    .max(200, "Item name must not exceed 200 characters."),
  categoryId: z.string().uuid("Please select a valid category."),
  unitOfMeasureId: z.string().uuid("Please select a valid unit of measure."),
  description: z
    .string()
    .trim()
    .max(1000, "Description must not exceed 1000 characters."),
  reorderLevel: z
    .number()
    .finite("Enter a valid reorder level.")
    .min(0, "Reorder level cannot be negative."),
});

export type InventoryItemFormValues = z.infer<typeof inventoryItemSchema>;

export const updateInventoryItemSchema = inventoryItemSchema.omit({
  itemCode: true,
});

export type UpdateInventoryItemFormValues = z.infer<
  typeof updateInventoryItemSchema
>;

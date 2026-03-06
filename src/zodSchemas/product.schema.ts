import { z } from "zod";
import { TProductStatus } from "../types/index.types.js";
import { objectIdSchema } from "./users.schema.js";

export const createProductSchema = z.strictObject({
  name: z
    .string()
    .trim()
    .min(3, "Product name must be at least 3 characters")
    .max(30, "Product name must not exceed 30 characters")
    .toLowerCase(),

  description: z
    .string()
    .trim()
    .max(50, "Description must not exceed 50 characters")
    .optional(),

  price: z.coerce.number().min(0, "Price cannot be negative").optional(),

  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number")
    .min(0, "Quantity cannot be negative")
    .optional(),

  category: objectIdSchema,

  currency: z.string().trim().optional(),

  status: z.enum([TProductStatus.Active, TProductStatus.Disabled]).optional(),
});

export const updateProductSchema = createProductSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  })
  .strict();

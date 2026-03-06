import { z } from "zod";
import { TOrderStatus } from "../types/index.types.js";

export const CheckoutZodSchema = z
  .strictObject({
    shippingAddress: z.string().trim().optional(),
    phone: z
      .string()
      .trim()
      .min(8, "Phone number should be at least 8 characters")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const updateOrderStatusSchema = z.strictObject({
  status: z.enum(Object.values(TOrderStatus)),
});

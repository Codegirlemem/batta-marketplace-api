import * as z from "zod";
import { objectIdSchema } from "./users.schema.js";

export const addToCartZodSchema = z.strictObject({
  productId: objectIdSchema,
  quantity: z.coerce
    .number()
    .int()
    .min(1, "Quantity cannot be less that 1")
    .default(1),
});

import * as z from "zod";

export const categorySlugZodSchema = z
  .string()
  .trim()
  .min(5, "Slug field must have atleast 5 character")
  .max(30, "Slug field must not exceed 30 characters");

export const createCategoryZodSchema = z.strictObject({
  name: z
    .string()
    .min(5, "Category name must have atleast 5 character")
    .max(20, "Category name cannot exceed 20 characters"),
  description: z
    .string()
    .trim()
    .max(200, "Description cannot exceed 200 characters")
    .optional(),
  slug: categorySlugZodSchema,
});

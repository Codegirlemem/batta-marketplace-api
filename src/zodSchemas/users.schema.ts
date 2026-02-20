import * as z from "zod";

export const userIdSchema = z.string();
export const emailInputSchema = z.email("Invalid email address");
export const passwordInputSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(30, "Password must not exceed 30 characters");

export const usernameInputSchema = z
  .string()
  .min(3, "Username too short")
  .max(20, "Username must not exceed 20 characters");

export const addressZodSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().min(1, "Phone number is required"),
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().optional().default("Nigeria"),
  postalCode: z.string().optional(),
  isDefault: z.boolean().optional().default(false),
});

export const userBaseSchema = z.strictObject({
  email: emailInputSchema,
  password: passwordInputSchema,
  username: usernameInputSchema,
  phone: z.string().optional(),
  addresses: z
    .array(addressZodSchema)
    .max(5, "Maximum of 5 addresses allowed")
    .default([]),
});

export const acceptInviteSchema = z.strictObject({
  email: z.email("Invalid email address").optional(),
  password: passwordInputSchema,
  username: usernameInputSchema,
});

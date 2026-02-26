import * as z from "zod";

export const userIdSchema = z.string();
export const emailInputSchema = z.email();
export const passwordInputSchema = z
  .string()
  .trim()
  .min(6, "Password must be at least 6 characters")
  .max(30, "Password must not exceed 30 characters");

export const usernameInputSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must not exceed 20 characters");

export const userZodSchema = z.strictObject({
  email: emailInputSchema,
  password: passwordInputSchema,
  username: usernameInputSchema,
  phone: z
    .string()
    .trim()
    .min(1, "Phone number should have atleast 1 character")
    .optional(),
  address: z
    .string()
    .trim()
    .min(1, "Address should have atleast 1 character")
    .optional(),
});

export const updateUserSchema = userZodSchema
  .omit({ email: true, password: true })
  .partial()
  .refine(
    (data) =>
      Object.values(data).some(
        (value) => value !== undefined && value !== null && value !== "",
      ),
    {
      message: "At least one field must be provided",
    },
  );

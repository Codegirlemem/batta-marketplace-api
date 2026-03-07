import * as z from "zod";
import {
  emailInputSchema,
  passwordInputSchema,
  userZodSchema,
  usernameInputSchema,
} from "./users.schema.js";

export const signupZodSchema = userZodSchema
  .pick({
    email: true,
    password: true,
    username: true,
  })
  .strict();

export const loginZodSchema = userZodSchema.omit({ username: true }).strict();

export const userEmailSchema = z.strictObject({
  email: emailInputSchema,
});
export const passwordSchema = z.strictObject({
  password: passwordInputSchema,
});
export const usernameSchema = z.strictObject({
  username: usernameInputSchema,
});

export const tokenSchema = z.strictObject({
  token: z.string(),
});

export const acceptInviteSchema = z.strictObject({
  email: z.email().optional(),
  password: passwordInputSchema,
  username: usernameInputSchema,
});

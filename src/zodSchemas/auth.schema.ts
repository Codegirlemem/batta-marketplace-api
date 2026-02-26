import * as z from "zod";
import {
  emailInputSchema,
  passwordInputSchema,
  userZodSchema,
  usernameInputSchema,
} from "./users.schema.js";

export const loginZodSchema = userZodSchema.pick({
  email: true,
  password: true,
});

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

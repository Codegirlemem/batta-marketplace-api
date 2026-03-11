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
    role: true,
  })
  .strict();

export const loginZodSchema = userZodSchema
  .pick({ email: true, password: true })
  .strict();

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

export const acceptInviteSchema = userZodSchema
  .pick({
    password: true,
    username: true,
  })
  .extend({ email: z.email().optional() })
  .strict();

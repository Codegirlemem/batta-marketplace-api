import * as z from "zod";
import {
  passwordInputSchema,
  userBaseSchema,
  usernameInputSchema,
} from "./users.schema.js";

export const loginZodSchema = userBaseSchema.pick({
  email: true,
  password: true,
});

export const userEmailSchema = z.strictObject({
  email: z.email("Invalid email address"),
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

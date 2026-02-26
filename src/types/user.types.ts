import * as z from "zod";
import { updateUserSchema } from "../zodSchemas/users.schema.js";

export enum TUserRoles {
  User = "user",
  Admin = "admin",
}

export type TUserProfileUpdate = z.infer<typeof updateUserSchema>;

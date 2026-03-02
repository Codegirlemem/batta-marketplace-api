import { JwtPayload } from "jsonwebtoken";
import { TUserRoles } from "./index.types.js";
import mongoose from "mongoose";
import { InferSchemaType } from "mongoose";
import { userSchema } from "../models/user.model.js";

export interface AuthPayload extends JwtPayload {
  id: mongoose.Types.ObjectId;
  username: string;
  role: TUserRoles;
}

export type LeanUserModel = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
};

export type UserAuthPayload = LeanUserModel & JwtPayload;

import { Request } from "express";
import { UserAuthPayload } from "./auth.types.ts";

declare interface UserRequest extends Request {
  user?: UserAuthPayload;
}

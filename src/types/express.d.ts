import { Request } from "express";
import { AuthPayload } from "./auth.types.ts";

declare interface UserRequest extends Request {
  user?: AuthPayload;
}

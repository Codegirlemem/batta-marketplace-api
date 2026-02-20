import { JwtPayload } from "jsonwebtoken";
import { TUserRoles } from "./user.types.js";

export interface AuthPayload extends JwtPayload {
  id: string;
  username: string;
  role: TUserRoles;
}

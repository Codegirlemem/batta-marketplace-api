import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import AppError from "../utils/appError.js";
import { TUserRoles } from "../types/index.types.js";
import { UserRequest } from "../types/express.js";
import { getUserByID } from "../utils/index.utils.js";
import { AuthPayload } from "../types/auth.types.js";

export const isAuthenticated = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return next(new AppError("Access denied. Login to continue", 401));
    }

    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as AuthPayload;

    const user = await getUserByID(decodedToken.id);

    if (!user) {
      return next(new AppError("Access denied", 401));
    }

    req.user = {
      ...user,
      iat: decodedToken.iat,
      exp: decodedToken.exp,
    };

    next();
  } catch (error: unknown) {
    next(error);
  }
};

export const isAdmin = (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.user?.role !== TUserRoles.Admin) {
      return next(new AppError("Forbidden", 403));
    }

    next();
  } catch (error) {
    next();
  }
};

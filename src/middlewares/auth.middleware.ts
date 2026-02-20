import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import AppError from "../utils/appError.js";
import appEnv from "../config/env.config.js";
import { AuthPayload } from "../types/auth.types.js";
import { TUserRoles } from "../types/user.types.js";
import { UserRequest } from "../types/express.js";

const { JsonWebTokenError, NotBeforeError, TokenExpiredError } = jwt;

export const isAuthenticated = (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return next(new AppError("Unauthenticated user. Login to continue", 401));
    }

    const decodedToken = jwt.verify(token, appEnv.JWT_SECRET) as AuthPayload;
    req.user = decodedToken;

    next();
  } catch (error: unknown) {
    if (
      error instanceof JsonWebTokenError ||
      error instanceof TokenExpiredError ||
      error instanceof NotBeforeError
    ) {
      return next(
        new AppError("Invalid or expired token. Please login again", 401),
      );
    }
    next(error);
  }
};

export const isAdmin = (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.role !== TUserRoles.Admin) {
    return next(new AppError("Forbidden", 403));
  }

  next();
};

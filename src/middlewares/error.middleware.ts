import { Request, Response, NextFunction } from "express";
import env from "../config/env.config.js";
import AppError from "../utils/appError.js";
import { ZodError, z } from "zod";

const globalErrorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const isDev = env.NODE_ENV === "development";
  if (isDev) console.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: z.flattenError(err),
    });
  }

  if (err.code === 11000 && err.keyPattern?.email) {
    return res.status(400).json({
      success: false,
      message: "User already exists",
    });
  }

  return res.status(500).json({
    success: false,
    message: isDev ? err.message : "An internal server error occurred",
  });
};

export default globalErrorMiddleware;

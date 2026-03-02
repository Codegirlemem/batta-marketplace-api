import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError.js";
import { ZodError, z } from "zod";

const globalErrorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const isDev = process.env.NODE_ENV === "development";
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

  if (err.name === "ValidationError" && err.errors.slug) {
    return res.status(400).json({
      success: false,
      message: err.errors.slug.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: isDev ? err.message : "Something went wrong!",
  });
};

export default globalErrorMiddleware;

import { Request, Response, NextFunction } from "express";
import env from "../config/env.config.js";

const globalErrorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (env.NODE_ENV === "development") console.error(err);

  const statusCode = err.status ? err.status : 500;
  let message = "Something went wrong!";

  if (env.NODE_ENV === "development") {
    message = err.message ? err.message : "Something went wrong!";
  }

  res.status(statusCode).json({ success: false, message });
};

export default globalErrorMiddleware;

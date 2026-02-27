import { Response, NextFunction } from "express";
import { UserRequest } from "../types/express.js";

export const getAllCategories = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log("all categories");
  } catch (error) {
    next(error);
  }
};

export const createCategories = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log("create categories");
  } catch (error) {
    next(error);
  }
};

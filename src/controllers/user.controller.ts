import { Response, NextFunction } from "express";
import { UserRequest } from "../types/express.js";
import UserModel from "../models/user.model.js";
import AppError from "../utils/appError.js";
import { getUserByID } from "../utils/user.utils.js";
import { userIdSchema } from "../zodSchemas/users.schema.js";

export const getAllUsers = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const users = await UserModel.find().lean();

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserProfile = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = userIdSchema.parse(req.params.id ?? req.user!.id);

    const user = await getUserByID(id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

import { Response, NextFunction } from "express";
import * as z from "zod";
import { UserRequest } from "../types/express.js";
import UserModel from "../models/user.model.js";
import AppError from "../utils/appError.js";
import { getUserByID } from "../utils/user.utils.js";
import { updateUserSchema, userIdSchema } from "../zodSchemas/users.schema.js";
import { TUserProfileUpdate } from "../types/user.types.js";
import appEnv from "../config/env.config.js";

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
    if (!req.user) return next(new AppError("Unathourized", 401));

    const id = userIdSchema.parse(req.params.id ?? req.user.id);
    const user = await getUserByID(id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) return next(new AppError("Unathourized", 401));

    const id = userIdSchema.parse(req.user.id);
    const updates = updateUserSchema.parse(req.body);
    const allowedFields = ["username", "phone", "address"];

    const userUpdates = Object.fromEntries(
      Object.entries(updates).filter(
        ([key, value]) => allowedFields.includes(key) && value != undefined,
      ),
    ) as TUserProfileUpdate;

    const user = await UserModel.findByIdAndUpdate(id, userUpdates, {
      runValidators: true,
    });

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) return next(new AppError("Unathourized", 401));

    const id = userIdSchema.parse(req.user.id);
    const deletedUser = await UserModel.findByIdAndDelete(id);

    if (!deletedUser) {
      return next(new AppError("User not found", 404));
    }

    res.clearCookie(appEnv.COOKIE_NAME, {
      httpOnly: true,
      secure: appEnv.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res
      .status(200)
      .json({ success: true, message: "Profile deleted successfully" });
  } catch (error) {
    next(error);
  }
};

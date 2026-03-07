import fs from "fs/promises";
import { Response, NextFunction } from "express";
import { UserRequest } from "../types/express.js";
import UserModel from "../models/user.model.js";
import AppError from "../utils/appError.js";
import {
  deleteCloudImage,
  getUserByID,
  uploadToCloudinary,
} from "../utils/index.utils.js";
import {
  objectIdSchema,
  updateUserSchema,
} from "../zodSchemas/users.schema.js";
import {
  TCloudImage,
  TUserProfileUpdate,
  TUserUpdateData,
} from "../types/index.types.js";

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
    if (!req.user) return next(new AppError("Access denied", 401));

    const id = req.params.id
      ? objectIdSchema.parse(req.params.id)
      : req.user._id;

    const isSelf = req.user._id.toString() === id.toString();
    let user;

    if (isSelf) {
      user = req.user;
    } else {
      user = await getUserByID(id);
    }

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
  let avatar: TCloudImage | undefined;

  try {
    if (!req.user) return next(new AppError("Access denied", 401));

    const id = req.user._id;
    const updates = updateUserSchema.parse(req.body);
    const avatarPath = req.file?.path;
    const allowedFields = ["username", "phone", "address"];

    let user = await UserModel.findById(id);

    if (!user) {
      avatarPath && (await fs.unlink(avatarPath));
      return next(new AppError("User not found", 404));
    }
    const previousAvatar = user.avatar?.public_id;

    const userUpdates = Object.fromEntries(
      Object.entries(updates).filter(
        ([key, value]) => allowedFields.includes(key) && value != undefined,
      ),
    ) as TUserProfileUpdate;

    if (avatarPath) {
      avatar = (await uploadToCloudinary(avatarPath)) as TCloudImage;
    }

    const finalUpdate: TUserUpdateData = { ...userUpdates };

    if (avatar) finalUpdate.avatar = avatar;

    user.set({ ...finalUpdate });
    user = await user.save();

    previousAvatar && (await deleteCloudImage(previousAvatar));

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    avatar && (await deleteCloudImage(avatar.public_id));
    next(error);
  }
};

export const deleteUser = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) return next(new AppError("Access denied", 401));

    const id = objectIdSchema.parse(req.user._id);
    const deletedUser = await UserModel.findByIdAndDelete(id);

    if (!deletedUser) {
      return next(new AppError("User not found or already deleted", 404));
    }

    res.clearCookie(process.env.COOKIE_NAME!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res
      .status(200)
      .json({ success: true, message: "Profile deleted successfully" });
  } catch (error) {
    next(error);
  }
};

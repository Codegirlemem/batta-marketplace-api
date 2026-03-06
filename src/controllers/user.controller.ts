import { Response, NextFunction } from "express";
import { UserRequest } from "../types/express.js";
import UserModel from "../models/user.model.js";
import AppError from "../utils/appError.js";
import { getUserByID, uploadToCloudinary } from "../utils/index.utils.js";
import {
  objectIdSchema,
  updateUserSchema,
} from "../zodSchemas/users.schema.js";
import {
  TProductImage,
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
    if (!req.user) return next(new AppError("Unathourized", 401));

    const targetId = req.params.id || req.user._id;
    const id = objectIdSchema.parse(targetId);

    const isSelf = !req.params.id || req.params.id === req.user._id.toString();
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
  try {
    if (!req.user) return next(new AppError("Unathourized", 401));

    const id = objectIdSchema.parse(req.user._id);
    const updates = updateUserSchema.parse(req.body);
    const avatarPath = req.file?.path;
    const allowedFields = ["username", "phone", "address"];
    let avatar;

    if (avatarPath) {
      avatar = await uploadToCloudinary(avatarPath);
    }
    console.log(avatar);

    const userUpdates = Object.fromEntries(
      Object.entries(updates).filter(
        ([key, value]) => allowedFields.includes(key) && value != undefined,
      ),
    ) as TUserProfileUpdate;

    const finalUpdate: TUserUpdateData = { ...userUpdates };
    if (avatar) finalUpdate.avatar = avatar as TProductImage;

    const user = await UserModel.findByIdAndUpdate(id, finalUpdate, {
      runValidators: true,
      returnDocument: "after",
    }).lean();

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

    const id = objectIdSchema.parse(req.user._id);
    const deletedUser = await UserModel.findByIdAndDelete(id);

    if (!deletedUser) {
      return next(new AppError("User not found", 404));
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

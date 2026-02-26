import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { TUserRoles } from "../types/user.types.js";
import { AuthPayload } from "../types/auth.types.js";
import UserModel from "../models/user.model.js";
import AppError from "../utils/appError.js";
import appEnv from "../config/env.config.js";
import {
  acceptInviteSchema,
  loginZodSchema,
  passwordSchema,
  tokenSchema,
  userEmailSchema,
} from "../zodSchemas/auth.schema.js";
import { userZodSchema } from "../zodSchemas/users.schema.js";
import { hashToken } from "../utils/handleToken.js";
import InvitationModel from "../models/invite.model.js";

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const signupInfo = userZodSchema.parse(req.body);

    const userExists = await UserModel.findOne({
      email: signupInfo.email,
    }).lean();

    if (userExists) {
      return next(new AppError("User already exists", 400));
    }

    const newUser = new UserModel(signupInfo);

    await newUser.save();

    return res
      .status(201)
      .json({ success: true, message: "User created succesfully" });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const loginInfo = loginZodSchema.parse(req.body);

    const foundUser = await UserModel.findOne({
      email: loginInfo.email,
    }).select("+password");

    if (!foundUser) {
      return next(new AppError("Invalid credentials", 401));
    }

    const isValid = await foundUser.comparePassword(loginInfo.password);

    if (!isValid) {
      return next(new AppError("Invalid credentials", 401));
    }

    const payload: AuthPayload = {
      id: foundUser._id.toString(),
      username: foundUser.username,
      role: foundUser.role,
    };
    const token = jwt.sign(payload, appEnv.JWT_SECRET, {
      expiresIn: "15m",
    });

    res.cookie(appEnv.COOKIE_NAME, token, {
      httpOnly: true,
      secure: appEnv.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).json({ success: true, message: "Login successful" });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie(appEnv.COOKIE_NAME, {
    httpOnly: true,
    secure: appEnv.NODE_ENV === "production",
    sameSite: "lax",
  });

  return res
    .status(200)
    .json({ success: true, message: "Logged out successfully" });
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = userEmailSchema.parse(req.body);
    const foundUser = await UserModel.findOne({ email });

    if (!foundUser) {
      return next(new AppError("User not found", 404));
    }

    const rawToken = foundUser.createPasswordResetToken();

    await foundUser.save({ validateBeforeSave: false });
    console.log(rawToken);
    return res
      .status(200)
      .json({ success: true, message: "Reset token sent", token: rawToken });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token } = tokenSchema.parse(req.params);
    const { password } = passwordSchema.parse(req.body);

    const hashedToken = hashToken(token);

    const foundUser = await UserModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select("+password +passwordResetToken +passwordResetExpires");

    if (!foundUser) {
      return next(new AppError("Invalid of expired token", 400));
    }

    foundUser.password = password;
    foundUser.set({
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
    });

    await foundUser.save();

    return res
      .status(200)
      .json({ success: true, message: "Password reset succefful" });
  } catch (error) {
    next(error);
  }
};

export const acceptAdminInvite = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { token } = tokenSchema.parse(req.params);
    const adminInfo = acceptInviteSchema.parse(req.body);
    const hashedToken = hashToken(token);

    const existingInvite = await InvitationModel.findOne(
      {
        token: hashedToken,
        expiresAt: { $gt: new Date() },
        used: false,
      },
      null,
      { session },
    );

    if (!existingInvite) {
      throw new AppError("invalid or expired invitation", 400);
    }

    if (adminInfo.email && adminInfo.email !== existingInvite.email) {
      throw new AppError("invalid credentials", 400);
    }

    const existingUser = await UserModel.findOne(
      {
        email: existingInvite.email,
      },
      null,
      { session },
    );

    if (existingUser) {
      throw new AppError("User already exists", 400);
    }

    const newAdmin = new UserModel({
      ...adminInfo,
      email: existingInvite.email,
      role: TUserRoles.Admin,
    });

    await newAdmin.save({ session });

    existingInvite.set({ used: true, usedAt: new Date() });

    await existingInvite.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res
      .status(201)
      .json({ success: true, message: "Admin account created successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

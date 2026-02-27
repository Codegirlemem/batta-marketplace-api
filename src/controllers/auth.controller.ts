import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthPayload } from "../types/auth.types.js";
import UserModel from "../models/user.model.js";
import AppError from "../utils/appError.js";
import {
  loginZodSchema,
  passwordSchema,
  tokenSchema,
  userEmailSchema,
} from "../zodSchemas/auth.schema.js";
import { userZodSchema } from "../zodSchemas/users.schema.js";
import { hashToken } from "../utils/handleToken.js";

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
    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "15m",
    });

    res.cookie(process.env.COOKIE_NAME!, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).json({ success: true, message: "Login successful" });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie(process.env.COOKIE_NAME!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
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

    foundUser.set({
      password,
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

import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import UserModel from "../models/user.model.js";
import AppError from "../utils/appError.js";
import { UserRequest } from "../types/express.js";
import InvitationModel from "../models/invite.model.js";
import { userIdSchema } from "../zodSchemas/users.schema.js";
import {
  acceptInviteSchema,
  tokenSchema,
  userEmailSchema,
} from "../zodSchemas/auth.schema.js";
import { hashToken } from "../utils/handleToken.js";
import { TUserRoles } from "../types/user.types.js";

export const getAllAdminInvites = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const invites = await InvitationModel.find().lean();

    return res.status(200).json({
      success: true,
      message: "Admin invitations retrieved successfully",
      data: invites,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminInvite = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = userIdSchema.parse(req.params.id);
    const invite = await InvitationModel.findById(id).lean();

    if (!invite) {
      return next(new AppError("Invitation not found", 404));
    }

    return res.status(200).json({
      success: true,
      message: "Admin invitation retrieved successfully",
      data: invite,
    });
  } catch (error) {
    next(error);
  }
};

export const createAdminInvite = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }
    const id = userIdSchema.parse(req.user.id);

    const { email } = userEmailSchema.parse(req.body);

    const existingUser = await UserModel.findOne({
      email: email,
    }).lean();

    if (existingUser) {
      return next(new AppError("User already exists", 400));
    }

    const existingInvite = await InvitationModel.findOne({
      email,
      used: false,
      expiresAt: { $gt: new Date() },
    }).lean();

    if (existingInvite) {
      return next(new AppError("Active invitation already exists", 400));
    }

    const newInvitation = new InvitationModel({
      email,
      invitedBy: id,
    });

    const rawToken = newInvitation.createInviteToken();

    await newInvitation.save();

    res.status(201).json({
      success: true,
      message: "Invitation sent successfully",
      ...(process.env.NODE_ENV === "development" && { data: rawToken }),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAdminInvite = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = userIdSchema.parse(req.params.id);
    const deletedInvite = await InvitationModel.findByIdAndDelete(id);

    if (!deletedInvite) {
      return next(new AppError("Invitation not found", 404));
    }

    return res
      .status(200)
      .json({ success: true, message: "Invitation deleted successfully" });
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

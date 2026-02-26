import { Response, NextFunction } from "express";
import UserModel from "../models/user.model.js";
import AppError from "../utils/appError.js";
import { UserRequest } from "../types/express.js";
import InvitationModel from "../models/invite.model.js";
import appEnv from "../config/env.config.js";
import { userIdSchema } from "../zodSchemas/users.schema.js";
import { userEmailSchema } from "../zodSchemas/auth.schema.js";

export const getAllInvites = async (
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

export const getInvite = async (
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
      ...(appEnv.NODE_ENV === "development" && { data: rawToken }),
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

import mongoose from "mongoose";
import UserModel from "../models/user.model.js";

export const getUserByID = async (id: mongoose.Types.ObjectId) => {
  const user = await UserModel.findById(id)
    .select("-password -passwordResetToken -passwordResetExpires")
    .lean();
  return user;
};

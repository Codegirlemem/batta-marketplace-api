import UserModel from "../models/user.model.js";

export const getUserByID = async (id: string) => {
  const user = await UserModel.findById(id).select("-password");
  return user;
};

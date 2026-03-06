import fs from "fs/promises";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import UserModel from "../models/user.model.js";
import { QueryFilter } from "mongoose";
import ProductModel, { productSchema } from "../models/product.model.js";
import { TProductStatus } from "../types/index.types.js";
import AppError from "./appError.js";

export const getUserByID = async (id: mongoose.Types.ObjectId) => {
  const user = await UserModel.findById(id)
    .select("-password -passwordResetToken -passwordResetExpires")
    .lean();
  return user;
};

export const productFilter: QueryFilter<typeof productSchema> = {
  status: { $in: [TProductStatus.Active, TProductStatus.Disabled] },
};

export const getCartProduct = async (
  id: mongoose.Types.ObjectId,
  quantity: number,
) => {
  const product = await ProductModel.findOne({
    _id: id,
    status: TProductStatus.Active,
  }).lean();

  if (!product) {
    throw new AppError("Product not found", 400);
  }

  if (product.quantity < quantity) {
    throw new AppError("Available quantity not sufficient", 400);
  }

  return product;
};

export const uploadToCloudinary = async (filePath: string | string[]) => {
  try {
    if (typeof filePath === "string") {
      const avatar = await cloudinary.uploader.upload(filePath, {
        folder: "avatars",
      });
      await fs.unlink(filePath);
      return { secure_url: avatar.secure_url, public_id: avatar.public_id };
    }

    if (Array.isArray(filePath)) {
      const uploads = filePath.map(async (path) => {
        const product = await cloudinary.uploader.upload(path, {
          folder: "products",
        });
        await fs.unlink(path);

        return { secure_url: product.secure_url, public_id: product.public_id };
      });

      return await Promise.all(uploads);
    }

    throw new AppError("Invalid path format provided", 400);
  } catch (error) {
    throw new AppError(
      `Failed to upload ${typeof filePath === "string" ? "avatar" : "product images"}`,
      400,
    );
  }
};

export const allowedFiles = ["image/jpeg", "image/png", "image/webp"];

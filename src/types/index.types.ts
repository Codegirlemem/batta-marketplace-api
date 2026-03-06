import * as z from "zod";
import { updateUserSchema } from "../zodSchemas/users.schema.js";
import { InferSchemaType } from "mongoose";
import { cartSchema } from "../models/cart.model.js";
import {
  createProductSchema,
  updateProductSchema,
} from "../zodSchemas/product.schema.js";

export enum TUserRoles {
  User = "user",
  Admin = "admin",
}

export type TUserProfileUpdate = z.infer<typeof updateUserSchema>;
export type TUserUpdateData = TUserProfileUpdate & { avatar?: TProductImage };

export enum TProductStatus {
  Active = "active",
  Disabled = "disabled",
  Deleted = "deleted",
}

export type TProductFilter = {
  name?: string;
  category?: string;
  status: { $in: TProductStatus[] };
};

export type TProductImage = {
  secure_url: string;
  public_id: string;
};

export type TProductDoc = z.infer<typeof createProductSchema>;
export type TProductUpdate = z.infer<typeof updateProductSchema>;
export type TProductUpdateDoc = TProductUpdate & { images?: TProductImage[] };
export type TProductSchema = TProductDoc & {
  deletedAt?: Date | null;
  deletedBy?: string | null;
  images?: TProductImage[];
};
export type TCartDocument = InferSchemaType<typeof cartSchema>;

export enum TOrderStatus {
  Pending = "pending",
  Processing = "processing",
  Shipped = "shipped",
  Delivered = "delivered",
  Cancelled = "cancelled",
}

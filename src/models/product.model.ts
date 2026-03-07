import { model, Schema, Types } from "mongoose";
import { TProductStatus } from "../types/index.types.js";

const productImageSchema = new Schema(
  {
    secure_url: String,
    public_id: String,
  },
  { _id: false },
);

export const productSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "Product name is required"],
      minLength: [3, "Product name must be atleast 3 characters"],
      maxLength: [30, "Product name must not exceed 50 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxLength: [50, "Description must not exceed 50 characters"],
    },
    price: {
      type: Number,
      default: 0,
      min: [0, "Price cannot be less than 0"],
    },
    currency: { type: String, default: "NGN", trim: true },
    quantity: {
      type: Number,
      default: 0,
      min: [0, "Quantity cannot be less than 0"],
    },
    category: {
      type: Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
    },
    images: {
      type: [productImageSchema],
      default: [],
      validate: {
        validator: (arr: any[]) => !arr || arr.length <= 5,
        message: "Maximum 5 images allowed",
      },
    },
    status: {
      type: String,
      enum: {
        values: Object.values(TProductStatus),
        message: `{VALUE} is not supported`,
      },
      default: TProductStatus.Active,
    },
    deletedBy: { type: Types.ObjectId, ref: "User" },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

productSchema.index(
  { category: 1, name: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);

productSchema.index({ name: 1 });

productSchema.pre("save", function () {
  if (this.isNew || this.isModified("quantity")) {
    this.status =
      this.quantity < 1 ? TProductStatus.Disabled : TProductStatus.Active;
  }
});

productSchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate() as any;

  if (update.status) return;

  update.quantity < 1
    ? this.set({ status: TProductStatus.Disabled })
    : this.set({ status: TProductStatus.Active });
});

const ProductModel = model("Product", productSchema);

export default ProductModel;

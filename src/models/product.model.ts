import { model, Schema, Types } from "mongoose";
import { TProductStatus } from "../types/index.types.js";

const productSchema = new Schema(
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
    price: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: "NGN", trim: true },
    quantity: { type: Number, default: 0, min: 0 },
    category: {
      type: Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
    },
    imageUrl: { type: String, trim: true },
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
  { name: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);

productSchema.pre("save", function () {
  if ((this.isNew || this.isModified("quantity")) && this.quantity < 1) {
    this.status = TProductStatus.Disabled;
  }
});

productSchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate() as any;

  if (update.quantity < 1) {
    this.set({ status: TProductStatus.Disabled });
  }
});

const ProductModel = model("Product", productSchema);

export default ProductModel;

import { model, Schema, Types } from "mongoose";
import { TOrderStatus } from "../types/index.types.js";

const orderItemSchema = new Schema({
  product: {
    type: Types.ObjectId,
    ref: "Product",
    required: [true, "Product is required"],
  },
  productName: {
    type: String,
    required: [true, "Product name required"],
  },
  quantity: {
    type: Number,
    default: 1,
    min: [1, "Quantity cannot be less than 1"],
  },
  priceAtPurchase: {
    type: Number,
    default: 0,
    min: [0, "Price cannot be less than 0"],
  },
});

export const orderSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "User Id is required"],
    },
    items: {
      type: [orderItemSchema],
      default: () => [],
    },
    totalItems: {
      type: Number,
      required: true,
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(TOrderStatus),
        message: `{VALUE} is not supported`,
      },
      default: TOrderStatus.Pending,
    },
    shippingAddress: {
      type: String,
      trim: true,
      required: true,
    },
    phone: {
      type: String,
      trim: true,
      minLength: [8, "Phone number must be atleast 8 characters"],
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

orderSchema.pre("save", function () {
  if (this.isModified("items")) {
    this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
    this.totalPrice = this.items.reduce(
      (sum, item) => sum + item.quantity * item.priceAtPurchase,
      0,
    );
  }
});

export const OrderModel = model("Order", orderSchema);

export default OrderModel;

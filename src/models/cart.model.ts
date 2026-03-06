import { model, Schema, Types } from "mongoose";

const cartItemSchema = new Schema({
  product: {
    type: Types.ObjectId,
    ref: "Product",
    required: [true, "Product is required"],
  },
  quantity: {
    type: Number,
    default: 1,
    min: [1, "Quantity cannot be less than 1"],
  },
  priceAtAddition: {
    type: Number,
    default: 0,
    min: [0, "Price cannot be less than 0"],
  },
});

export const cartSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      unique: true,
      select: false,
      required: [true, "User Id is required"],
    },
    items: {
      type: [cartItemSchema],
      default: () => [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  },
);

cartSchema.virtual("cartCount").get(function () {
  return this.items.length;
});

cartSchema.virtual("totalItems").get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

cartSchema.virtual("totalPrice").get(function () {
  return this.items.reduce(
    (sum, item) => sum + item.quantity * item.priceAtAddition,
    0,
  );
});

const CartModel = model("Cart", cartSchema);

export default CartModel;

import { Response, NextFunction } from "express";
import { UserRequest } from "../types/express.js";
import AppError from "../utils/appError.js";
import CartModel from "../models/cart.model.js";
import mongoose from "mongoose";
import ProductModel from "../models/product.model.js";
import OrderModel from "../models/order.model.js";
import {
  CheckoutZodSchema,
  updateOrderStatusSchema,
} from "../zodSchemas/order.schema.js";
import {
  TOrderStatus,
  TProductStatus,
  TUserRoles,
} from "../types/index.types.js";
import { objectIdSchema } from "../zodSchemas/users.schema.js";
import UserModel from "../models/user.model.js";

export const getAllOrders = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const orders = await OrderModel.find()
      .populate({ path: "user", select: "name email" })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Orders retrieved succesffully",
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }

    const orders = await OrderModel.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("items.product", "images")
      .lean();

    return res.status(200).json({
      success: true,
      message: "Orders retrieved succesffully",
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }

    const orderId = objectIdSchema.parse(req.params.id);

    const order = await OrderModel.findById(orderId)
      .populate("items.product", "images")
      .lean();

    if (!order) return next(new AppError("Order not found", 404));

    if (
      req.user.role === TUserRoles.User &&
      order.user.toString() !== req.user._id.toString()
    ) {
      return next(new AppError("Order not found", 404));
    }

    return res.status(200).json({
      success: true,
      message: "Order retrieved succesffully as an admin",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return next(new AppError("Unauthorized access", 401));
    }
    const data = CheckoutZodSchema.parse(req.body);

    const cart = await CartModel.findById({
      _id: req.user.cart,
    }).populate("items.product", "name price quantity status images");

    if (!cart || cart.items.length === 0) {
      return next(new AppError("Cart is empty", 400));
    }
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product as any;
      if (product.quantity < item.quantity) {
        return next(
          new AppError(`Not enough stock for product: ${product.name}`, 400),
        );
      }

      if (product.status !== TProductStatus.Active) {
        return next(
          new AppError(`Product: ${product.name} is no longer available`, 400),
        );
      }

      orderItems.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        priceAtPurchase: product.price,
      });
    }

    const order = new OrderModel({
      user: req.user._id,
      items: orderItems,
      shippingAddress:
        data.shippingAddress || req.user.address || "No address provided",
      phone: data.phone,
      status: TOrderStatus.Pending,
      paidAt: null,
    });

    await order.save();

    cart.set({ items: [] });
    await cart.save();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const payOrder = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }
    const order = await OrderModel.findOne({
      _id: req.params.id,
      status: TOrderStatus.Pending,
    }).session(session);

    if (!order) throw new AppError("Order not found", 404);
    if (!order.shippingAddress)
      throw new AppError(
        "Shipping address must be provided before payment",
        404,
      );

    if (!order.user.equals(req.user._id))
      throw new AppError("Order not found", 400);

    for (const item of order.items) {
      const product = await ProductModel.findOne({
        _id: item.product,
        status: TProductStatus.Active,
      }).session(session);

      if (!product)
        throw new AppError(`Product not found: ${item.productName}`, 404);

      if (product.quantity < item.quantity)
        throw new AppError(
          `Not enough stock for product: ${product.name}`,
          400,
        );

      product.quantity -= item.quantity;
      await product.save({ session });

      item.productName = product.name;
      item.priceAtPurchase = product.price;
    }

    // 4️⃣ Mark the order as paid and status as processing
    order.paidAt = new Date();
    order.status = TOrderStatus.Processing;

    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    const responseData = {
      orderId: order._id,
      status: order.status,
      totalPrice: order.totalPrice,
      paidAt: order.paidAt,
      message: "Payment confirmed",
    };

    res.status(201).json({
      success: true,
      message: "Payment successful",
      data: responseData,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

export const cancelOrder = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) throw new AppError("Unauthorized", 401);

    const orderId = objectIdSchema.parse(req.params.id);

    const order = await OrderModel.findOne({
      _id: orderId,
      user: req.user._id,
    }).session(session);

    if (!order) throw new AppError("Order not found", 404);

    if (order.status !== TOrderStatus.Pending)
      throw new AppError("Cannot cancel order already paid or processed", 400);

    // Restore items back to user's cart
    let cart = await CartModel.findById(req.user.cart).session(session);

    if (!cart) {
      cart = new CartModel({ user: req.user._id, items: [] });
    }

    for (const orderItem of order.items) {
      const existingCartItem = cart.items.find((item) =>
        item.product.equals(orderItem.product),
      );

      if (existingCartItem) {
        existingCartItem.quantity += orderItem.quantity;
      } else {
        cart.items.push({
          product: orderItem.product,
          quantity: orderItem.quantity,
        });
      }
    }

    const updatedCart = await cart.save({ session });

    await UserModel.findByIdAndUpdate(req.user._id, {
      cart: updatedCart._id,
    }).session(session);

    order.status = TOrderStatus.Cancelled;

    await order.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Order cancelled and items restored to cart",
      data: order,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

export const updateOrderStatus = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }

    const orderId = objectIdSchema.parse(req.params.id);
    const { status } = updateOrderStatusSchema.parse(req.body);

    const order = await OrderModel.findById(orderId);

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    if (
      order.status === TOrderStatus.Cancelled ||
      order.status === TOrderStatus.Delivered
    ) {
      return next(new AppError(`Cannot update a ${order.status} order`, 400));
    }

    order.set({ status: status });

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: updatedOrder,
    });
  } catch (err) {
    next(err);
  }
};

export const updateOrder = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }

    const orderId = objectIdSchema.parse(req.params.id);
    const data = CheckoutZodSchema.parse(req.body);

    const update = Object.fromEntries(
      Object.entries(data).filter(
        ([_, value]) => value !== undefined && value !== null && value !== "",
      ),
    );

    const order = await OrderModel.findOneAndUpdate(
      { _id: orderId, user: req.user._id },
      update,
      {
        runValidators: true,
        returnDocument: "after",
      },
    );

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

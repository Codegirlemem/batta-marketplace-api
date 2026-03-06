import { Response, NextFunction } from "express";
import { UserRequest } from "../types/express.js";
import { objectIdSchema } from "../zodSchemas/users.schema.js";
import AppError from "../utils/appError.js";
import { addToCartZodSchema } from "../zodSchemas/cart.schema.js";
import CartModel from "../models/cart.model.js";
import { getCartProduct } from "../utils/index.utils.js";
import UserModel from "../models/user.model.js";

export const addToCart = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }
    const user = objectIdSchema.parse(req.user._id);
    const { productId, quantity } = addToCartZodSchema.parse(req.body);
    const cartId = req.user.cart;
    let cart;

    const product = await getCartProduct(productId, quantity);

    if (!cartId) {
      cart = new CartModel({
        user,
        items: [
          {
            product: productId,
            quantity,
            priceAtAddition: product.price,
          },
        ],
      });

      const savedCart = await cart.save();
      await UserModel.findByIdAndUpdate(req.user._id, { cart: cart._id });

      return res.status(200).json({
        success: true,
        message: "Product added to cart",
        data: savedCart,
      });
    }

    cart = await CartModel.findById(cartId);

    if (!cart) {
      return next(new AppError("User cart not found", 404));
    }

    // check if cartItem exist in cart
    const cartItem = cart.items.find((item) => item.product.equals(productId));

    // if cartItem exist
    if (cartItem) {
      const updatedQty = cartItem.quantity + quantity;

      if (product.quantity < updatedQty) {
        return next(
          new AppError(`Only ${product.quantity} is available.`, 400),
        );
      }

      cartItem.quantity = updatedQty;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        priceAtAddition: product.price,
      });
    }
    const updatedCart = await cart.save();

    return res.status(200).json({
      success: true,
      message: "Product added to cart",
      data: updatedCart,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartQuantity = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }

    const cartItemId = objectIdSchema.parse(req.params.id);
    const { productId, quantity } = addToCartZodSchema.parse(req.body);

    await getCartProduct(productId, quantity);

    const updatedCart = await CartModel.findOneAndUpdate(
      { _id: req.user.cart, user: req.user._id, "items._id": cartItemId },
      { $set: { "items.$.quantity": quantity } },
      { new: true },
    );

    if (!updatedCart) {
      return next(new AppError("Item not found", 404));
    }

    return res.status(200).json({
      success: true,
      message: "Cart quantity updated",
      data: updatedCart,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCartItem = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }
    const cartItemId = objectIdSchema.parse(req.params.id);

    const updatedCart = await CartModel.findOneAndUpdate(
      { _id: req.user.cart, user: req.user._id },
      { $pull: { items: { _id: cartItemId } } },
      { new: true },
    );

    if (!updatedCart) {
      return next(new AppError("Item not found", 404));
    }

    return res.status(200).json({
      success: true,
      message: "Item removed from cart",
      data: updatedCart,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserCart = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }
    const targetId = req.params.id
      ? objectIdSchema.parse(req.params.id)
      : req.user._id;
    let cart;

    if (req.params.id) {
      cart = await CartModel.findOne({ user: targetId }).populate({
        path: "items.product",
        select: "name price status images",
      });
    } else {
      if (!req.user.cart) {
        cart = { items: [] };
        //   return next(new AppError("User has no cart", 404));
      } else {
        cart = await CartModel.findById(req.user.cart).populate({
          path: "items.product",
          select: "name price status images",
        });
      }
    }

    if (!cart) {
      cart = { items: [] };
    }

    return res.status(200).json({
      success: true,
      message: "User cart retrieved successfully",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCarts = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const carts = await CartModel.find().populate({
      path: "items.product",
      select: "name price status images",
    });

    return res.status(200).json({
      success: true,
      message: "All user carts retrieved",
      data: carts,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserCartById = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = objectIdSchema.parse(req.params.id);
    const cart = await CartModel.findOne({ user }).populate({
      path: "items.product",
      select: "name price status images",
    });
    if (!cart) {
      return next(new AppError("User cart not found", 404));
    }

    return res.status(200).json({
      success: true,
      message: "All user carts retrieved",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

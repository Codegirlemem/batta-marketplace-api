import express from "express";

import { isAdmin, isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  addToCart,
  deleteCartItem,
  getAllCarts,
  getUserCart,
  updateCartQuantity,
} from "../controllers/cart.controller.js";

const router = express.Router();

// Authenticated user route
router.get("/user/cart", isAuthenticated, getUserCart);
router.post("/user/cart", isAuthenticated, addToCart);
router.patch("/user/cart/:id", isAuthenticated, updateCartQuantity);
router.delete("/user/cart/:id", isAuthenticated, deleteCartItem);

// Admin only route
router.get("/admin/users/:id/cart", isAuthenticated, isAdmin, getUserCart);
router.get("/admin/carts", isAuthenticated, isAdmin, getAllCarts);

export default router;

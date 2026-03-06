import express from "express";
import { isAdmin, isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  cancelOrder,
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  payOrder,
  updateOrder,
  updateOrderStatus,
} from "../controllers/order.controller.js";

const router = express.Router();

router.get("/orders/me", isAuthenticated, getMyOrders);
router.get("/orders/:id", isAuthenticated, getOrderById);
router.post("/orders/checkout", isAuthenticated, createOrder);
router.patch("/orders/:id", isAuthenticated, updateOrder);
router.patch("/orders/:id/pay", isAuthenticated, payOrder);
router.patch("/orders/:id/cancel", isAuthenticated, cancelOrder);

router.get("/admin/orders", isAuthenticated, isAdmin, getAllOrders);
router.patch("/admin/orders/:id", isAuthenticated, isAdmin, updateOrderStatus);

export default router;

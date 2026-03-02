import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  getProductsByCategory,
  updateProduct,
} from "../controllers/product.controller.js";
import { isAdmin, isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/products", getAllProducts);
router.get("/categories/:slug/products", getProductsByCategory);
router.get("/products/:id", getProductById);

// Admin only routes
router.post("/products", isAuthenticated, isAdmin, createProduct);
router.put("/products/:id", isAuthenticated, isAdmin, updateProduct);
router.delete("/products/:id", isAuthenticated, isAdmin, deleteProduct);

export default router;

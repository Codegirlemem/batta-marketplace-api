import express from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryBySlug,
  updateCategory,
} from "../controllers/category.controller.js";
import { isAdmin, isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

// public route
router.get("/", getAllCategories);
router.get("/:slug", getCategoryBySlug);

// Admin only route
router.post("/", isAuthenticated, isAdmin, createCategory);
router.put("/:slug", isAuthenticated, isAdmin, updateCategory);
router.delete("/:slug", isAuthenticated, isAdmin, deleteCategory);

export default router;

import express from "express";
import {
  deleteUser,
  getAllUsers,
  getUserProfile,
  updateUser,
} from "../controllers/user.controller.js";
import { isAdmin, isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Authenticated user route
router.get("/me", isAuthenticated, getUserProfile);
router.put("/me", isAuthenticated, updateUser);
router.delete("/me", isAuthenticated, deleteUser);

// Admin only route
router.get("/", isAuthenticated, isAdmin, getAllUsers);
router.get("/:id", isAuthenticated, isAdmin, getUserProfile);

export default router;

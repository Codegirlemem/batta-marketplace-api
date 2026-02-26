import express from "express";
import {
  deleteUser,
  getAllUsers,
  getUserProfile,
  updateUser,
} from "../controllers/user.controller.js";
import { isAdmin, isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/me", isAuthenticated, getUserProfile);
router.get("/", isAuthenticated, isAdmin, getAllUsers);
router.get("/:id", isAuthenticated, isAdmin, getUserProfile);

router.put("/me", isAuthenticated, updateUser);
router.delete("/me", isAuthenticated, deleteUser);

export default router;

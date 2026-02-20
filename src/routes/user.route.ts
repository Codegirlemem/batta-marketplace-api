import express from "express";
import { getAllUsers, getUserProfile } from "../controllers/user.controller.js";
import { isAdmin, isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/me", isAuthenticated, getUserProfile);
router.get("/", isAuthenticated, isAdmin, getAllUsers);
router.get("/:id", isAuthenticated, isAdmin, getUserProfile);

export default router;

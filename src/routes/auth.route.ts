import express from "express";
import {
  forgotPassword,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;

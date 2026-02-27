import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { getAllCategories } from "../controllers/category.controller.js";

const router = express.Router();

router.get("/", isAuthenticated, getAllCategories);

export default router;

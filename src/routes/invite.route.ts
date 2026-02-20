import express from "express";
import { createAdminInvite } from "../controllers/invite.controller.js";
import { isAdmin, isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create-invite", isAuthenticated, isAdmin, createAdminInvite);

export default router;

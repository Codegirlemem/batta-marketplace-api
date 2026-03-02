import express from "express";
import {
  acceptAdminInvite,
  createAdminInvite,
  deleteAdminInviteByID,
  getAdminInviteByID,
  getAllAdminInvites,
} from "../controllers/invite.controller.js";
import { isAdmin, isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

// public route
router.post("/invites/accept-invite/:token", acceptAdminInvite);

// Admin only routes
router.get("/admin/invites", isAuthenticated, isAdmin, getAllAdminInvites);
router.get("/admin/invites/:id", isAuthenticated, isAdmin, getAdminInviteByID);
router.post(
  "/admin/invites/create-invite",
  isAuthenticated,
  isAdmin,
  createAdminInvite,
);
router.delete(
  "/admin/invites/:id",
  isAuthenticated,
  isAdmin,
  deleteAdminInviteByID,
);

export default router;

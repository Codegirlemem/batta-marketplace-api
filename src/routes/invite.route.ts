import express from "express";
import {
  createAdminInvite,
  deleteAdminInvite,
  getAllInvites,
  getInvite,
} from "../controllers/invite.controller.js";
import { isAdmin, isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getAllInvites);
router.get("/:id", getInvite);
router.post("/", createAdminInvite);
router.delete("/:id", deleteAdminInvite);

export default router;

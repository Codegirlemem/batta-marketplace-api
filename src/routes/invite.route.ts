import express from "express";
import {
  createAdminInvite,
  deleteAdminInvite,
  getAllAdminInvites,
  getAdminInvite,
} from "../controllers/invite.controller.js";

const router = express.Router();

router.get("/", getAllAdminInvites);
router.get("/:id", getAdminInvite);
router.post("/", createAdminInvite);
router.delete("/:id", deleteAdminInvite);

export default router;

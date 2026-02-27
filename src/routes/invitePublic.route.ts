import express from "express";
import { acceptAdminInvite } from "../controllers/invite.controller.js";

const router = express.Router();

router.post("/accept-invite/:token", acceptAdminInvite);

export default router;

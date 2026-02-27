import express from "express";
import authRouter from "./auth.route.js";
import userRouter from "./user.route.js";
import inviteRouter from "./invite.route.js";
import invitePublicRouter from "./invitePublic.route.js";
import categoryRouter from "./category.route.js";
import { isAdmin, isAuthenticated } from "../middlewares/auth.middleware.js";

const apiRouter = express.Router();

apiRouter.get("/", (req, res) => {
  res.send("Welcome to Batta Marketplace API!");
});
apiRouter.use("/auth", authRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/admin/invites", isAuthenticated, isAdmin, inviteRouter);
apiRouter.use("/admin/invites", invitePublicRouter);
apiRouter.use("/categories", categoryRouter);

export default apiRouter;

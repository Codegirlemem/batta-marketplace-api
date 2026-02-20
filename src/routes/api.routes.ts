import express from "express";
import authRouter from "./auth.route.js";
import userRouter from "./user.route.js";
import inviteRouter from "./invite.route.js";

const apiRouter = express.Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/admin", inviteRouter);

export default apiRouter;

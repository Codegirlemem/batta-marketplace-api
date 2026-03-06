import express from "express";
import authRouter from "./auth.route.js";
import userRouter from "./user.route.js";
import inviteRouter from "./invite.route.js";
import categoryRouter from "./category.route.js";
import productRouter from "./product.route.js";
import cartRouter from "./cart.route.js";
import orderRouter from "./order.routes.js";

const apiRouter = express.Router();

apiRouter.get("/", (req, res) => {
  res.send("Welcome to Batta Marketplace API!");
});
apiRouter.use("/auth", authRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/", inviteRouter);
apiRouter.use("/categories", categoryRouter);
apiRouter.use("/", productRouter);
apiRouter.use("/", cartRouter);
apiRouter.use("/", orderRouter);

export default apiRouter;

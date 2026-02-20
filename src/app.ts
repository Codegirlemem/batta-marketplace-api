import express from "express";
import cookieParser from "cookie-parser";
import globalErrorMiddleware from "./middlewares/error.middleware.js";
import apiRouter from "./routes/api.routes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Batta Marketplace API is running!");
});

app.use("/api/v1", apiRouter);

app.use(globalErrorMiddleware);

export default app;

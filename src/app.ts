import express from "express";
import globalErrorMiddleware from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Batta Marketplace API is running!");
});

app.use(globalErrorMiddleware);

export default app;

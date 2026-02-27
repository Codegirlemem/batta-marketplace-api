import dotenv from "dotenv";
import mongoose from "mongoose";
import express from "express";
import cookieParser from "cookie-parser";
import globalErrorMiddleware from "./middlewares/error.middleware.js";
import apiRouter from "./routes/api.routes.js";
import connectDB from "./config/db.config.js";

dotenv.config({ quiet: process.env.NODE_ENV === "production" });

const port = process.env.PORT || 5000;
const app = express();

// mongoose
//   .connect(process.env.MONGODB_URI!)
//   .then(() => console.log("database connected succesfully"))
//   .catch((error) => {
//     console.error("MongoDB connection failed:", error);
//     process.exit(1);
//   });

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1", apiRouter);
app.use(globalErrorMiddleware);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () =>
      console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${port}`,
      ),
    );
  } catch (error) {
    console.log("Error starting server!", error);
    process.exit(1);
  }
};

startServer();

import dotenv from "dotenv";
dotenv.config({ quiet: process.env.NODE_ENV === "production" });

import app from "./app.js";
import connectDB from "./config/database.config.js";
import appEnv from "./config/env.config.js";

const port = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(port, () => {
      `Server running in ${appEnv.NODE_ENV} mode on port ${port}`;
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();

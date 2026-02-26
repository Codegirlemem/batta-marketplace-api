import app from "./app.js";
import connectDB from "./config/database.config.js";
import appEnv from "./config/env.config.js";

const PORT = appEnv.PORT;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      `Server running in ${appEnv.NODE_ENV} mode on port ${PORT}`;
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();

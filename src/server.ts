import app from "./app.js";
import connectDB from "./config/database.config.js";
import appEnv from "./config/env.config.js";

const startServer = async () => {
  try {
    await connectDB();

    app.listen(appEnv.PORT, () => {
      console.log(`Server running on port ${appEnv.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();

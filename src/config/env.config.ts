import dotenv from "dotenv";
dotenv.config({ quiet: process.env.NODE_ENV === "production" });

const appEnv = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI,
  NODE_ENV: process.env.NODE_ENV || "development",
};

export default appEnv;

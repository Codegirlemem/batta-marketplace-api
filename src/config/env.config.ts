// import dotenv from "dotenv";
// dotenv.config({ quiet: process.env.NODE_ENV === "production" });

const appEnv = {
  MONGODB_URI: process.env.MONGODB_URI!,
  // NODE_ENV: process.env.NODE_ENV || "development",
  COOKIE_NAME: process.env.COOKIE_NAME!,
  JWT_SECRET: process.env.JWT_SECRET!,
};

export default appEnv;

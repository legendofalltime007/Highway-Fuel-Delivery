import dotenv from "dotenv";
dotenv.config();

const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/highway-fuel-delivery",
  jwtSecret: process.env.JWT_SECRET || "fallback_secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
};

export default config;

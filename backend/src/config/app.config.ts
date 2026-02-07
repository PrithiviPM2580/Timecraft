import { getEnv } from "../utils/get-env.js";

const appConfig = () => ({
  PORT: getEnv("PORT", "3000"),
  NODE_ENV: getEnv("NODE_ENV", "development"),
  BASE_PATH: getEnv("BASE_PATH", "/api"),
  DATABASE_URL: getEnv("DATABASE_URL"),
  JWT_SECRET: getEnv("JWT_SECRET"),
  JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN"),
  GOOGLE_CLIENT_ID: getEnv("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: getEnv("GOOGLE_CLIENT_SECRET"),
  GOOGLE_CALLBACK_URL: getEnv("GOOGLE_CALLBACK_URL"),
  FRONTEND_ORIGIN: getEnv("FRONTEND_ORIGIN"),
  FRONTEND_INTEGRATION_URL: getEnv("FRONTEND_INTEGRATION_URL"),
  LOG_LEVEL: getEnv("LOG_LEVEL", "info"),
});

export const config = appConfig();

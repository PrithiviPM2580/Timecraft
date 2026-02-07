import { getEnv } from "../utils/get-env.js";

const appConfig = () => ({
  PORT: getEnv("PORT", "3000"),
  NODE_ENV: getEnv("NODE_ENV", "development"),
  BASE_URL: getEnv("BASE_URL", "/api"),
  DATABASE_URL: getEnv("DATABASE_URL"),
  JWT_SECRET: getEnv("JWT_SECRET"),
  JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN"),
  GOOGLE_CLIENT_ID: getEnv("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: getEnv("GOOGLE_CLIENT_SECRET"),
  GOOGLE_CALLBACK_URL: getEnv("GOOGLE_CALLBACK_URL"),
  FRONTEND_URL: getEnv("FRONTEND_URL"),
  FRONTEND_INTEGRATION_URL: getEnv("FRONTEND_INTEGRATION_URL"),
});

export const config = appConfig();

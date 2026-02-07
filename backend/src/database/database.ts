import "reflect-metadata";
import { AppDataSource } from "../config/database.config.js";
import logger from "../utils/logger.js";

export const initilizeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    logger.info("Database connection initialized successfully", {
      label: "Database Initialization",
    });
  } catch (error) {
    logger.error("Error initializing database connection:", {
      label: "Database Initialization",
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }
};

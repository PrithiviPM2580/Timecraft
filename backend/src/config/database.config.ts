import "reflect-metadata";
import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DataSource } from "typeorm";
import { config } from "./app.config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getDatabaseConfig = () => {
  const isProduction = config.NODE_ENV === "production";
  const databaseUrl = config.DATABASE_URL;

  return new DataSource({
    type: "postgres",
    url: databaseUrl,
    entities: [path.join(__dirname, "../database/entities/*{.ts,.js}")],
    migrations: [path.join(__dirname, "../database/migrations/*{.ts,.js}")],
    synchronize: !isProduction,
    logger: isProduction ? "simple-console" : "debug",
    ssl: isProduction
      ? {
          rejectUnauthorized: true,
        }
      : {
          rejectUnauthorized: false,
        },
  });
};

export const AppDataSource = getDatabaseConfig();

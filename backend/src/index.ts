import "dotenv/config";
import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import { config } from "./config/app.config.js";
import logger from "./utils/logger.js";

const app: Express = express();
const BASE_PATH = config.BASE_PATH;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: config.FRONTEND_ORIGIN,
    credentials: true,
  }),
);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

app.listen(config.PORT, () => {
  logger.info(`Server is running on port in http://localhost:${config.PORT}`);
});

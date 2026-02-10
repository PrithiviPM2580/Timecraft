import "dotenv/config";
import "./config/passport.config.js";
import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import { config } from "./config/app.config.js";
import logger from "./utils/logger.js";
import { HTTP_STATUS } from "./config/http.config.js";
import { globalErrorHandler } from "./middlewares/global-error-handler.middleware.js";
import { initilizeDatabase } from "./database/database.js";
import authRouter from "./routes/auth.route.js";
import eventRouter from "./routes/event.route.js";
import availabilityRouter from "./routes/availability.route.js";
import integerationRouter from "./routes/integration.route.js";
import passport from "passport";

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

app.use(passport.initialize());

app.get("/", (req: Request, res: Response) => {
  return res.status(HTTP_STATUS.OK).json({
    message: "Welcome to Timecraft API",
  });
});

app.use(`${BASE_PATH}/auth`, authRouter);
app.use(`${BASE_PATH}/event`, eventRouter);
app.use(`${BASE_PATH}/availability`, availabilityRouter);
app.use(`${BASE_PATH}/integration`, integerationRouter);

app.use(globalErrorHandler);

app.listen(config.PORT, async () => {
  await initilizeDatabase();
  logger.info(`Server is running on port in http://localhost:${config.PORT}`, {
    label: "Server",
  });
});

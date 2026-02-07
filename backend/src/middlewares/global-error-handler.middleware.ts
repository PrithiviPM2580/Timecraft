import type {
  NextFunction,
  Request,
  Response,
  ErrorRequestHandler,
} from "express";
import logger from "../utils/logger.js";
import { HTTP_STATUS } from "../config/http.config.js";
import { AppError } from "../utils/app-error.js";

export const globalErrorHandler: ErrorRequestHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error(`Error occured on PATH: ${req.path}`, {
    label: "GlobalErrorHandler",
    error: error.message,
    stack: error.stack,
  });
  if (error instanceof SyntaxError) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: "Invalid JSON format. Please check your request body.",
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      errorCode: error.errorCode,
    });
  }

  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: "Internal Server Error",
    error: error?.message || "Unknown error occurred",
  });
};

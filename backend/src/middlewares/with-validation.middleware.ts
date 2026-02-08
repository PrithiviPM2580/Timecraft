import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import type { Request, Response, NextFunction, RequestHandler } from "express";
import { HTTP_STATUS } from "../config/http.config.js";
import { ErrorCodeEnum } from "../enums/error-code.enum.js";
import logger from "../utils/logger.js";
import { asyncHandler } from "./async-handler.middleware.js";

type ValidationSource = "body" | "query" | "params";

export function asyncHandlerWithValidate<T extends object>(
  dto: new () => T,
  source: ValidationSource,
  handler: (req: Request, res: Response, dto: T) => Promise<any>,
): RequestHandler {
  return asyncHandler(withValidation(dto, source)(handler));
}

const formValidationError = (res: Response, errors: ValidationError[]) => {
  logger.error("Validation failed", {
    label: "ValidationMiddleware",
    errors: errors.map((error) => ({
      field: error.property,
      message: error.constraints,
    })),
  });
  return res.status(HTTP_STATUS.BAD_REQUEST).json({
    message: "Validation failed",
    errorCode: ErrorCodeEnum.VALIDATION_ERROR,
    errors: errors.map((error) => ({
      field: error.property,
      message: error.constraints,
    })),
  });
};

export function withValidation<T extends object>(
  DtoClass: new () => T,
  source: ValidationSource = "body",
) {
  return function (
    handler: (req: Request, res: Response, dto: T) => Promise<any>,
  ) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const dtoInstance = plainToInstance(DtoClass, req[source]);
        const errors = await validate(dtoInstance);

        if (errors.length > 0) {
          return formValidationError(res, errors);
        }

        await handler(req, res, dtoInstance);
      } catch (error) {
        next(error);
      }
    };
  };
}

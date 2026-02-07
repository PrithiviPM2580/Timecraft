import { HTTP_STATUS, type HttpStatusType } from "../config/http.config.js";
import {
  ErrorCodeEnum,
  type ErrorCodeEnumType,
} from "../enums/error-code.enum.js";

export class AppError extends Error {
  public statusCode: number;
  public errorCode?: ErrorCodeEnumType;

  constructor(
    message: string,
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errorCode?: ErrorCodeEnumType,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    if (errorCode !== undefined) {
      this.errorCode = errorCode;
    }
    Error.captureStackTrace(this, this.constructor);
  }
}

export class HttpException extends AppError {
  constructor(
    message = "HTTP Exception Error",
    statusCode: HttpStatusType,
    errorCode?: ErrorCodeEnumType,
  ) {
    super(message, statusCode, errorCode);
  }
}

export class InternalServerException extends AppError {
  constructor(
    message = "Internal Server Error",
    errorCode?: ErrorCodeEnumType,
  ) {
    super(
      message,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      errorCode || ErrorCodeEnum.INTERNAL_SERVER_ERROR,
    );
  }
}

export class NotFoundException extends AppError {
  constructor(message = "Resource Not Found", errorCode?: ErrorCodeEnumType) {
    super(
      message,
      HTTP_STATUS.NOT_FOUND,
      errorCode || ErrorCodeEnum.RESOURCE_NOT_FOUND,
    );
  }
}

export class BadRequestException extends AppError {
  constructor(message = "Bad Request", errorCode?: ErrorCodeEnumType) {
    super(
      message,
      HTTP_STATUS.BAD_REQUEST,
      errorCode || ErrorCodeEnum.VALIDATION_ERROR,
    );
  }
}

export class UnauthorizedException extends AppError {
  constructor(message = "Unauthorized", errorCode?: ErrorCodeEnumType) {
    super(
      message,
      HTTP_STATUS.UNAUTHORIZED,
      errorCode || ErrorCodeEnum.ACCESS_UNAUTHORIZED,
    );
  }
}

export class TooManyRequestsException extends AppError {
  constructor(message = "Too Many Requests", errorCode?: ErrorCodeEnumType) {
    super(
      message,
      HTTP_STATUS.TOO_MANY_REQUESTS,
      errorCode || ErrorCodeEnum.AUTH_TOO_MANY_REQUESTS,
    );
  }
}

export class ConflictException extends AppError {
  constructor(message = "Conflict", errorCode?: ErrorCodeEnumType) {
    super(
      message,
      HTTP_STATUS.CONFLICT,
      errorCode || ErrorCodeEnum.AUTH_EMAIL_ALREADY_EXISTS,
    );
  }
}

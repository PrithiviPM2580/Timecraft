import type { Request, Response } from "express";
import { LoginDto, RegisterDto } from "../database/dto/auth.dto.js";
import { type Controller } from "../@types/index.js";
import { asyncHandlerWithValidate } from "../middlewares/with-validation.middleware.js";
import { registerService, loginService } from "../services/auth.service.js";
import { HTTP_STATUS } from "../config/http.config.js";

// Register Controller
export const registerController: Controller = asyncHandlerWithValidate(
  RegisterDto,
  "body",
  async (req: Request, res: Response, registerDto) => {
    const { user } = await registerService(registerDto);

    return res.status(HTTP_STATUS.CREATED).json({
      message: "User registered successfully",
      user,
    });
  },
);

// Login Controller
export const loginController: Controller = asyncHandlerWithValidate(
  LoginDto,
  "body",
  async (req: Request, res: Response, loginDto) => {
    const { user, accessToken, expiresAt } = await loginService(loginDto);

    return res.status(HTTP_STATUS.OK).json({
      message: "User logged in successfully",
      user,
      accessToken,
      expiresAt,
    });
  },
);

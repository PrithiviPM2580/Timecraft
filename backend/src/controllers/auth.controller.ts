import type { Request, RequestHandler, Response } from "express";
import { RegisterDto } from "../database/dto/auth.dto.js";
import { type Controller } from "../@types/index.js";
import { asyncHandlerWithValidate } from "../middlewares/with-validation.middleware.js";
import { registerService } from "../services/auth.service.js";
import { HTTP_STATUS } from "../config/http.config.js";

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

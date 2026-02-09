import type { Request, Response } from "express";
import type { Controller } from "../@types/index.js";
import { asyncHandler } from "../middlewares/async-handler.middleware.js";
import { HTTP_STATUS } from "../config/http.config.js";
import logger from "../utils/logger.js";
import { NotFoundException } from "../utils/app-error.js";
import { getUserIntegerationsService } from "../services/integeration.service.js";

export const getUserIntegerationController: Controller = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      logger.error("User ID is missing in the request");
      throw new NotFoundException("User not found");
    }

    const integerations = await getUserIntegerationsService(userId);

    return res.status(HTTP_STATUS.OK).json({
      message: "User integerations fetched successfully",
      integerations,
    });
  },
);

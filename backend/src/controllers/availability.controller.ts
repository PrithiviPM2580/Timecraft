import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async-handler.middleware.js";
import type { Controller } from "../@types/index.js";
import logger from "../utils/logger.js";
import { NotFoundException } from "../utils/app-error.js";
import { HTTP_STATUS } from "../config/http.config.js";
import { getUserAvailabilityService } from "../services/availability.service.js";

export const getUserAvailabilityController: Controller = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      logger.error("", {
        label: "AvailabilityController",
      });

      throw new NotFoundException("");
    }

    const availability = await getUserAvailabilityService(userId);

    logger.info(`Fetched availability for user ${userId}`, {
      label: "AvailabilityController",
    });

    return res.status(HTTP_STATUS.OK).json({
      message: "Fetch availability successfully",
      availability,
    });
  },
);

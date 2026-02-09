import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async-handler.middleware.js";
import type { Controller } from "../@types/index.js";
import logger from "../utils/logger.js";
import { NotFoundException } from "../utils/app-error.js";
import { HTTP_STATUS } from "../config/http.config.js";
import {
  getUserAvailabilityService,
  updateUserAvailabilityService,
  getAvailabilityForPublicEventService,
} from "../services/availability.service.js";
import { asyncHandlerWithValidate } from "../middlewares/with-validation.middleware.js";
import { UpdateAvailabilityDto } from "../database/dto/availability.dto.js";
import { EventIdDto } from "../database/dto/event.dto.js";

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

export const updateAvailabilityController: Controller =
  asyncHandlerWithValidate(
    UpdateAvailabilityDto,
    "body",
    async (req: Request, res: Response, updateAvailabilityDto) => {
      const userId = req.user?.id;

      if (!userId) {
        logger.error("User ID not found in request", {
          label: "AvailabilityController",
        });
        throw new NotFoundException("User not found");
      }

      await updateUserAvailabilityService(userId, updateAvailabilityDto);

      logger.info(`Updated availability for user ${userId}`, {
        label: "AvailabilityController",
      });

      return res.status(HTTP_STATUS.OK).json({
        message: "Update availability successfully",
      });
    },
  );

export const getAvailabilityForPublicEventController: Controller =
  asyncHandlerWithValidate(
    EventIdDto,
    "params",
    async (req: Request, res: Response, eventIdDto) => {
      const availability = await getAvailabilityForPublicEventService(
        eventIdDto.eventId,
      );

      logger.info(
        `Fetched availability for public event ${eventIdDto.eventId}`,
        {
          label: "AvailabilityController",
        },
      );

      return res.status(HTTP_STATUS.OK).json({
        message: "Fetch availability for public event successfully",
        availability,
      });
    },
  );

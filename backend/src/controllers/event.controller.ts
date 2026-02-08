import type { Request, Response } from "express";
import { HTTP_STATUS } from "../config/http.config.js";
import { CreateEventDto } from "../database/dto/event.dto.js";
import type { Controller } from "../@types/index.js";
import { asyncHandlerWithValidate } from "../middlewares/with-validation.middleware.js";
import { createEventService } from "../services/event.service.js";
import logger from "../utils/logger.js";

export const createEventController: Controller = asyncHandlerWithValidate(
  CreateEventDto,
  "body",
  async (req: Request, res: Response, createEventDto) => {
    if (!req.user) {
      logger.error("Unauthorized access to createEventController", {
        label: "createEventController",
      });
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        message: "User not authenticated",
      });
    }

    const { event } = await createEventService(req.user.id, createEventDto);

    logger.info(`Event created with ID: ${event.id}`, {
      label: "createEventController",
      event,
    });
    return res.status(HTTP_STATUS.CREATED).json({
      message: "Event created successfully",
      event,
    });
  },
);

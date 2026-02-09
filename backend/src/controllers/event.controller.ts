import type { Request, Response } from "express";
import { HTTP_STATUS } from "../config/http.config.js";
import {
  CreateEventDto,
  EventIdDto,
  UsernameDto,
} from "../database/dto/event.dto.js";
import type { Controller } from "../@types/index.js";
import { asyncHandlerWithValidate } from "../middlewares/with-validation.middleware.js";
import {
  createEventService,
  getUserEventsService,
  toggleEventPrivacyService,
  getPublicEventsByUsernameService,
} from "../services/event.service.js";
import logger from "../utils/logger.js";
import { asyncHandler } from "../middlewares/async-handler.middleware.js";

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

export const getUserEventsController: Controller = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      logger.error("Unauthorized access to getUserEventsController", {
        label: "getUserEventsController",
      });
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        message: "User not authenticated",
      });
    }

    const { events, username } = await getUserEventsService(userId);

    logger.info(`Retrieved ${events.length} events for user ID: ${userId}`, {
      label: "getUserEventsController",
      userId,
      username,
    });

    return res.status(HTTP_STATUS.OK).json({
      message: "User events retrieved successfully",
      events,
      username,
    });
  },
);

export const toggleEventPrivacyController: Controller =
  asyncHandlerWithValidate(
    EventIdDto,
    "body",
    async (req: Request, res: Response, eventIdDto) => {
      const userId = req.user?.id;

      if (!userId) {
        logger.error("Unauthorized access to toggleEventPrivacyController", {
          label: "toggleEventPrivacyController",
        });
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          message: "User not authenticated",
        });
      }

      const { event } = await toggleEventPrivacyService(
        userId,
        eventIdDto.eventId,
      );

      logger.info(
        `Toggled privacy for event ID: ${event.id} by user ID: ${userId}`,
        {
          label: "toggleEventPrivacyController",
          eventId: event.id,
          userId,
          isPrivate: event.isPrivate,
        },
      );
      return res.status(HTTP_STATUS.OK).json({
        message: `Event set to ${event.isPrivate ? "private" : "public"} successfully`,
        event,
      });
    },
  );

export const getPublicEventsByUsernameController: Controller =
  asyncHandlerWithValidate(
    UsernameDto,
    "params",
    async (req: Request, res: Response, usernameDto) => {
      const { user, events } = await getPublicEventsByUsernameService(
        usernameDto.username,
      );

      logger.info(
        `Retrieved ${events.length} public events for username: ${usernameDto.username}`,
        {
          label: "getPublicEventsByUsernameController",
          username: usernameDto.username,
          eventCount: events.length,
        },
      );
      return res.status(HTTP_STATUS.OK).json({
        message: "Public events retrieved successfully",
        user,
        events,
      });
    },
  );

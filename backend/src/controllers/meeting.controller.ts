import type { Request, Response } from "express";
import type { Controller } from "../@types/index.js";
import { asyncHandler } from "../middlewares/async-handler.middleware.js";
import { HTTP_STATUS } from "../config/http.config.js";
import logger from "../utils/logger.js";
import { NotFoundException } from "../utils/app-error.js";
import {
  MeetingFilterEnum,
  type MeetingFilterEnumType,
} from "../enums/meeting.enum.js";
import {
  getUserMeetingsService,
  createMeetingBookingForGuestService,
  cancelMeetingService,
} from "../services/meeting.service.js";
import { asyncHandlerWithValidate } from "../middlewares/with-validation.middleware.js";
import { CreateMeetingDTO, MeetingDto } from "../database/dto/meeting.dto.js";

export const getUserMeetingsController: Controller = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      logger.error("User ID not found in request");
      throw new NotFoundException("User not found");
    }

    const filter =
      (req.query.filter as MeetingFilterEnumType) || MeetingFilterEnum.UPCOMING;

    logger.info(`Fetching meetings for user ${userId} with filter ${filter}`);

    const meeting = await getUserMeetingsService(userId, filter);
    return res.status(HTTP_STATUS.OK).json({
      message: "Meetings fetched successfully",
      meeting,
    });
  },
);

export const createMeetingBookingForGuestController: Controller =
  asyncHandlerWithValidate(
    CreateMeetingDTO,
    "body",
    async (req: Request, res: Response, createMeetingDto) => {
      const { meetLink, meeting } =
        await createMeetingBookingForGuestService(createMeetingDto);
      return res.status(HTTP_STATUS.OK).json({
        message: "Meeting scheduled successfully",
        meetLink,
        meeting,
      });
    },
  );

export const cancelMeetingController: Controller = asyncHandlerWithValidate(
  MeetingDto,
  "params",
  async (req: Request, res: Response, meetingDto) => {
    await cancelMeetingService(meetingDto.meetingId);
    return res.status(HTTP_STATUS.OK).json({
      message: "Meeting cancelled successfully",
    });
  },
);

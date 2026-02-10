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
import { getUserMeetingsService } from "../services/meeting.service.js";

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

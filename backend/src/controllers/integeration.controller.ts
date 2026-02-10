import type { Request, Response } from "express";
import type { Controller } from "../@types/index.js";
import { asyncHandler } from "../middlewares/async-handler.middleware.js";
import { HTTP_STATUS } from "../config/http.config.js";
import logger from "../utils/logger.js";
import { NotFoundException } from "../utils/app-error.js";
import {
  getUserIntegerationsService,
  checkUserIntegerationService,
  connectAppService,
  createIntegerationService,
} from "../services/integeration.service.js";
import { asyncHandlerWithValidate } from "../middlewares/with-validation.middleware.js";
import { AppTypeDto } from "../database/dto/integeration.dto.js";
import { config } from "../config/app.config.js";
import { decodeState } from "../utils/helper.js";
import { googleOAuth2Client } from "../config/oauth.config.js";
import {
  IntegerationAppTypeEnum,
  IntegerationCategoryEnum,
  IntegerationproviderEnum,
} from "../database/entities/integration.entity.js";

const CLIENT_APP_URL = config.FRONTEND_INTEGRATION_URL;

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

export const checkUserIntegerationController: Controller =
  asyncHandlerWithValidate(
    AppTypeDto,
    "params",
    async (req: Request, res: Response, appTypeDto) => {
      const userId = req.user?.id;

      if (!userId) {
        logger.error("User ID is missing in the request");
        throw new NotFoundException("User not found");
      }

      const isConnected = await checkUserIntegerationService(
        userId,
        appTypeDto.appType,
      );

      return res.status(HTTP_STATUS.OK).json({
        message: "Integeration checked successfully",
        isConnected,
      });
    },
  );

export const connectAppController: Controller = asyncHandlerWithValidate(
  AppTypeDto,
  "params",
  async (req: Request, res: Response, appTypeDto) => {
    const userId = req.user?.id;

    if (!userId) {
      logger.error("User ID is missing in the request");
      throw new NotFoundException("User not found");
    }

    const { url } = await connectAppService(userId, appTypeDto.appType);

    return res.status(HTTP_STATUS.OK).json({
      message: "App connected successfully",
      url,
    });
  },
);

export const googleOAuthCallbackController: Controller = asyncHandler(
  async (req: Request, res: Response) => {
    const { code, state } = req.query;

    const CLIENT_URL = `${CLIENT_APP_URL}?app_type=google`;

    if (!code || typeof code !== "string") {
      logger.error("Authorization code is missing in the request");
      return res.redirect(`${CLIENT_URL}&error=Invalid authorization code`);
    }

    if (!state || typeof state !== "string") {
      logger.error("State parameter is missing in the request");
      return res.redirect(`${CLIENT_URL}&error=Invalid state parameter`);
    }

    const { userId } = decodeState(state);

    if (!userId) {
      logger.error("User ID is missing in the state parameter");
      return res.redirect(
        `${CLIENT_URL}&error=UserId is missing in state parameter`,
      );
    }

    const { tokens } = await googleOAuth2Client.getToken(code);

    if (!tokens.access_token) {
      logger.error("Failed to obtain access token from Google");
      return res.redirect(`${CLIENT_URL}&error=Failed to obtain access token`);
    }

    await createIntegerationService({
      userId: userId,
      provider: IntegerationproviderEnum.GOOGLE,
      category: IntegerationCategoryEnum.CALENDAR_AND_VIDEO_CONFERENCING,
      app_type: IntegerationAppTypeEnum.GOOGLE_MEET_AND_CALENDAR,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || undefined,
      expiry_date: tokens.expiry_date || null,
      metadata: {
        scope: tokens.scope,
        token_type: tokens.token_type,
      },
    });

    return res.redirect(`${CLIENT_URL}&success=true`);
  },
);

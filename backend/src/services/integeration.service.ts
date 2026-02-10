import { AppDataSource } from "../config/database.config.js";
import { googleOAuth2Client } from "../config/oauth.config.js";
import {
  IntegerationAppTypeEnum,
  IntegerationCategoryEnum,
  IntegerationproviderEnum,
  Integration,
} from "../database/entities/integration.entity.js";
import { BadRequestException } from "../utils/app-error.js";
import { encodeSate } from "../utils/helper.js";
import logger from "../utils/logger.js";

const appTypeToprovideMap: Record<
  IntegerationAppTypeEnum,
  IntegerationproviderEnum
> = {
  [IntegerationAppTypeEnum.GOOGLE_MEET_AND_CALENDAR]:
    IntegerationproviderEnum.GOOGLE,
  [IntegerationAppTypeEnum.ZOOM_MEETING]: IntegerationproviderEnum.ZOOM,
  [IntegerationAppTypeEnum.OUTLOOK_CALENDAR]:
    IntegerationproviderEnum.MICROSOFT,
};

const appTypeToCategoryMap: Record<
  IntegerationAppTypeEnum,
  IntegerationCategoryEnum
> = {
  [IntegerationAppTypeEnum.GOOGLE_MEET_AND_CALENDAR]:
    IntegerationCategoryEnum.CALENDAR_AND_VIDEO_CONFERENCING,
  [IntegerationAppTypeEnum.ZOOM_MEETING]:
    IntegerationCategoryEnum.VIDEO_CONFERENCING,
  [IntegerationAppTypeEnum.OUTLOOK_CALENDAR]: IntegerationCategoryEnum.CALENDAR,
};

const appTypeToTitleMap: Record<IntegerationAppTypeEnum, string> = {
  [IntegerationAppTypeEnum.GOOGLE_MEET_AND_CALENDAR]: "Google Meet & Calendar",
  [IntegerationAppTypeEnum.ZOOM_MEETING]: "Zoom Meeting",
  [IntegerationAppTypeEnum.OUTLOOK_CALENDAR]: "Outlook Calendar",
};

export const getUserIntegerationsService = async (userId: string) => {
  const intergerationRepository = AppDataSource.getRepository(Integration);

  const userIntegerations = await intergerationRepository.find({
    where: { user: { id: userId } },
  });

  const connectedMap = new Map(
    userIntegerations.map((integration) => [integration.app_type, integration]),
  );

  return Object.values(IntegerationAppTypeEnum).flatMap((appType) => {
    return {
      provider: appTypeToprovideMap[appType],
      title: appTypeToTitleMap[appType],
      app_type: appType,
      category: appTypeToCategoryMap[appType],
      isConnected: connectedMap.has(appType) || false,
    };
  });
};

export const checkUserIntegerationService = async (
  userId: string,
  appType: IntegerationAppTypeEnum,
): Promise<boolean> => {
  const intergerationRepository = AppDataSource.getRepository(Integration);

  const integeration = await intergerationRepository.findOne({
    where: { user: { id: userId }, app_type: appType },
  });

  if (!integeration) {
    return false;
  }

  return true;
};

export const connectAppService = async (
  userId: string,
  appType: IntegerationAppTypeEnum,
) => {
  const state = encodeSate({
    userId,
    appType,
  });
  let authUrl: string;

  switch (appType) {
    case IntegerationAppTypeEnum.GOOGLE_MEET_AND_CALENDAR:
      authUrl = googleOAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: ["https://www.googleapis.com/auth/calendar.events"],
        prompt: "consent",
        state,
      });
      break;

    default:
      throw new BadRequestException("Unsupported integration type");
  }

  return { url: authUrl };
};

export const createIntegerationService = async (data: {
  userId: string;
  provider: IntegerationproviderEnum;
  category: IntegerationCategoryEnum;
  app_type: IntegerationAppTypeEnum;
  access_token: string;
  refresh_token?: string;
  expiry_date?: number | null;
  metadata?: Record<string, any>;
}) => {
  const intergerationRepository = AppDataSource.getRepository(Integration);

  const existingIntegeration = await intergerationRepository.findOne({
    where: { userId: data.userId, app_type: data.app_type },
  });

  if (existingIntegeration) {
    logger.error(
      `Integration already exists for user ${data.userId} and app type ${data.app_type}`,
    );
    throw new BadRequestException(`${data.app_type} already connected`);
  }

  const integeration = intergerationRepository.create({
    provider: data.provider,
    category: data.category,
    app_type: data.app_type,
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expiry_date: data.expiry_date,
    metadata: data.metadata,
    userId: data.userId,
    isConnected: true,
  });

  await intergerationRepository.save(integeration);

  return integeration;
};

export const validateGoogleToken = async (
  accessToken: string,
  refreshToken: string,
  expiryDate: number | null,
) => {
  if (expiryDate === null || Date.now() >= expiryDate) {
    googleOAuth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const { credentials } = await googleOAuth2Client.refreshAccessToken();
    return credentials.access_token;
  }

  return accessToken;
};

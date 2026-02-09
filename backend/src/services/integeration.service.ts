import { AppDataSource } from "../config/database.config.js";
import {
  IntegerationAppTypeEnum,
  IntegerationCategoryEnum,
  IntegerationproviderEnum,
  Integration,
} from "../database/entities/integration.entity.js";

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

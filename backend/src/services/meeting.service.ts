import {
  MeetingFilterEnum,
  type MeetingFilterEnumType,
} from "../enums/meeting.enum.js";
import {
  Meeting,
  MeetingStatusEnum,
} from "../database/entities/meeting.entity.js";
import { AppDataSource } from "../config/database.config.js";
import { LessThan, MoreThan } from "typeorm";

export const getUserMeetingsService = async (
  userId: string,
  filter: MeetingFilterEnumType,
) => {
  const meetingRepository = AppDataSource.getRepository(Meeting);

  const where: any = { user: { id: userId } };

  if (filter === MeetingFilterEnum.UPCOMING) {
    where.status = MeetingStatusEnum.SCHEDULED;
    where.startTime = MoreThan(new Date());
  } else if (filter === MeetingFilterEnum.PAST) {
    where.status = MeetingStatusEnum.SCHEDULED;
    where.startTime = LessThan(new Date());
  } else if (filter === MeetingFilterEnum.CANCELLED) {
    where.status = MeetingStatusEnum.CANCELED;
  } else {
    where.status = MeetingStatusEnum.SCHEDULED;
    where.startTime = MoreThan(new Date());
  }

  const meetings = await meetingRepository.find({
    where,
    relations: ["event"],
    order: { startTime: "ASC" },
  });

  return meetings || [];
};

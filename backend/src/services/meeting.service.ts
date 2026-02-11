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
import type { CreateMeetingDTO } from "../database/dto/meeting.dto.js";
import {
  IntegerationAppTypeEnum,
  IntegerationCategoryEnum,
  Integration,
} from "../database/entities/integration.entity.js";
import { BadRequestException, NotFoundException } from "../utils/app-error.js";
import {
  Event,
  EventLocationEnumType,
} from "../database/entities/event.entity.js";
import { validateGoogleToken } from "./integeration.service.js";
import { googleOAuth2Client } from "../config/oauth.config.js";
import { google } from "googleapis";
import logger from "../utils/logger.js";

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

export const createMeetingBookingForGuestService = async (
  createMeetingDto: CreateMeetingDTO,
) => {
  const meetingRepository = AppDataSource.getRepository(Meeting);
  const eventRepository = AppDataSource.getRepository(Event);
  const integrationRepository = AppDataSource.getRepository(Integration);

  const { eventId, guestEmail, guestName, additionalInfo } = createMeetingDto;

  const startTime = new Date(createMeetingDto.startTime);
  const endTime = new Date(createMeetingDto.endTime);

  const event = await eventRepository.findOne({
    where: { id: eventId, isPrivate: false },
    relations: ["user"],
  });

  if (!event) throw new NotFoundException("Event not found");

  if (!Object.values(EventLocationEnumType).includes(event.locationType)) {
    throw new BadRequestException("Invalid location type for event");
  }

  const meetIntegration = await integrationRepository.findOne({
    where: {
      user: { id: event.user.id },
      app_type: IntegerationAppTypeEnum[event.locationType],
    },
  });

  if (!meetIntegration)
    throw new BadRequestException(
      "No video conferencing integration found for event host",
    );

  let meetingLink: string = "";
  let calendarEventId: string = "";

  if (event.locationType === EventLocationEnumType.GOOGLE_MEET_AND_CALENDAR) {
    const { calendar } = await getCalenderClient(
      meetIntegration.app_type,
      meetIntegration.access_token,
      meetIntegration.refresh_token,
      meetIntegration.expiry_date,
    );

    const response = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: 1,
      requestBody: {
        summary: `${guestName}=${event.title}`,
        description: additionalInfo,
        start: { dateTime: startTime.toISOString() },
        end: { dateTime: endTime.toISOString() },
        attendees: [{ email: guestEmail }, { email: event.user.email }],
        conferenceData: {
          createRequest: {
            requestId: `${event.id}-${Date.now()}`,
          },
        },
      },
    });

    meetingLink = response.data.hangoutLink!;
    calendarEventId = response.data.id!;
  }

  const meeting = meetingRepository.create({
    event: { id: event.id },
    user: event.user,
    guestEmail,
    guestName,
    startTime,
    endTime,
    additionalInfo,
    meetLink: meetingLink,
    calendarEventId,
  });

  await meetingRepository.save(meeting);

  return { meetLink: meetingLink, meeting };
};

async function getCalenderClient(
  appType: IntegerationAppTypeEnum,
  accessToken: string,
  refreshToken: string,
  expiryDate: number | null,
) {
  switch (appType) {
    case IntegerationAppTypeEnum.GOOGLE_MEET_AND_CALENDAR:
      const validToken = await validateGoogleToken(
        accessToken,
        refreshToken,
        expiryDate,
      );
      googleOAuth2Client.setCredentials({
        access_token: validToken,
      });

      const calendar = google.calendar({
        version: "v3",
        auth: googleOAuth2Client,
      });

      return {
        calendar,
        calendarType: IntegerationAppTypeEnum.GOOGLE_MEET_AND_CALENDAR,
      };
    default:
      throw new BadRequestException(`Unsupported Calendar provider ${appType}`);
  }
}

export const cancelMeetingService = async (meetingId: string) => {
  const meetingRepository = AppDataSource.getRepository(Meeting);
  const integrationRepository = AppDataSource.getRepository(Integration);

  const meeting = await meetingRepository.findOne({
    where: { id: meetingId },
    relations: ["event", "event.user"],
  });

  if (!meeting) throw new NotFoundException("Meeting not found");

  const calendarIntegration = await integrationRepository.findOne({
    where: [
      {
        user: { id: meeting.event.user.id },
        category: IntegerationCategoryEnum.CALENDAR_AND_VIDEO_CONFERENCING,
      },
      {
        user: { id: meeting.event.user.id },
        category: IntegerationCategoryEnum.CALENDAR,
      },
    ],
  });

  try {
    if (calendarIntegration) {
      const { calendar, calendarType } = await getCalenderClient(
        calendarIntegration.app_type,
        calendarIntegration.access_token,
        calendarIntegration.refresh_token,
        calendarIntegration.expiry_date,
      );

      switch (calendarType) {
        case IntegerationAppTypeEnum.GOOGLE_MEET_AND_CALENDAR:
          await calendar.events.delete({
            calendarId: "primary",
            eventId: meeting.calendarEventId,
          });
          break;
        default:
          throw new BadRequestException(
            `Unsupported Calendar provider ${calendarType}`,
          );
      }
    }
  } catch (error) {
    logger.error(
      `Failed to cancel calendar event for meeting ${meetingId}: ${error}`,
    );
    throw new BadRequestException("Failed to delete event from the calendar.");
  }

  meeting.status = MeetingStatusEnum.CANCELED;
  await meetingRepository.save(meeting);

  return { success: true };
};

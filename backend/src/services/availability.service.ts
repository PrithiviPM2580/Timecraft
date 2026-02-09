import { AppDataSource } from "../config/database.config.js";
import { User } from "../database/entities/user.entity.js";
import type { AvailabilityResponseType } from "../@types/index.js";
import { NotFoundException } from "../utils/app-error.js";
import logger from "../utils/logger.js";
import { UpdateAvailabilityDto } from "../database/dto/availability.dto.js";
import { Availability } from "../database/entities/availability.entity.js";
import { DayOfWeekEnum } from "../database/entities/day-availability.entity.js";
import { Event } from "../database/entities/event.entity.js";
import { format, addDays, parseISO, addMinutes } from "date-fns";

export const getUserAvailabilityService = async (userId: string) => {
  const userRepository = AppDataSource.getRepository(User);

  const user = await userRepository.findOne({
    where: {
      id: userId,
    },
    relations: ["availability", "availability.days"],
  });

  if (!user || !user.availability) {
    logger.error(`User with id ${userId} not found`, {
      label: "AvailabilityService",
    });
    throw new NotFoundException("User not found or availability not set");
  }

  const availabilityData: AvailabilityResponseType = {
    timeGap: user.availability.timeGap,
    days: [],
  };

  user.availability.days.forEach((dayAvailability) => {
    availabilityData.days.push({
      day: dayAvailability.day,
      startTime: dayAvailability.startTime.toISOString().slice(11, 16),
      endTime: dayAvailability.endTime.toISOString().slice(11, 16),
      isAvailable: dayAvailability.isAvailable,
    });
  });

  return availabilityData;
};

export const updateUserAvailabilityService = async (
  userId: string,
  updateAvailabilityDto: UpdateAvailabilityDto,
) => {
  const userRepository = AppDataSource.getRepository(User);
  const availabilityRepository = AppDataSource.getRepository(Availability);

  const user = await userRepository.findOne({
    where: { id: userId },
    relations: ["availability", "availability.days"],
  });

  if (!user) {
    logger.error(`User with id ${userId} not found`, {
      label: "AvailabilityService",
    });
    throw new NotFoundException("User not found");
  }

  const dayAvailabilityData = updateAvailabilityDto.days.map(
    ({ day, isAvailable, startTime, endTime }) => {
      const baseDate = new Date().toISOString().split("T")[0];
      return {
        day: day.toUpperCase() as DayOfWeekEnum,
        startTime: new Date(`${baseDate}T${startTime}:00Z`),
        endTime: new Date(`${baseDate}T${endTime}:00Z`),
        isAvailable,
      };
    },
  );

  if (user.availability) {
    await availabilityRepository.save({
      id: user.availability.id,
      timeGap: updateAvailabilityDto.timeGap,
      days: dayAvailabilityData.map((day) => ({
        ...day,
        availability: { id: user.availability?.id },
      })),
    });
  }

  return {
    success: true,
  };
};

export const getAvailabilityForPublicEventService = async (eventId: string) => {
  const eventRepository = AppDataSource.getRepository(Event);

  const event = await eventRepository.findOne({
    where: { id: eventId, isPrivate: false },
    relations: [
      "user",
      "user.availability",
      "user.availability.days",
      "user.meetings",
    ],
  });

  if (!event?.user?.availability) {
    logger.error(`Public event with id ${eventId} not found`, {
      label: "AvailabilityService",
    });
    throw new NotFoundException("Public event not found");
  }

  const { availability, meetings } = event.user;

  const dayOfWeeks = Object.values(DayOfWeekEnum);
  const availableDays = [];

  for (const dayOfWeek of dayOfWeeks) {
    const nextDate = getNextDateForDay(dayOfWeek);
    const dayAvailability = availability.days.find((d) => d.day === dayOfWeek);
    if (dayAvailability) {
      const slots = dayAvailability.isAvailable
        ? generateAvailableTimeSlot(
            dayAvailability.startTime,
            dayAvailability.endTime,
            event.duration,
            meetings,
            format(nextDate, "yyyy-MM-dd"),
            availability.timeGap,
          )
        : [];
      availableDays.push({
        day: dayOfWeek,
        slots,
        isAvailable: dayAvailability.isAvailable,
      });
    }
  }

  return availableDays;
};

function getNextDateForDay(dayOfWeek: string): Date {
  const days = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];

  const today = new Date();
  const todayDay = today.getDay();
  const targetDay = days.indexOf(dayOfWeek);

  const daysUntilTarget = (targetDay - todayDay + 7) % 7;
  return addDays(today, daysUntilTarget);
}

function generateAvailableTimeSlot(
  startTime: Date,
  endTime: Date,
  duration: number,
  meetings: { startTime: Date; endTime: Date }[],
  dateStr: string,
  timeGap: number,
) {
  const slots = [];

  let currentTime = parseISO(
    `${dateStr}T${startTime.toISOString().slice(11, 16)}`,
  );
  let slotEndTime = parseISO(
    `${dateStr}T${endTime.toISOString().slice(11, 16)}`,
  );

  const now = new Date();

  const isToday = format(now, "yyyy-MM-dd") === dateStr;

  while (currentTime < slotEndTime) {
    if (!isToday || currentTime >= now) {
      const slotEnd = new Date(currentTime.getTime() + duration * 60000);

      if (isSlotAvailable(currentTime, slotEnd, meetings)) {
        slots.push(format(currentTime, "HH:mm"));
      }
    }
    currentTime = addMinutes(currentTime, timeGap);
  }

  return slots;
}

function isSlotAvailable(
  slotStart: Date,
  slotEnd: Date,
  meetings: { startTime: Date; endTime: Date }[],
): boolean {
  for (const meeting of meetings) {
    if (slotStart < meeting.endTime && slotEnd > meeting.startTime) {
      return false;
    }
  }
  return true;
}

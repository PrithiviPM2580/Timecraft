import { AppDataSource } from "../config/database.config.js";
import { User } from "../database/entities/user.entity.js";
import type { AvailabilityResponseType } from "../@types/index.js";
import { NotFoundException } from "../utils/app-error.js";
import logger from "../utils/logger.js";
import { UpdateAvailabilityDto } from "../database/dto/availability.dto.js";
import { Availability } from "../database/entities/availability.entity.js";
import type { DayOfWeekEnum } from "../database/entities/day-availability.entity.js";

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

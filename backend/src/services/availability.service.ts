import { AppDataSource } from "../config/database.config.js";
import { User } from "../database/entities/user.entity.js";
import type { AvailabilityResponseType } from "../@types/index.js";
import { NotFoundException } from "../utils/app-error.js";
import logger from "../utils/logger.js";

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

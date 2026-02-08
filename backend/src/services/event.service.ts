import type { CreateEventDto } from "../database/dto/event.dto.js";
import { AppDataSource } from "../config/database.config.js";
import {
  Event,
  EventLocationEnumType,
} from "../database/entities/event.entity.js";
import { BadRequestException } from "../utils/app-error.js";
import logger from "../utils/logger.js";
import { slugify } from "../utils/helper.js";

export const createEventService = async (
  userId: string,
  createEventDto: CreateEventDto,
) => {
  const eventRepository = AppDataSource.getRepository(Event);

  if (
    !Object.values(EventLocationEnumType)?.includes(createEventDto.locationType)
  ) {
    logger.error(`Invalid location type: ${createEventDto.locationType}`, {
      label: "createEventService",
    });
    throw new BadRequestException("Invalid location type");
  }

  const slug = slugify(createEventDto.title);

  const event = eventRepository.create({
    ...createEventDto,
    slug,
    user: {
      id: userId,
    },
  });

  await eventRepository.save(event);

  return { event };
};

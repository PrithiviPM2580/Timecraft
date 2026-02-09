import type { CreateEventDto } from "../database/dto/event.dto.js";
import { AppDataSource } from "../config/database.config.js";
import {
  Event,
  EventLocationEnumType,
} from "../database/entities/event.entity.js";
import { BadRequestException, NotFoundException } from "../utils/app-error.js";
import logger from "../utils/logger.js";
import { slugify } from "../utils/helper.js";
import { User } from "../database/entities/user.entity.js";

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

export const getUserEventsService = async (userId: string) => {
  const userRepository = AppDataSource.getRepository(User);

  const user = await userRepository
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.events", "event")
    .loadRelationCountAndMap("event._count.meetings", "event.meetings")
    .where("user.id = :userId", { userId })
    .orderBy("event.createdAt", "DESC")
    .getOne();

  if (!user) {
    logger.error(`User not found with ID: ${userId}`, {
      label: "getUserEventsService",
    });
    throw new NotFoundException("User not found");
  }

  return { events: user.events, username: user.username };
};

export const toggleEventPrivacyService = async (
  userId: string,
  eventId: string,
) => {
  const eventRepository = AppDataSource.getRepository(Event);

  const event = await eventRepository.findOne({
    where: { id: eventId, user: { id: userId } },
  });

  if (!event) {
    logger.error(`Event not found with ID: ${eventId} for user ID: ${userId}`, {
      label: "toggleEventPrivacyService",
    });
    throw new NotFoundException("Event not found");
  }

  event.isPrivate = !event.isPrivate;

  await eventRepository.save(event);

  return { event };
};

export const getPublicEventsByUsernameService = async (username: string) => {
  const userRepository = AppDataSource.getRepository(User);

  const user = await userRepository
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.events", "event", "event.isPrivate = :isPrivate", {
      isPrivate: false,
    })
    .where("user.username = :username", { username })
    .select(["user.id", "user.name", "user.imageUrl"])
    .addSelect([
      "event.id",
      "event.title",
      "event.description",
      "event.slug",
      "event.duration",
    ])
    .orderBy("event.createdAt", "DESC")
    .getOne();

  if (!user) {
    logger.error(`User not found with username: ${username}`, {
      label: "getPublicEventsByUsernameService",
    });
    throw new NotFoundException("User not found");
  }

  return {
    user: {
      name: user.name,
      username: username,
      imageUrl: user.imageUrl,
    },
    events: user.events,
  };
};

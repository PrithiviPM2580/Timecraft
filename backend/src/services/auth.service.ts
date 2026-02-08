import { AppDataSource } from "../config/database.config.js";
import type { LoginDto, RegisterDto } from "../database/dto/auth.dto.js";
import { Availability } from "../database/entities/availability.entity.js";
import {
  DayAvailability,
  DayOfWeekEnum,
} from "../database/entities/day-availability.entity.js";
import { User } from "../database/entities/user.entity.js";
import { BadRequestException, NotFoundException } from "../utils/app-error.js";
import logger from "../utils/logger.js";
import { v4 as uuidv4 } from "uuid";
import { signJwtToken } from "../utils/jwt.js";

// Register Service
export const registerService = async (registerDto: RegisterDto) => {
  const userRepository = AppDataSource.getRepository(User);
  const availabilityRepository = AppDataSource.getRepository(Availability);
  const dayAvailabilityRepository =
    AppDataSource.getRepository(DayAvailability);

  const existingUser = await userRepository.findOne({
    where: { email: registerDto.email },
  });

  if (existingUser) {
    logger.error(`User with email ${registerDto.email} already exists`, {
      label: "AuthService",
    });
    throw new BadRequestException("User with this email already exists");
  }

  const username = await generateUsername(registerDto.name);
  const user = userRepository.create({
    ...registerDto,
    username,
  });

  const availability = availabilityRepository.create({
    timeGap: 30,
    days: Object.values(DayOfWeekEnum).map((day) => ({
      day: day,
      startTime: new Date("2026-01-01T09:00:00Z"),
      endTime: new Date("2026-01-01T17:00:00Z"),
      isAvailable:
        day !== DayOfWeekEnum.SUNDAY && day !== DayOfWeekEnum.SATURDAY,
    })),
  });

  user.availability = availability;

  await userRepository.save(user);

  return { user: user.omitPassword() };
};

// Helper function to generate a unique username
async function generateUsername(name: string): Promise<string> {
  const cleanName = name.replace(/\s+/g, "").toLowerCase();
  const baseUsername = cleanName;

  const uuidSuffix = uuidv4().replace(/\s+/g, "").slice(0, 4);
  const userRepository = AppDataSource.getRepository(User);

  let username = `${baseUsername}${uuidSuffix}`;
  let existingUser = await userRepository.findOne({ where: { username } });

  while (existingUser) {
    username = `${baseUsername}${uuidv4().replace(/\s+/g, "").slice(0, 4)}`;
    existingUser = await userRepository.findOne({ where: { username } });
  }

  return username;
}

// Login Service
export const loginService = async (loginDto: LoginDto) => {
  const userRepository = AppDataSource.getRepository(User);

  const user = await userRepository.findOne({
    where: { email: loginDto.email },
  });

  if (!user) {
    logger.error(`User with email ${loginDto.email} not found`, {
      label: "AuthService",
    });
    throw new NotFoundException("Invalid email or password");
  }

  const isPasswordValid = await user.comparePassword(loginDto.password);

  if (!isPasswordValid) {
    logger.error(`Invalid password for email ${loginDto.email}`, {
      label: "AuthService",
    });
    throw new BadRequestException("Invalid email or password");
  }

  const { token, expiresAt } = signJwtToken({ userId: user.id });

  return { user: user.omitPassword(), accessToken: token, expiresAt };
};

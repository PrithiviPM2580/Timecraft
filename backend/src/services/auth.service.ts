import { AppDataSource } from "../config/database.config.js";
import type { RegisterDto } from "../database/dto/auth.dto.js";
import { User } from "../database/entities/user.entity.js";
import { BadRequestException } from "../utils/app-error.js";
import logger from "../utils/logger.js";

export const registerService = async (registerDto: RegisterDto) => {
  const userRepository = AppDataSource.getRepository(User);

  const existingUser = await userRepository.findOne({
    where: { email: registerDto.email },
  });

  if (existingUser) {
    logger.error(`User with email ${registerDto.email} already exists`, {
      label: "AuthService",
    });
    throw new BadRequestException("User with this email already exists");
  }

  const user = userRepository.create({
    ...registerDto,
  });

  await userRepository.save(user);

  return { user };
};

import type { RequestHandler } from "express";
import type { DayOfWeekEnum } from "../database/entities/day-availability.entity.js";

export type Controller = RequestHandler;

declare global {
  namespace Express {
    interface User {
      id: string;
    }
  }
}

export type AvailabilityResponseType = {
  timeGap: number;
  days: {
    day: DayOfWeekEnum;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }[];
};

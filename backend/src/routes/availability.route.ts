import { Router } from "express";
import { passportAuthenticateJwt } from "../config/passport.config.js";
import {
  getAvailabilityForPublicEventController,
  getUserAvailabilityController,
  updateAvailabilityController,
} from "../controllers/availability.controller.js";

const availabilityRouter: Router = Router();

availabilityRouter.get(
  "/me",
  passportAuthenticateJwt,
  getUserAvailabilityController,
);

availabilityRouter.get(
  "/public/:eventId",
  getAvailabilityForPublicEventController,
);

availabilityRouter.put(
  "/update",
  passportAuthenticateJwt,
  updateAvailabilityController,
);

export default availabilityRouter;

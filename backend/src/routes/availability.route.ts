import { Router } from "express";
import { passportAuthenticateJwt } from "../config/passport.config.js";
import {
  getUserAvailabilityController,
  updateAvailabilityController,
} from "../controllers/availability.controller.js";

const availabilityRouter: Router = Router();

availabilityRouter.get(
  "/me",
  passportAuthenticateJwt,
  getUserAvailabilityController,
);

availabilityRouter.put(
  "/update",
  passportAuthenticateJwt,
  updateAvailabilityController,
);

export default availabilityRouter;

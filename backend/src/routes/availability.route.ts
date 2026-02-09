import { Router } from "express";
import { passportAuthenticateJwt } from "../config/passport.config.js";
import { getUserAvailabilityController } from "../controllers/availability.controller.js";

const availabilityRouter: Router = Router();

availabilityRouter.get(
  "/me",
  passportAuthenticateJwt,
  getUserAvailabilityController,
);

export default availabilityRouter;

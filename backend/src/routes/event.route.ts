import { Router } from "express";
import {
  createEventController,
  getUserEventsController,
  toggleEventPrivacyController,
  getPublicEventsByUsernameController,
} from "../controllers/event.controller.js";
import { passportAuthenticateJwt } from "../config/passport.config.js";

const eventRouter: Router = Router();

eventRouter.post("/", passportAuthenticateJwt, createEventController);

eventRouter.get("/all", passportAuthenticateJwt, getUserEventsController);

eventRouter.put(
  "/toggle-privacy",
  passportAuthenticateJwt,
  toggleEventPrivacyController,
);

eventRouter.get("/public/:username", getPublicEventsByUsernameController);

export default eventRouter;

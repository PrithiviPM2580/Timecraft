import { Router } from "express";
import {
  createEventController,
  getUserEventsController,
  toggleEventPrivacyController,
  getPublicEventsByUsernameController,
  getPublicEventsByUsernameAndSlugController,
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

eventRouter.get(
  "/public/:username/:slug",
  getPublicEventsByUsernameAndSlugController,
);

export default eventRouter;

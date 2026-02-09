import { Router } from "express";
import {
  createEventController,
  getUserEventsController,
  toggleEventPrivacyController,
  getPublicEventsByUsernameController,
  getPublicEventsByUsernameAndSlugController,
  deleteEventController,
} from "../controllers/event.controller.js";
import { passportAuthenticateJwt } from "../config/passport.config.js";

const eventRouter: Router = Router();

eventRouter.post("/", passportAuthenticateJwt, createEventController);

eventRouter.get("/all", passportAuthenticateJwt, getUserEventsController);

eventRouter.get("/public/:username", getPublicEventsByUsernameController);

eventRouter.get(
  "/public/:username/:slug",
  getPublicEventsByUsernameAndSlugController,
);

eventRouter.put(
  "/toggle-privacy",
  passportAuthenticateJwt,
  toggleEventPrivacyController,
);

eventRouter.delete("/:eventId", passportAuthenticateJwt, deleteEventController);

export default eventRouter;

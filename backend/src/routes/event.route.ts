import { Router } from "express";
import {
  createEventController,
  getUserEventsController,
  toggleEventPrivacyController,
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

export default eventRouter;

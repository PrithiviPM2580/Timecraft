import { Router } from "express";
import {
  createEventController,
  getUserEventsController,
} from "../controllers/event.controller.js";
import { passportAuthenticateJwt } from "../config/passport.config.js";

const eventRouter: Router = Router();

eventRouter.post("/", passportAuthenticateJwt, createEventController);

eventRouter.get("/all", passportAuthenticateJwt, getUserEventsController);

export default eventRouter;

import { Router } from "express";
import { passportAuthenticateJwt } from "../config/passport.config.js";
import {
  cancelMeetingController,
  createMeetingBookingForGuestController,
  getUserMeetingsController,
} from "../controllers/meeting.controller.js";

const meetingRouter: Router = Router();

meetingRouter.get(
  "/user/all",
  passportAuthenticateJwt,
  getUserMeetingsController,
);

meetingRouter.post("/public/create", createMeetingBookingForGuestController);

meetingRouter.put(
  "/cancel/:meetingId",
  passportAuthenticateJwt,
  cancelMeetingController,
);

export default meetingRouter;

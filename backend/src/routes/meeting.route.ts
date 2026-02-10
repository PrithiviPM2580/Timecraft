import { Router } from "express";
import { passportAuthenticateJwt } from "../config/passport.config.js";
import { getUserMeetingsController } from "../controllers/meeting.controller.js";

const meetingRouter: Router = Router();

meetingRouter.get(
  "/user/all",
  passportAuthenticateJwt,
  getUserMeetingsController,
);

export default meetingRouter;

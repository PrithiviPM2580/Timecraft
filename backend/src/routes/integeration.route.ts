import { Router } from "express";
import { passportAuthenticateJwt } from "../config/passport.config.js";
import {
  checkUserIntegerationController,
  getUserIntegerationController,
} from "../controllers/integeration.controller.js";

const integerationRouter: Router = Router();

integerationRouter.get(
  "/all",
  passportAuthenticateJwt,
  getUserIntegerationController,
);

integerationRouter.get(
  "/check/:appType",
  passportAuthenticateJwt,
  checkUserIntegerationController,
);

export default integerationRouter;

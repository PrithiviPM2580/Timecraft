import { Router } from "express";
import { passportAuthenticateJwt } from "../config/passport.config.js";
import { getUserIntegerationController } from "../controllers/integeration.controller.js";

const integerationRouter: Router = Router();

integerationRouter.get(
  "/all",
  passportAuthenticateJwt,
  getUserIntegerationController,
);

export default integerationRouter;

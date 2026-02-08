import { Router } from "express";
import { registerContoller } from "../controllers/auth.controller.js";

const authRouter: Router = Router();

authRouter.post("/register", registerContoller);

export default authRouter;

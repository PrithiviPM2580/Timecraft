import {
  Strategy as JwtStrategy,
  ExtractJwt,
  type StrategyOptions,
} from "passport-jwt";
import passport from "passport";
import { config } from "./app.config.js";
import { findUserByIdService } from "../services/auth.service.js";
import logger from "../utils/logger.js";

interface JwtPayload {
  userId: string;
}

const options: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.JWT_SECRET,
  audience: ["user"],
  algorithms: ["HS256"],
};

passport.use(
  new JwtStrategy(options, async (payload: JwtPayload, done) => {
    try {
      const user = await findUserByIdService(payload.userId);
      if (!user) {
        logger.warn(`User not found for ID: ${payload.userId}`);
        return done(null, false);
      }
      return done(null, user);
    } catch (error) {
      logger.error("Error in JWT strategy:", error);
      return done(error, false);
    }
  }),
);

passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

export const passportAuthenticateJwt = passport.authenticate("jwt", {
  session: false,
});

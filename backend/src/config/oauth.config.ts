import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { config } from "./app.config.js";

export const googleOAuth2Client: OAuth2Client = new google.auth.OAuth2(
  config.GOOGLE_CLIENT_ID,
  config.GOOGLE_CLIENT_SECRET,
  config.GOOGLE_CALLBACK_URL,
);

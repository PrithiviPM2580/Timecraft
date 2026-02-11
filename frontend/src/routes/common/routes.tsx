import SignIn from "@/pages/auth/sign-in";
import { AUTH_ROUTES, PROTECTED_ROUTES, PUBLIC_ROUTES } from "./route-paths";
import SignUp from "@/pages/auth/sign-up";
import EventType from "@/pages/event_type";
import Meetings from "@/pages/meeting";
import Availability from "@/pages/availability";
import Integration from "@/pages/integration";
import UserEvents from "@/pages/external_page/user-events";
import UserSingleEvent from "@/pages/external_page/user-single-event";

export const authenticattionRoutePaths = [
  { path: AUTH_ROUTES.SIGN_IN, element: <SignIn /> },
  { path: AUTH_ROUTES.SIGN_UP, element: <SignUp /> },
];

export const protectedRoutePaths = [
  { path: PROTECTED_ROUTES.EVENT_TYPES, element: <EventType /> },
  { path: PROTECTED_ROUTES.MEETINGS, element: <Meetings /> },
  { path: PROTECTED_ROUTES.AVAILABILITY, element: <Availability /> },
  { path: PROTECTED_ROUTES.INTEGRATIONS, element: <Integration /> },
];

export const publicRoutePaths = [
  { path: PUBLIC_ROUTES.USER_EVENTS, element: <UserEvents /> },
  { path: PUBLIC_ROUTES.USER_SINGLE_EVENT, element: <UserSingleEvent /> },
];

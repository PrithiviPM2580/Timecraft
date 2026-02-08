import type { RequestHandler } from "express";

export type Controller = RequestHandler;

declare global {
  namespace Express {
    interface User {
      id: string;
    }
  }
}

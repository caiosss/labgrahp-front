import type { Request } from "express";

export interface RequestSession {
  id: string;
}

export interface RequestWithSession extends Request {
  session?: RequestSession;
}

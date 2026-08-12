import type { Request } from "express";
import type { ProjectPrincipal } from "./project-principal";

export interface RequestWithProjectPrincipal extends Request {
  projectPrincipal?: ProjectPrincipal;
}

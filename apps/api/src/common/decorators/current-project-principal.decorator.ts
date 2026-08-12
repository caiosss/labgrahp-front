import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { ProjectPrincipal } from "../types/project-principal";
import type { RequestWithProjectPrincipal } from "../types/request-with-project-principal";

export const CurrentProjectPrincipal = createParamDecorator(
  (_data: unknown, context: ExecutionContext): ProjectPrincipal => {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithProjectPrincipal>();

    if (!request.projectPrincipal) {
      throw new Error("Principal do projeto não encontrado na requisição.");
    }

    return request.projectPrincipal;
  },
);

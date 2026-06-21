import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { RequestWithSession, RequestSession } from "../types/request-with-session";

export const CurrentSession = createParamDecorator(
  (_data: unknown, context: ExecutionContext): RequestSession => {
    const request = context.switchToHttp().getRequest<RequestWithSession>();

    if (!request.session) {
      throw new Error("Sessão não encontrada no contexto da requisição.");
    }

    return request.session;
  },
);

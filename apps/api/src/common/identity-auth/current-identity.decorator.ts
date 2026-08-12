import {
    createParamDecorator,
    ExecutionContext,
} from "@nestjs/common";
import type {
    RequestIdentity,
    RequestWithIdentity,
} from "../types/request-with-identity";

export const CurrentIdentity = createParamDecorator(
    (
        _data: unknown,
        context: ExecutionContext,
    ): RequestIdentity => {
        const request =
            context.switchToHttp().getRequest<RequestWithIdentity>();

        if (!request.identity) {
            throw new Error(
                "Identidade não encontrada na requisição.",
            );
        }

        return request.identity;
    },
);
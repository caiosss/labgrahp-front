import {
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { jwtVerify } from "jose";

const ACCESS_TOKEN_ISSUER = "labgraph-identity";
const ACCESS_TOKEN_AUDIENCE = "labgraph-api";

@Injectable()
export class IdentityTokenService {
    private getSecret() {
        const secret = process.env.JWT_ACCESS_SECRET;

        if (!secret || secret.length < 32) {
            throw new Error(
                "JWT_ACCESS_SECRET deve ter pelo menos 32 caracteres.",
            );
        }

        return new TextEncoder().encode(secret);
    }

    async verify(token: string) {
        try {
            const { payload } = await jwtVerify(
                token,
                this.getSecret(),
                {
                    algorithms: ["HS256"],
                    issuer: ACCESS_TOKEN_ISSUER,
                    audience: ACCESS_TOKEN_AUDIENCE,
                },
            );

            if (
                payload.type !== "access" ||
                typeof payload.sub !== "string" ||
                !payload.sub
            ) {
                throw new UnauthorizedException(
                    "Access token inválido.",
                );
            }

            return {
                userId: payload.sub,
            };
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }

            throw new UnauthorizedException(
                "Access token inválido ou expirado.",
            );
        }
    }
}

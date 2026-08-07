import { verifyAccessToken } from "./tokens.mjs";

const extractTokenFromHeader = (authorizationHeader) => {
    if (!authorizationHeader) {
        return null;
    }

    const [scheme, token] = authorizationHeader.trim().split(/\s+/);

    if (scheme?.toLowerCase() !== "bearer" || !token) {
        return null;
    }

    return token;
}

export const requireAuth = async (request, response, next) => {
    try {
        const token = extractTokenFromHeader(request.headers.authorization);

        if (!token) {
            response.status(401).json({
                message: "Token de acesso ausente ou inválido.",
            });

            return;
        }

        const { payload } = await verifyAccessToken(token);

        if (
            payload.type !== "access" ||
            typeof payload.sub !== "string" ||
            !payload.sub
        ) {
            response.status(401).json({
                message: "Token de acesso inválido.",
            });

            return;
        }

        request.auth = {
            userId: payload.sub,
        }

        next();
    } catch {
        response.status(401).json({
            message: "Token de acesso inválido.",
        });
    }
}
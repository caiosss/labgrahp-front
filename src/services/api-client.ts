import type { SharedSessionDto } from "../../packages/shared/src";
import {
    clearStoredSessionToken,
    getStoredSessionToken,
    setStoredSessionToken,
} from "./session-storage";
import { logClientError } from "./client-logger";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

interface ApiRequestOptions extends RequestInit {
    authenticated?: boolean;
}

export class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

const buildApiUrl = (path: string) => {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    return `${API_BASE_URL}${normalizedPath}`;
};

const createAnonymousSession = async () => {
    let response: Response;

    try {
        response = await fetch(buildApiUrl("/sessions"), {
            headers: {
                "Content-Type": "application/json",
            },
            method: "POST",
        });
    } catch (error) {
        logClientError("api-create-session-network", error);

        throw error;
    }

    if (!response.ok) {
        const error = new ApiError("Não foi possível criar a sessão anônima.", response.status);

        logClientError("api-create-session", error, {
            status: response.status,
        });

        throw error;
    }

    return response.json() as Promise<SharedSessionDto>;
};

export const getSessionToken = async () => {
    const storedToken = getStoredSessionToken();

    if (storedToken) {
        return storedToken;
    }

    const session = await createAnonymousSession();
    setStoredSessionToken(session.token);

    return session.token;
};

export const apiRequest = async <T>(
    path: string,
    options: ApiRequestOptions = {},
): Promise<T> => {
    const headers = new Headers(options.headers);
    const isAuthenticated = options.authenticated !== false;
    const method = options.method ?? "GET";

    if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    if (isAuthenticated) {
        const token = await getSessionToken();
        headers.set("Authorization", `Bearer ${token}`);
    }

    const runRequest = () =>
        fetch(buildApiUrl(path), {
            ...options,
            headers,
        });

    let response: Response;

    try {
        response = await runRequest();
    } catch (error) {
        logClientError("api-request-network", error, {
            method,
            path,
        });

        throw error;
    }

    if (response.status === 401 && isAuthenticated) {
        clearStoredSessionToken();

        try {
            const token = await getSessionToken();
            headers.set("Authorization", `Bearer ${token}`);
            response = await runRequest();
        } catch (error) {
            logClientError("api-request-session-retry", error, {
                method,
                path,
            });

            throw error;
        }
    }

    if (!response.ok) {
        const error = new ApiError("A API não conseguiu processar a solicitação.", response.status);

        logClientError("api-request-error", error, {
            method,
            path,
            status: response.status,
        });

        throw error;
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json() as Promise<T>;
};

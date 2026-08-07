import { getStoredAccessToken } from "./auth-session-storage";
import { refreshAccessToken } from "./identity-auth-api";
import type { SharedSessionDto } from "../../packages/shared/src";
import {
    clearStoredSessionToken,
    getStoredSessionToken,
    setStoredSessionToken,
} from "./session-storage";
import { logClientError } from "./client-logger";


const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

export type AuthenticationMode =
    | "anonymous"
    | "identity"
    | "none";

interface ApiRequestOptions extends RequestInit {
    authentication?: AuthenticationMode;
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

const resolveAuthenticationMode = (
    options: ApiRequestOptions,
): AuthenticationMode => {
    if (options.authentication) {
        return options.authentication;
    }

    if (options.authenticated === false) {
        return "none";
    }

    return "anonymous";
};

const getAuthenticationToken = async (
    mode: AuthenticationMode,
): Promise<string | null> => {
    if (mode === "none") {
        return null;
    }

    if (mode === "anonymous") {
        return getSessionToken();
    }

    const storedAccessToken = getStoredAccessToken();

    if (storedAccessToken) {
        return storedAccessToken;
    }

    const session = await refreshAccessToken();
    return session.accessToken;
};

export const apiRequest = async <T>(
    path: string,
    options: ApiRequestOptions = {},
): Promise<T> => {
    const requestOptions = { ...options };

    delete requestOptions.authentication;
    delete requestOptions.authenticated;

    const headers = new Headers(requestOptions.headers);
    const authenticationMode =
        resolveAuthenticationMode(options);

    const method = requestOptions.method ?? "GET";

    if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const token = await getAuthenticationToken(
        authenticationMode,
    );

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const runRequest = () =>
        fetch(buildApiUrl(path), {
            ...requestOptions,
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

    if (response.status === 401 && authenticationMode === "anonymous") {
        clearStoredSessionToken();

        try {
            const newAnonymousToken = await getSessionToken();

            headers.set(
                "Authorization",
                `Bearer ${newAnonymousToken}`,
            );

            response = await runRequest();
        } catch (error) {
            logClientError(
                "api-request-anonymous-session-retry",
                error,
                { method, path },
            );

            throw error;
        }
    }

    if (
        response.status === 401 &&
        authenticationMode === "identity"
    ) {
        try {
            const session = await refreshAccessToken();

            headers.set(
                "Authorization",
                `Bearer ${session.accessToken}`,
            );

            response = await runRequest();
        } catch (error) {
            logClientError(
                "api-request-identity-session-retry",
                error,
                { method, path },
            );

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


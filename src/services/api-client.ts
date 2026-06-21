import type { SharedSessionDto } from "../../packages/shared/src";
import {
    clearStoredSessionToken,
    getStoredSessionToken,
    setStoredSessionToken,
} from "./session-storage";

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
    const response = await fetch(buildApiUrl("/sessions"), {
        headers: {
            "Content-Type": "application/json",
        },
        method: "POST",
    });

    if (!response.ok) {
        throw new ApiError("Não foi possível criar a sessão anônima.", response.status);
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

    if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    if (options.authenticated !== false) {
        const token = await getSessionToken();
        headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(buildApiUrl(path), {
        ...options,
        headers,
    });

    if (response.status === 401) {
        clearStoredSessionToken();
    }

    if (!response.ok) {
        throw new ApiError("A API não conseguiu processar a solicitação.", response.status);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json() as Promise<T>;
};

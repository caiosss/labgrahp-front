import {
  clearStoredAccessToken,
  setStoredAccessToken,
} from "./auth-session-storage";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthSession {
  accessToken: string;
  expiresIn: number;
  tokenType: "Bearer";
  user: AuthenticatedUser;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export class IdentityAuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "IdentityAuthError";
    this.status = status;
  }
}

let refreshRequest: Promise<AuthSession> | null = null;

type AuthSessionListener = (
  session: AuthSession | null,
) => void;

const authSessionListeners = new Set<AuthSessionListener>();

const notifyAuthSessionListeners = (
  session: AuthSession | null,
) => {
  authSessionListeners.forEach((listener) => {
    listener(session)
  });
};

export const subscribeToAuthSession = (
  listener: AuthSessionListener,
) => {
  authSessionListeners.add(listener);

  return () => {
    authSessionListeners.delete(listener);
  }
};

const clearIdentitySession = () => {
  clearStoredAccessToken();
  notifyAuthSessionListeners(null);
};

const parseErrorMessage = async (response: Response, fallback: string) => {
  try {
    const body = (await response.json()) as { message?: unknown };
    return typeof body.message === "string" ? body.message : fallback;
  } catch {
    return fallback;
  }
};

const validateSession = (session: AuthSession) => {
  if (!session.accessToken || !session.user?.id) {
    clearIdentitySession();

    throw new IdentityAuthError(
      "O Identity Service retornou uma sessão inválida.",
      502,
    );
  }

  setStoredAccessToken(session.accessToken);
  notifyAuthSessionListeners(session);

  return session;
};

const requestNewAccessToken = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    if(response.status === 401) {
      clearIdentitySession();
    }

    throw new IdentityAuthError(
      await parseErrorMessage(
        response,
        response.status === 401
          ? "A sessão é inválida ou expirou."
          : "Não foi possível renovar a autenticação.",
      ),
      response.status,
    );
  }

  return validateSession((await response.json()) as AuthSession);
};

export const refreshAccessToken = () => {
  if (!refreshRequest) {
    refreshRequest = requestNewAccessToken().finally(() => {
      refreshRequest = null;
    });
  }

  return refreshRequest;
};

export const loginWithPassword = async (credentials: LoginCredentials) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new IdentityAuthError(
      await parseErrorMessage(response, "Não foi possível entrar."),
      response.status,
    );
  }

  return validateSession((await response.json()) as AuthSession);
};

export const getCurrentUser = async (accessToken: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new IdentityAuthError(
      await parseErrorMessage(response, "Não foi possível recuperar o usuário."),
      response.status,
    );
  }

  const body = (await response.json()) as { user?: AuthenticatedUser };
  if (!body.user?.id) {
    throw new IdentityAuthError(
      "O Identity Service retornou um usuário inválido.",
      502,
    );
  }

  return body.user;
};

export const logoutCurrentSession = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok && response.status !== 401) {
      throw new IdentityAuthError(
        await parseErrorMessage(response, "Não foi possível encerrar a sessão."),
        response.status,
      );
    }
  } finally {
    clearIdentitySession();
  }
};

export const getGoogleLoginUrl = () => `${API_BASE_URL}/auth/google`;

import { clearStoredAccessToken, setStoredAccessToken } from "./auth-session-storage";

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

let refreshRequest: Promise<AuthSession> | null = null;

const requestNewAccessToken = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    clearStoredAccessToken();
    throw new Error(
      response.status === 401
        ? "A sessão criada pelo Google é inválida ou expirou."
        : "Não foi possível concluir a autenticação.",
    );
  }

  const session = (await response.json()) as AuthSession;

  if (!session.accessToken || !session.user?.id) {
    clearStoredAccessToken();
    throw new Error("O Identity Service retornou uma sessão inválida.");
  }

  setStoredAccessToken(session.accessToken);
  return session;
};

export const refreshAccessToken = () => {
  if (!refreshRequest) {
    refreshRequest = requestNewAccessToken().finally(() => {
      refreshRequest = null;
    });
  }

  return refreshRequest;
};

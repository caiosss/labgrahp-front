import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AuthContext, type AuthContextValue } from "./auth-context";
import {
  getCurrentUser,
  getGoogleLoginUrl,
  IdentityAuthError,
  loginWithPassword,
  logoutCurrentSession,
  refreshAccessToken,
  subscribeToAuthSession,
  type AuthenticatedUser,
  type AuthSession,
  type LoginCredentials,
} from "../services/identity-auth-api";
import {
  clearStoredAccessToken,
  getStoredAccessToken,
} from "../services/auth-session-storage";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    getStoredAccessToken(),
  );
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applySession = useCallback((session: AuthSession) => {
    setAccessToken(session.accessToken);
    setUser(session.user);
    return session;
  }, []);

  const clearSession = useCallback(() => {
    clearStoredAccessToken();
    setAccessToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    return subscribeToAuthSession((session) => {
      if(session) {
        applySession(session);
        return;
      }

      clearSession();
    });
  }, [applySession, clearSession])

  const refreshSession = useCallback(async () => {
    return refreshAccessToken();
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) =>
      await loginWithPassword(credentials),
    [],
  );

  const loginWithGoogle = useCallback(() => {
    window.location.assign(getGoogleLoginUrl());
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutCurrentSession();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      if (window.location.pathname === "/auth/callback") {
        if (active) setIsLoading(false);
        return;
      }

      try {
        const storedToken = getStoredAccessToken();

        if (storedToken) {
          try {
            const currentUser = await getCurrentUser(storedToken);
            if (active) {
              setAccessToken(storedToken);
              setUser(currentUser);
            }
            return;
          } catch (error) {
            if (!(error instanceof IdentityAuthError) || error.status !== 401) {
              throw error;
            }
          }
        }

        const session = await refreshAccessToken();
        if (active) applySession(session);
      } catch (error) {
        if (error instanceof IdentityAuthError && error.status === 401) {
          if (active) clearSession();
        } else {
          console.warn("Não foi possível restaurar a sessão do usuário.", error);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void restoreSession();

    return () => {
      active = false;
    };
  }, [applySession, clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      isAuthenticated: Boolean(accessToken && user),
      isLoading,
      login,
      loginWithGoogle,
      logout,
      refreshSession,
      user,
    }),
    [
      accessToken,
      isLoading,
      login,
      loginWithGoogle,
      logout,
      refreshSession,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

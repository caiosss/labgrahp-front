import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AuthContext, type AuthContextValue } from "./auth-context";
import {
  getCurrentUser,
  getGoogleLoginUrl,
  IdentityAuthError,
  loginWithPassword,
  logoutCurrentSession,
  refreshAccessToken,
  registerAccount,
  subscribeToAuthSession,
  type AuthenticatedUser,
  type AuthSession,
  type LoginCredentials,
  type RegisterDetails,
} from "../services/identity-auth-api";
import {
  clearStoredAccessToken,
  getStoredAccessToken,
} from "../services/auth-session-storage";
import { claimAnonymousProjects } from "../services/project-claim-api";
import { fetchProjects } from "../services/project-api";
import { useProjectStore } from "../store/project-store";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const setProjects = useProjectStore((state) => state.setProjects);
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

  const claimProjectsForSession = useCallback(
    async (session: AuthSession) => {
      try {
        await claimAnonymousProjects(session.accessToken);
      } catch (error) {
        console.warn(
          "Login concluído, mas não foi possível transferir os projetos anônimos.",
          error,
        );
      }

      try {
        // O claim altera apenas a propriedade no banco. Recarregamos a lista
        // com o JWT para refletir imediatamente os projetos agora pertencentes
        // ao usuário e sincronizar eventuais salvamentos locais pendentes.
        setProjects(await fetchProjects());
      } catch (error) {
        console.warn(
          "Login concluído, mas não foi possível recarregar os projetos.",
          error,
        );
      }

      return session;
    },
    [setProjects],
  );

  useEffect(() => {
    return subscribeToAuthSession((session) => {
      if (session) {
        applySession(session);
        return;
      }

      clearSession();
    });
  }, [applySession, clearSession])

  const refreshSession = useCallback(async () => {
    const session = await refreshAccessToken();

    return claimProjectsForSession(session);
  }, [claimProjectsForSession]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const session =
        await loginWithPassword(credentials);

      return claimProjectsForSession(session);
    },
    [claimProjectsForSession],
  );

  const register = useCallback(
    async (details: RegisterDetails) => {
      await registerAccount(details);
      const session = await loginWithPassword({
        email: details.email,
        password: details.password,
      });

      return claimProjectsForSession(session);
    },
    [claimProjectsForSession],
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

            try {
              await claimAnonymousProjects(storedToken);
            } catch (error) {
              console.warn(
                "Login concluído, mas não foi possível transferir os projetos anônimos.",
                error,
              );
            }

            setProjects(await fetchProjects());

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

        await claimProjectsForSession(session);

        if (active) {
          applySession(session);
        }

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
  }, [applySession, clearSession, claimProjectsForSession, setProjects]);

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      isAuthenticated: Boolean(accessToken && user),
      isLoading,
      login,
      loginWithGoogle,
      logout,
      refreshSession,
      register,
      claimProjectsForSession,
      user,
    }),
    [
      accessToken,
      isLoading,
      login,
      loginWithGoogle,
      logout,
      refreshSession,
      register,
      claimProjectsForSession,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

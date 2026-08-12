import { createContext } from "react";
import type {
  AuthenticatedUser,
  AuthSession,
  LoginCredentials,
  RegisterDetails,
} from "../services/identity-auth-api";

export interface AuthContextValue {
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthenticatedUser | null;
  login: (credentials: LoginCredentials) => Promise<AuthSession>;
  register: (details: RegisterDetails) => Promise<AuthSession>;
  loginWithGoogle: () => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<AuthSession>;
  claimProjectsForSession: (session: AuthSession) => Promise<AuthSession>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

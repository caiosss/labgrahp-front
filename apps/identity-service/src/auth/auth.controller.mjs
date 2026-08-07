import {
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_EXPIRES_IN_SECONDS,
} from "../security/refresh-tokens.mjs";
import { loginSchema, registerSchema } from "./auth.schemas.mjs";
import {
  EmailIsRegisteredError,
  InvalidCredentialsError,
  InvalidRefreshTokenError,
  UserNotFoundError,
  getCurrentUser,
  loginUser,
  logoutSession,
  registerUser,
  rotateRefreshToken,
} from "./auth.service.mjs";
import { setRefreshCookie, getRefreshCookieOptions } from "./auth-cookies.mjs";

const getSessionContext = (request) => ({
  ipAddress: request.ip,
  userAgent: request.get("user-agent"),
});

const clearRefreshCookie = (response) => {
  const { maxAge: _maxAge, ...options } = getRefreshCookieOptions();
  response.clearCookie(REFRESH_TOKEN_COOKIE_NAME, options);
};

export const register = async (request, response, next) => {
  try {
    const validation = registerSchema.safeParse(request.body);
    if (!validation.success) {
      response.status(400).json({
        message: "Dados de cadastro inválidos.",
        errors: validation.error.flatten(),
      });
      return;
    }

    const user = await registerUser(validation.data);
    response.status(201).json({ user });
  } catch (error) {
    if (error instanceof EmailIsRegisteredError) {
      response.status(409).json({
        message: "Já existe uma conta cadastrada com este e-mail.",
      });
      return;
    }
    next(error);
  }
};

export const login = async (request, response, next) => {
  try {
    const validation = loginSchema.safeParse(request.body);
    if (!validation.success) {
      response.status(400).json({
        message: "Dados de login inválidos.",
        errors: validation.error.flatten(),
      });
      return;
    }

    const { refreshToken, ...result } = await loginUser(
      validation.data,
      getSessionContext(request),
    );

    setRefreshCookie(response, refreshToken);
    response.status(200).json(result);
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      response.status(401).json({ message: "E-mail ou senha inválidos." });
      return;
    }
    next(error);
  }
};

export const refresh = async (request, response, next) => {
  try {
    const currentToken = request.cookies[REFRESH_TOKEN_COOKIE_NAME];
    if (!currentToken) throw new InvalidRefreshTokenError();

    const { refreshToken, ...result } = await rotateRefreshToken(
      currentToken,
      getSessionContext(request),
    );

    setRefreshCookie(response, refreshToken);
    response.status(200).json(result);
  } catch (error) {
    if (error instanceof InvalidRefreshTokenError) {
      clearRefreshCookie(response);
      response.status(401).json({ message: "Sessão inválida ou expirada." });
      return;
    }
    next(error);
  }
};

export const logout = async (request, response, next) => {
  try {
    await logoutSession(request.cookies[REFRESH_TOKEN_COOKIE_NAME]);
    clearRefreshCookie(response);
    response.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const me = async (request, response, next) => {
  try {
    const user = await getCurrentUser(request.auth.userId);
    response.status(200).json({ user });
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      response.status(404).json({ message: "Usuário não encontrado." });
      return;
    }
    next(error);
  }
};

import { REFRESH_TOKEN_COOKIE_NAME, REFRESH_TOKEN_EXPIRES_IN_SECONDS } from "../security/refresh-tokens.mjs";

const OAUTH_COOKIE_MAX_AGE = 10 * 60 * 1000;

const getPublicPathPrefix = () => {
  const configuredPrefix = process.env.AUTH_PUBLIC_PATH_PREFIX?.trim() ?? "";

  if (!configuredPrefix || configuredPrefix === "/") return "";

  return `/${configuredPrefix.replace(/^\/+|\/+$/g, "")}`;
};

const getPublicAuthPath = () => `${getPublicPathPrefix()}/auth`;

export const getRefreshCookieOptions = () => ({
  httpOnly: true,
  maxAge: REFRESH_TOKEN_EXPIRES_IN_SECONDS * 1000,
  path: getPublicAuthPath(),
  // O proxy torna a autenticacao first-party, inclusive no WebKit do iOS.
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
});

export const getOAuthCookieOptionsGoogle = () => ({
  httpOnly: true,
  maxAge: OAUTH_COOKIE_MAX_AGE,
  path: `${getPublicAuthPath()}/google`,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
});

export const setRefreshCookie = (response, refreshToken) => {
  response.cookie(
    REFRESH_TOKEN_COOKIE_NAME,
    refreshToken,
    getRefreshCookieOptions(),
  );
};

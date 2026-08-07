import { REFRESH_TOKEN_COOKIE_NAME, REFRESH_TOKEN_EXPIRES_IN_SECONDS } from "../security/refresh-tokens.mjs";

const OAUTH_COOKIE_MAX_AGE = 10 * 60 * 1000;

export const getRefreshCookieOptions = () => ({
  httpOnly: true,
  maxAge: REFRESH_TOKEN_EXPIRES_IN_SECONDS * 1000,
  path: "/auth",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production",
});

export const getOAuthCookieOptionsGoogle = () => ({
    httpOnly: true,
    maxAge: OAUTH_COOKIE_MAX_AGE,
    path: "/auth/google",
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
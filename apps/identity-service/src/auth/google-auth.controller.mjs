import {
  createGoogleAuthorization,
  exchangeGoogleAuthorizationCode,
  verifyGoogleIdToken,
} from "../security/google-oauth.mjs";
import { createUserSession } from "./auth.service.mjs";
import { findOrCreateGoogleUser } from "./google-auth.service.mjs";
import { getOAuthCookieOptionsGoogle, setRefreshCookie } from "./auth-cookies.mjs";

const clearOAuthCookies = (response) => {
  const { maxAge: _maxAge, ...options } = getOAuthCookieOptionsGoogle();
  response.clearCookie("google_oauth_state", options);
  response.clearCookie("google_oauth_nonce", options);
  response.clearCookie("google_oauth_code_verifier", options);
};

const getFrontendUrl = () =>
  (process.env.FRONTEND_URL ?? "http://localhost:5173")
    .split(",")[0]
    .trim()
    .replace(/\/$/, "");

export const startGoogleLogin = (_request, response, next) => {
  try {
    const authorization = createGoogleAuthorization();
    const options = getOAuthCookieOptionsGoogle();

    response.cookie("google_oauth_state", authorization.state, options);
    response.cookie("google_oauth_nonce", authorization.nonce, options);
    response.cookie(
      "google_oauth_code_verifier",
      authorization.codeVerifier,
      options,
    );
    response.redirect(authorization.authorizationUrl);
  } catch (error) {
    next(error);
  }
};

export const finishGoogleLogin = async (request, response) => {
  try {
    const { code, state, error } = request.query;

    if (error) throw new Error(`Google recusou o login: ${error}`);
    if (
      typeof code !== "string" ||
      typeof state !== "string" ||
      state !== request.cookies.google_oauth_state
    ) {
      throw new Error("Callback OAuth inválido.");
    }

    const codeVerifier = request.cookies.google_oauth_code_verifier;
    const nonce = request.cookies.google_oauth_nonce;
    if (!codeVerifier || !nonce) {
      throw new Error("Sessão OAuth ausente ou expirada.");
    }

    const idToken = await exchangeGoogleAuthorizationCode({ code, codeVerifier });
    const googleProfile = await verifyGoogleIdToken({ idToken, nonce });
    const user = await findOrCreateGoogleUser(googleProfile);
    const session = await createUserSession(user, {
      ipAddress: request.ip,
      userAgent: request.get("user-agent"),
    });

    clearOAuthCookies(response);
    setRefreshCookie(response, session.refreshToken);
    response.redirect(`${getFrontendUrl()}/auth/callback`);
  } catch (error) {
    clearOAuthCookies(response);
    console.error("Falha ao concluir o login com Google.", error);
    response.redirect(`${getFrontendUrl()}/auth/callback?error=oauth_failed`);
  }
};

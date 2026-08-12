import { createHash, randomBytes } from "node:crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";

const GOOGLE_AUTHORIZATION_URL = "https://accounts.google.com/o/oauth2/v2/auth";

const GOOGLE_TOKEN_URL =
  "https://oauth2.googleapis.com/token";

const GOOGLE_JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs"),
);

const randomValue = () => randomBytes(32).toString("base64url");

const createCodeChallenge = (codeVerifier) => createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

const getRequiredEnvironmentVariable = (name) => {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Variável de ambiente ausente: ${name}`);
    }

    return value;
};

export const createGoogleAuthorization = () => {
    const state = randomValue(); // impede injeção de callback oauth de outra pessoa
    const nonce = randomValue(); // impede injeção indevida de ID token
    const codeVerifier = randomValue(); // segredo temporario do PKCE
    const codeChallenge = createCodeChallenge(codeVerifier); // hash do codeVerifier do google

    const authorizationUrl = new URL(GOOGLE_AUTHORIZATION_URL);

    authorizationUrl.searchParams.set(
        "client_id",
        getRequiredEnvironmentVariable("GOOGLE_CLIENT_ID"),
    );
    authorizationUrl.searchParams.set(
        "redirect_uri",
        getRequiredEnvironmentVariable("GOOGLE_CALLBACK_URL"),
    );
    authorizationUrl.searchParams.set("response_type", "code");
    authorizationUrl.searchParams.set("scope", "openid email profile");
    authorizationUrl.searchParams.set("prompt", "select_account");
    authorizationUrl.searchParams.set("state", state);
    authorizationUrl.searchParams.set("nonce", nonce);
    authorizationUrl.searchParams.set("code_challenge", codeChallenge);
    authorizationUrl.searchParams.set("code_challenge_method", "S256");

    return {
        authorizationUrl: authorizationUrl.toString(),
        codeVerifier,
        nonce,
        state,
    };
}

export const exchangeGoogleAuthorizationCode = async ({code, codeVerifier}) => {
    const body = new URLSearchParams({
        client_id: getRequiredEnvironmentVariable("GOOGLE_CLIENT_ID"),
        client_secret: getRequiredEnvironmentVariable("GOOGLE_CLIENT_SECRET"),
        code,
        code_verifier: codeVerifier,
        grant_type: "authorization_code", // serve para o google saber que é um código de autorização
        redirect_uri: getRequiredEnvironmentVariable("GOOGLE_CALLBACK_URL"),
    });

    const response = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: {
            "content-type": "application/x-www-form-urlencoded",
        },
        body,
    });

    if (!response.ok) {
        throw new Error("Não foi possível trocar o código OAuth.");
    }

    const tokens = await response.json();

    if (!tokens.id_token) {
        throw new Error("O Google não retornou um ID Token.");
    }

    return tokens.id_token;
}

export const verifyGoogleIdToken = async ({ idToken, nonce }) => {
    const { payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
        algorithms: ["RS256"],
        audience: getRequiredEnvironmentVariable("GOOGLE_CLIENT_ID"),
        issuer: ["https://accounts.google.com", "accounts.google.com"], // o issuer pode ser um desses dois valores, dependendo do google
    });

    if (payload.nonce !== nonce) {
        throw new Error("O nonce do ID Token não corresponde ao esperado.");
    }
    
    if (
        typeof payload.sub !== "string" ||
        typeof payload.email !== "string" ||
        payload.email_verified !== true
    ) {
        throw new Error("Conta Google sem e-mail verificado.");
    }

    return {
        email: payload.email,
        name:
            typeof payload.name === "string"
                ? payload.name
                : payload.email.split("@")[0],
        providerSubject: payload.sub,
    };
}

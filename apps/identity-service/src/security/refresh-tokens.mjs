import { createHash, randomBytes } from "node:crypto";

export const REFRESH_TOKEN_COOKIE_NAME = "labgraph_refresh_token";
export const REFRESH_TOKEN_EXPIRES_IN_SECONDS = process.env.REFRESH_TOKEN_EXPIRATION
  ? Number(process.env.REFRESH_TOKEN_EXPIRATION)
  : 432000;

export const createRefreshToken = () => randomBytes(48).toString("base64url");

export const hashRefreshToken = (token) => {
  return createHash("sha256").update(token).digest("hex");
};

export const getRefreshTokenExpiration = () => {
  return new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_SECONDS * 1000);
};

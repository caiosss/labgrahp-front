import { jwtVerify, SignJWT } from "jose";

const ACCESS_TOKEN_AUDIENCE = "labgraph-api";
const ACCESS_TOKEN_ISSUER = "labgraph-identity";
export const ACCESS_TOKEN_EXPIRES_IN_SECONDS = process.env.JWT_ACCESS_EXPIRATION
  ? Number(process.env.JWT_ACCESS_EXPIRATION)
  : 432000;

const getAccessTokenSecret = () => {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_ACCESS_SECRET deve estar configurado com pelo menos 32 caracteres.",
    );
  }

  return new TextEncoder().encode(secret);
};

export const createAccessToken = (userId) => {
  return new SignJWT({ type: "access" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(userId)
    .setIssuer(ACCESS_TOKEN_ISSUER)
    .setAudience(ACCESS_TOKEN_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_EXPIRES_IN_SECONDS}s`)
    .sign(getAccessTokenSecret());
};

export const verifyAccessToken = (token) => {
  return jwtVerify(token, getAccessTokenSecret(), {
    algorithms: ["HS256"],
    audience: ACCESS_TOKEN_AUDIENCE,
    issuer: ACCESS_TOKEN_ISSUER,
  });
};

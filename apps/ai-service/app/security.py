from dataclasses import dataclass

import jwt
from fastapi import Header, HTTPException, status

from .config import get_settings

ACCESS_TOKEN_ISSUER = "labgraph-identity"
ACCESS_TOKEN_AUDIENCE = "labgraph-api"


@dataclass(frozen=True)
class Identity:
    user_id: str


def require_identity(authorization: str | None = Header(default=None)) -> Identity:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token não informado.",
        )

    token = authorization.removeprefix("Bearer ").strip()
    settings = get_settings()

    try:
        payload = jwt.decode(
            token,
            settings.jwt_access_secret,
            algorithms=["HS256"],
            audience=ACCESS_TOKEN_AUDIENCE,
            issuer=ACCESS_TOKEN_ISSUER,
        )
    except jwt.PyJWTError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token inválido ou expirado.",
        ) from error

    if payload.get("type") != "access" or not isinstance(payload.get("sub"), str):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token inválido.",
        )

    return Identity(user_id=payload["sub"])

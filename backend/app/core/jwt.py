from datetime import datetime, timezone, timedelta

import jwt

from .config import settings

TYPE_ACCESS = "access"
TYPE_REFRESH = "refresh"


def create_access_token(user_id: int) -> str:
    """Создаёт JWT access token с sub=user_id и сроком жизни из настроек."""
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {"sub": str(user_id), "exp": expire, "type": TYPE_ACCESS}
    return jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )


def create_refresh_token(user_id: int) -> str:
    """Создаёт JWT refresh token (долгоживущий) для обновления access."""
    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    payload = {"sub": str(user_id), "exp": expire, "type": TYPE_REFRESH}
    return jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )


def decode_access_token(token: str) -> dict:
    """
    Декодирует и проверяет JWT access token. Возвращает payload.
    Выбрасывает jwt.PyJWTError при невалидном или истёкшем токене.
    """
    payload = jwt.decode(
        token,
        settings.JWT_SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
    )
    if payload.get("type") != TYPE_ACCESS:
        raise jwt.InvalidTokenError("Не access токен")
    return payload


def decode_refresh_token(token: str) -> dict:
    """
    Декодирует и проверяет JWT refresh token. Возвращает payload (с sub=user_id).
    Выбрасывает jwt.PyJWTError при невалидном или истёкшем токене.
    """
    payload = jwt.decode(
        token,
        settings.JWT_SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
    )
    if payload.get("type") != TYPE_REFRESH:
        raise jwt.InvalidTokenError("Не refresh токен")
    return payload

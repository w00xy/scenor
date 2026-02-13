from fastapi import APIRouter, Depends, HTTPException, status

from database.engine import get_db
from schemas.auth import LoginSchema, RefreshSchema, TokenSchema
from core.security import verify_password
from core.jwt import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
)
from repositories import get_user_by_email_or_username, get_user_by_id
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenSchema)
async def login(
    data: LoginSchema,
    db: AsyncSession = Depends(get_db),
):
    """Вход по email или username и паролю. Возвращает access и refresh токены."""
    user = await get_user_by_email_or_username(db, data.login)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный логин или пароль",
        )
    if not verify_password(data.password, user.hashed_pwd):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный логин или пароль",
        )
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    return TokenSchema(
        access_token=access_token,
        refresh_token=refresh_token,
    )


@router.post("/refresh", response_model=TokenSchema)
async def refresh(
    data: RefreshSchema,
    db: AsyncSession = Depends(get_db),
):
    """Обновление access токена по валидному refresh токену."""
    try:
        payload = decode_refresh_token(data.refresh_token)
        user_id = int(payload["sub"])
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Невалидный или истёкший refresh токен",
        )
    user = await get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пользователь не найден",
        )
    access_token = create_access_token(user.id)
    new_refresh_token = create_refresh_token(user.id)
    return TokenSchema(
        access_token=access_token,
        refresh_token=new_refresh_token,
    )

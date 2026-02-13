from typing import Optional

from pydantic import BaseModel, Field


class LoginSchema(BaseModel):
    """Тело запроса для входа: email или username + пароль."""
    login: str = Field(..., description="Email или username")
    password: str = Field(..., min_length=1)


class RefreshSchema(BaseModel):
    """Тело запроса для обновления токена."""
    refresh_token: str = Field(..., description="Refresh JWT токен")


class TokenSchema(BaseModel):
    """Ответ с JWT токенами."""
    access_token: str
    token_type: str = "bearer"
    refresh_token: Optional[str] = None

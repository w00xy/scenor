import re

from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional


class UserCreateSchema(BaseModel):
    """Схема для регистрации: email обязателен, пароль от 8 символов, телефон опционален."""
    username: Optional[str] = Field(default=None, min_length=3, max_length=20)
    email: EmailStr
    password: str = Field(..., min_length=8)
    phone: Optional[str] = None

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not re.match(r"^\+?[0-9]{10,15}$", v):
            raise ValueError("Некорректный формат телефона")
        return v


class UserOutSchema(BaseModel):
    """Схема ответа с данными пользователя (без пароля)."""
    id: int
    username: str
    email: Optional[str] = None
    phone_number: Optional[str] = None

    model_config = {"from_attributes": True}
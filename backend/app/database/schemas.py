import re

from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime


class BaseSchema(BaseModel):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {
            "from_attributes": True
        }


class UserCreateSchema(BaseSchema):
    username: Optional[str] = Field(default=None, min_length=3, max_length=20)
    email: EmailStr
    password: str = Field(..., min_length=8)
    phone: Optional[str] = None
    
    @field_validator('phone')
    def validate_phone(cls, v):
        if v is not None:
            pass
            if not re.match(r'^\+?[0-9]{10,15}$', v):
                raise ValueError('Некорректный формат телефона')
        return v
    
class UserOutSchema(BaseModel):
    pass
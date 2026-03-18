"""Pydantic схемы для сценариев."""

from datetime import datetime
from enum import Enum
from typing import Optional, List

from pydantic import BaseModel, Field, ConfigDict


class ScenarioStatusEnum(str, Enum):
    """Статус сценария."""
    DRAFT = "draft"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class ScenarioBase(BaseModel):
    """Базовая схема сценария."""
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    description: Optional[str] = Field(default=None, max_length=500)
    status: ScenarioStatusEnum = Field(default=ScenarioStatusEnum.DRAFT)


class ScenarioCreateSchema(ScenarioBase):
    """Схема для создания сценария."""
    pass


class ScenarioUpdateSchema(BaseModel):
    """Схема для обновления сценария (все поля опциональны)."""
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    content: Optional[str] = Field(default=None, min_length=1)
    description: Optional[str] = Field(default=None, max_length=500)
    status: Optional[ScenarioStatusEnum] = Field(default=None)


class ScenarioOutSchema(BaseModel):
    """Схема ответа с данными сценария."""
    id: int
    title: str
    content: str
    description: Optional[str] = None
    status: ScenarioStatusEnum
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ScenarioListOutSchema(BaseModel):
    """Схема ответа со списком сценариев (краткая информация)."""
    id: int
    title: str
    description: Optional[str] = None
    status: ScenarioStatusEnum
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

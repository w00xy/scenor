from fastapi import APIRouter, Depends, HTTPException

from database.engine import get_db
from schemas import UserCreateSchema, UserOutSchema
from repositories.user_service import create_user, get_user_by_id, UserAlreadyExistsError
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=UserOutSchema, status_code=201)
async def register_user(
    user_data: UserCreateSchema,
    db: AsyncSession = Depends(get_db),
):
    """Регистрация пользователя. Email обязателен, пароль от 8 символов."""
    try:
        user = await create_user(db, user_data)
    except UserAlreadyExistsError as e:
        raise HTTPException(status_code=409, detail=str(e))
    return user


@router.get("/", response_model=UserOutSchema)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Получить пользователя по id."""
    user = await get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return user

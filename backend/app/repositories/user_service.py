from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import User
from schemas import UserCreateSchema
from core.security import hash_password


class UserAlreadyExistsError(Exception):
    """Пользователь с таким email или username уже существует."""


async def create_user(db: AsyncSession, user_data: UserCreateSchema) -> User:
    """
    Создаёт пользователя в БД. Коммит и при конфликте — rollback выполняются здесь.
    При дубликате email/username выбрасывает UserAlreadyExistsError.
    """
    username = user_data.username or user_data.email.split("@")[0]
    hashed_password = hash_password(user_data.password)
    user = User(
        username=username,
        email=user_data.email,
        phone_number=user_data.phone,
        hashed_pwd=hashed_password,
    )
    db.add(user)
    try:
        await db.commit()
        await db.refresh(user)
        return user
    except IntegrityError:
        await db.rollback()
        raise UserAlreadyExistsError(
            "Пользователь с таким email или именем уже существует"
        )


async def get_user_by_id(db: AsyncSession, user_id: int) -> User | None:
    """Возвращает пользователя по id или None."""
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalars().one_or_none()

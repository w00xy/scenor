"""Репозиторий для работы со сценариями."""

from sqlalchemy import select, func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import Scenario, ScenarioStatus
from schemas.scenario import ScenarioCreateSchema, ScenarioUpdateSchema, ScenarioStatusEnum


class ScenarioNotFoundError(Exception):
    """Сценарий не найден."""


class ScenarioAccessDeniedError(Exception):
    """Доступ к сценарию запрещён."""


async def create_scenario(
    db: AsyncSession,
    user_id: int,
    scenario_data: ScenarioCreateSchema
) -> Scenario:
    """
    Создаёт новый сценарий в БД.
    
    Args:
        db: Сессия базы данных
        user_id: ID пользователя-владельца
        scenario_data: Данные для создания сценария
        
    Returns:
        Созданный сценарий
    """
    scenario = Scenario(
        title=scenario_data.title,
        content=scenario_data.content,
        description=scenario_data.description,
        status=ScenarioStatus(scenario_data.status.value),
        user_id=user_id,
    )
    db.add(scenario)
    await db.commit()
    await db.refresh(scenario)
    return scenario


async def get_scenario_by_id(
    db: AsyncSession,
    scenario_id: int
) -> Scenario | None:
    """
    Возвращает сценарий по ID или None.
    
    Args:
        db: Сессия базы данных
        scenario_id: ID сценария
        
    Returns:
        Сценарий или None
    """
    result = await db.execute(
        select(Scenario).where(Scenario.id == scenario_id)
    )
    return result.scalars().one_or_none()


async def get_scenarios_by_user_id(
    db: AsyncSession,
    user_id: int,
    limit: int = 20,
    offset: int = 0,
    status: ScenarioStatusEnum | None = None,
) -> list[Scenario]:
    """
    Возвращает список сценариев пользователя с пагинацией и фильтрацией.
    
    Args:
        db: Сессия базы данных
        user_id: ID владельца
        limit: Максимальное количество результатов
        offset: Смещение для пагинации
        status: Фильтр по статусу (опционально)
        
    Returns:
        Список сценариев
    """
    query = select(Scenario).where(Scenario.user_id == user_id)
    
    if status:
        query = query.where(Scenario.status == ScenarioStatus(status.value))
    
    query = query.order_by(Scenario.updated_at.desc()).limit(limit).offset(offset)
    
    result = await db.execute(query)
    return list(result.scalars().all())


async def update_scenario(
    db: AsyncSession,
    scenario: Scenario,
    scenario_data: ScenarioUpdateSchema
) -> Scenario:
    """
    Обновляет сценарий.
    
    Args:
        db: Сессия базы данных
        scenario: Сценарий для обновления
        scenario_data: Данные для обновления
        
    Returns:
        Обновлённый сценарий
    """
    update_data = scenario_data.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        if field == "status" and value is not None:
            value = ScenarioStatus(value.value)
        setattr(scenario, field, value)
    
    await db.commit()
    await db.refresh(scenario)
    return scenario


async def delete_scenario(
    db: AsyncSession,
    scenario: Scenario
) -> None:
    """
    Удаляет сценарий из БД.
    
    Args:
        db: Сессия базы данных
        scenario: Сценарий для удаления
    """
    await db.delete(scenario)
    await db.commit()


async def get_scenarios_count_by_user_id(
    db: AsyncSession,
    user_id: int,
    status: ScenarioStatusEnum | None = None,
) -> int:
    """
    Возвращает количество сценариев пользователя.
    
    Args:
        db: Сессия базы данных
        user_id: ID владельца
        status: Фильтр по статусу (опционально)
        
    Returns:
        Количество сценариев
    """
    query = select(func.count()).select_from(Scenario).where(Scenario.user_id == user_id)
    
    if status:
        query = query.where(Scenario.status == ScenarioStatus(status.value))
    
    result = await db.execute(query)
    return result.scalar() or 0


async def check_user_scenario_access(
    db: AsyncSession,
    scenario_id: int,
    user_id: int
) -> Scenario | None:
    """
    Проверяет доступ пользователя к сценарию (владелец или шаринг).
    Пока реализована только проверка владельца.
    
    Args:
        db: Сессия базы данных
        scenario_id: ID сценария
        user_id: ID пользователя
        
    Returns:
        Сценарий если есть доступ, иначе None
    """
    scenario = await get_scenario_by_id(db, scenario_id)
    if scenario and scenario.user_id == user_id:
        return scenario
    # TODO: Добавить проверку шаринга (ScenarioShare)
    return None

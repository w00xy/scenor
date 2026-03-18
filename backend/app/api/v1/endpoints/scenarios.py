"""API эндпоинты для управления сценариями."""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from database.engine import get_db
from database.models import User
from schemas.scenario import (
    ScenarioCreateSchema,
    ScenarioUpdateSchema,
    ScenarioOutSchema,
    ScenarioListOutSchema,
    ScenarioStatusEnum,
)
from repositories import (
    create_scenario,
    get_scenario_by_id,
    get_scenarios_by_user_id,
    update_scenario,
    delete_scenario,
    check_user_scenario_access,
    ScenarioNotFoundError,
)
from core.deps import get_current_user

router = APIRouter(prefix="/scenarios", tags=["scenarios"])


@router.post("/", response_model=ScenarioOutSchema, status_code=status.HTTP_201_CREATED)
async def create_new_scenario(
    scenario_data: ScenarioCreateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Scenario:
    """
    Создать новый сценарий.
    
    Требуется авторизация. Сценарий создаётся со статусом DRAFT.
    """
    scenario = await create_scenario(db, current_user.id, scenario_data)
    return scenario


@router.get("/", response_model=list[ScenarioListOutSchema])
async def get_user_scenarios(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    status_filter: ScenarioStatusEnum | None = Query(
        default=None, alias="status", description="Фильтр по статусу"
    ),
    limit: int = Query(default=20, ge=1, le=100, description="Максимум результатов"),
    offset: int = Query(default=0, ge=0, description="Смещение"),
) -> list[Scenario]:
    """
    Получить список сценариев текущего пользователя.
    
    Поддерживает пагинацию (limit/offset) и фильтрацию по статусу.
    """
    scenarios = await get_scenarios_by_user_id(
        db,
        current_user.id,
        limit=limit,
        offset=offset,
        status=status_filter,
    )
    return scenarios


@router.get("/{scenario_id}", response_model=ScenarioOutSchema)
async def get_scenario(
    scenario_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Scenario:
    """
    Получить сценарий по ID.
    
    Доступен только сценарий, принадлежащий текущему пользователю.
    """
    scenario = await check_user_scenario_access(db, scenario_id, current_user.id)
    if scenario is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Сценарий не найден или доступ запрещён",
        )
    return scenario


@router.put("/{scenario_id}", response_model=ScenarioOutSchema)
async def update_scenario_endpoint(
    scenario_id: int,
    scenario_data: ScenarioUpdateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Scenario:
    """
    Обновить сценарий по ID.
    
    Можно обновить title, content, description, status.
    Доступно только владельцу сценария.
    """
    scenario = await check_user_scenario_access(db, scenario_id, current_user.id)
    if scenario is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Сценарий не найден или доступ запрещён",
        )
    
    updated_scenario = await update_scenario(db, scenario, scenario_data)
    return updated_scenario


@router.delete("/{scenario_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_scenario_endpoint(
    scenario_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """
    Удалить сценарий по ID.
    
    Доступно только владельцу сценария.
    """
    scenario = await check_user_scenario_access(db, scenario_id, current_user.id)
    if scenario is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Сценарий не найден или доступ запрещён",
        )
    
    await delete_scenario(db, scenario)

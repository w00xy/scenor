"""Тесты API сценариев: CRUD операции."""

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def scenario_data():
    """Базовые данные для создания сценария."""
    return {
        "title": "Тестовый сценарий",
        "content": "Это содержимое тестового сценария.",
        "description": "Описание для тестирования",
        "status": "draft",
    }


@pytest.fixture
def created_scenario(client: TestClient, auth_headers: dict, scenario_data: dict):
    """Создаёт сценарий и возвращает его ID."""
    resp = client.post(
        "/api/v1/scenarios/",
        json=scenario_data,
        headers=auth_headers,
    )
    assert resp.status_code == 201
    return resp.json()


class TestCreateScenario:
    """Тесты создания сценария."""

    def test_create_scenario_success(self, client: TestClient, auth_headers: dict, scenario_data: dict):
        """Успешное создание сценария."""
        resp = client.post(
            "/api/v1/scenarios/",
            json=scenario_data,
            headers=auth_headers,
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["title"] == scenario_data["title"]
        assert data["content"] == scenario_data["content"]
        assert data["status"] == "draft"
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data

    def test_create_scenario_minimal(self, client: TestClient, auth_headers: dict):
        """Создание сценария с минимальными данными (только title и content)."""
        resp = client.post(
            "/api/v1/scenarios/",
            json={
                "title": "Минимальный сценарий",
                "content": "Контент",
            },
            headers=auth_headers,
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["title"] == "Минимальный сценарий"
        assert data["description"] is None
        assert data["status"] == "draft"

    def test_create_scenario_all_statuses(self, client: TestClient, auth_headers: dict):
        """Создание сценариев со всеми статусами."""
        for status in ["draft", "in_progress", "completed", "archived"]:
            resp = client.post(
                "/api/v1/scenarios/",
                json={
                    "title": f"Сценарий {status}",
                    "content": "Контент",
                    "status": status,
                },
                headers=auth_headers,
            )
            assert resp.status_code == 201
            assert resp.json()["status"] == status

    def test_create_scenario_unauthorized(self, client: TestClient, scenario_data: dict):
        """Создание без авторизации — 401."""
        resp = client.post(
            "/api/v1/scenarios/",
            json=scenario_data,
        )
        assert resp.status_code == 401

    def test_create_scenario_invalid_title(self, client: TestClient, auth_headers: dict):
        """Пустой заголовок — 422."""
        resp = client.post(
            "/api/v1/scenarios/",
            json={
                "title": "",
                "content": "Контент",
            },
            headers=auth_headers,
        )
        assert resp.status_code == 422

    def test_create_scenario_long_title(self, client: TestClient, auth_headers: dict):
        """Заголовок длиннее 200 символов — 422."""
        resp = client.post(
            "/api/v1/scenarios/",
            json={
                "title": "A" * 201,
                "content": "Контент",
            },
            headers=auth_headers,
        )
        assert resp.status_code == 422


class TestGetScenarios:
    """Тесты получения списка сценариев."""

    def test_get_scenarios_empty(self, client: TestClient, auth_headers: dict):
        """Получение списка, когда сценариев нет."""
        resp = client.get(
            "/api/v1/scenarios/",
            headers=auth_headers,
        )
        assert resp.status_code == 200
        assert resp.json() == []

    def test_get_scenarios_with_data(self, client: TestClient, auth_headers: dict, created_scenario: dict):
        """Получение списка с созданным сценарием."""
        resp = client.get(
            "/api/v1/scenarios/",
            headers=auth_headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["id"] == created_scenario["id"]
        assert data[0]["title"] == created_scenario["title"]

    def test_get_scenarios_pagination(self, client: TestClient, auth_headers: dict):
        """Пагинация: limit и offset."""
        # Создаём 5 сценариев
        for i in range(5):
            client.post(
                "/api/v1/scenarios/",
                json={"title": f"Сценарий {i}", "content": f"Контент {i}"},
                headers=auth_headers,
            )
        
        # Получаем первые 2
        resp = client.get(
            "/api/v1/scenarios/",
            params={"limit": 2, "offset": 0},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        assert len(resp.json()) == 2
        
        # Получаем следующие 2
        resp = client.get(
            "/api/v1/scenarios/",
            params={"limit": 2, "offset": 2},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        assert len(resp.json()) == 2

    def test_get_scenarios_filter_by_status(self, client: TestClient, auth_headers: dict):
        """Фильтрация по статусу."""
        # Создаём сценарии разных статусов
        client.post(
            "/api/v1/scenarios/",
            json={"title": "Draft", "content": "c", "status": "draft"},
            headers=auth_headers,
        )
        client.post(
            "/api/v1/scenarios/",
            json={"title": "Completed", "content": "c", "status": "completed"},
            headers=auth_headers,
        )
        
        # Фильтруем по draft
        resp = client.get(
            "/api/v1/scenarios/",
            params={"status": "draft"},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["status"] == "draft"

    def test_get_scenarios_unauthorized(self, client: TestClient):
        """Получение списка без авторизации — 401."""
        resp = client.get("/api/v1/scenarios/")
        assert resp.status_code == 401


class TestGetScenario:
    """Тесты получения отдельного сценария."""

    def test_get_scenario_success(self, client: TestClient, auth_headers: dict, created_scenario: dict):
        """Успешное получение сценария по ID."""
        resp = client.get(
            f"/api/v1/scenarios/{created_scenario['id']}",
            headers=auth_headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == created_scenario["id"]
        assert data["title"] == created_scenario["title"]
        assert data["content"] == created_scenario["content"]

    def test_get_scenario_not_found(self, client: TestClient, auth_headers: dict):
        """Получение несуществующего сценария — 404."""
        resp = client.get(
            "/api/v1/scenarios/99999",
            headers=auth_headers,
        )
        assert resp.status_code == 404

    def test_get_scenario_other_user(self, client: TestClient, auth_headers: dict):
        """Попытка получить сценарий другого пользователя — 404."""
        # Создаём сценарий от имени другого пользователя (нужно зарегистрировать)
        client.post(
            "/api/v1/users/",
            json={"email": "other@example.com", "password": "password123", "username": "other"},
        )
        other_resp = client.post(
            "/api/v1/auth/login",
            json={"login": "other@example.com", "password": "password123"},
        )
        other_token = other_resp.json()["access_token"]
        
        # Создаём сценарий
        create_resp = client.post(
            "/api/v1/scenarios/",
            json={"title": "Other", "content": "content"},
            headers={"Authorization": f"Bearer {other_token}"},
        )
        other_scenario_id = create_resp.json()["id"]
        
        # Пытаемся получить чужой сценарий
        resp = client.get(
            f"/api/v1/scenarios/{other_scenario_id}",
            headers=auth_headers,
        )
        assert resp.status_code == 404


class TestUpdateScenario:
    """Тесты обновления сценария."""

    def test_update_scenario_success(self, client: TestClient, auth_headers: dict, created_scenario: dict):
        """Успешное обновление сценария."""
        update_data = {
            "title": "Обновлённый заголовок",
            "status": "in_progress",
        }
        resp = client.put(
            f"/api/v1/scenarios/{created_scenario['id']}",
            json=update_data,
            headers=auth_headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["title"] == update_data["title"]
        assert data["status"] == update_data["status"]
        # Поля, которые не обновляли, не изменились
        assert data["content"] == created_scenario["content"]

    def test_update_scenario_partial(self, client: TestClient, auth_headers: dict, created_scenario: dict):
        """Частичное обновление (только одно поле)."""
        resp = client.put(
            f"/api/v1/scenarios/{created_scenario['id']}",
            json={"description": "Новое описание"},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["description"] == "Новое описание"
        assert data["title"] == created_scenario["title"]  # Не изменился

    def test_update_scenario_not_found(self, client: TestClient, auth_headers: dict):
        """Обновление несуществующего сценария — 404."""
        resp = client.put(
            "/api/v1/scenarios/99999",
            json={"title": "New"},
            headers=auth_headers,
        )
        assert resp.status_code == 404

    def test_update_scenario_other_user(self, client: TestClient, auth_headers: dict):
        """Обновление чужого сценария — 404."""
        # Создаём сценарий от другого пользователя
        client.post(
            "/api/v1/users/",
            json={"email": "other2@example.com", "password": "password123", "username": "other2"},
        )
        other_resp = client.post(
            "/api/v1/auth/login",
            json={"login": "other2@example.com", "password": "password123"},
        )
        other_token = other_resp.json()["access_token"]
        
        create_resp = client.post(
            "/api/v1/scenarios/",
            json={"title": "Other", "content": "content"},
            headers={"Authorization": f"Bearer {other_token}"},
        )
        other_scenario_id = create_resp.json()["id"]
        
        # Пытаемся обновить
        resp = client.put(
            f"/api/v1/scenarios/{other_scenario_id}",
            json={"title": "Hacked"},
            headers=auth_headers,
        )
        assert resp.status_code == 404


class TestDeleteScenario:
    """Тесты удаления сценария."""

    def test_delete_scenario_success(self, client: TestClient, auth_headers: dict, created_scenario: dict):
        """Успешное удаление сценария."""
        resp = client.delete(
            f"/api/v1/scenarios/{created_scenario['id']}",
            headers=auth_headers,
        )
        assert resp.status_code == 204
        
        # Проверяем, что сценарий удалён
        get_resp = client.get(
            f"/api/v1/scenarios/{created_scenario['id']}",
            headers=auth_headers,
        )
        assert get_resp.status_code == 404

    def test_delete_scenario_not_found(self, client: TestClient, auth_headers: dict):
        """Удаление несуществующего сценария — 404."""
        resp = client.delete(
            "/api/v1/scenarios/99999",
            headers=auth_headers,
        )
        assert resp.status_code == 404

    def test_delete_scenario_other_user(self, client: TestClient, auth_headers: dict):
        """Удаление чужого сценария — 404."""
        # Создаём сценарий от другого пользователя
        client.post(
            "/api/v1/users/",
            json={"email": "other3@example.com", "password": "password123", "username": "other3"},
        )
        other_resp = client.post(
            "/api/v1/auth/login",
            json={"login": "other3@example.com", "password": "password123"},
        )
        other_token = other_resp.json()["access_token"]
        
        create_resp = client.post(
            "/api/v1/scenarios/",
            json={"title": "Other", "content": "content"},
            headers={"Authorization": f"Bearer {other_token}"},
        )
        other_scenario_id = create_resp.json()["id"]
        
        # Пытаемся удалить
        resp = client.delete(
            f"/api/v1/scenarios/{other_scenario_id}",
            headers=auth_headers,
        )
        assert resp.status_code == 404

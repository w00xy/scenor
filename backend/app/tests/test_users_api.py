"""Тесты эндпоинтов пользователей: регистрация, получение по id, /me."""
import pytest
from fastapi.testclient import TestClient


def test_register_success(client: TestClient):
    """Успешная регистрация возвращает 201 и данные пользователя без пароля."""
    resp = client.post(
        "/api/v1/users/",
        json={
            "email": "newuser@example.com",
            "password": "password123",
            "username": "newuser",
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == "newuser@example.com"
    assert data["username"] == "newuser"
    assert "id" in data
    assert "password" not in data
    assert "hashed_pwd" not in data


def test_register_without_username_uses_email_prefix(client: TestClient):
    """Если username не передан, берётся часть до @ из email."""
    resp = client.post(
        "/api/v1/users/",
        json={
            "email": "nousername@example.com",
            "password": "password123",
        },
    )
    assert resp.status_code == 201
    assert resp.json()["username"] == "nousername"


def test_register_duplicate_email_409(client: TestClient):
    """Повторная регистрация с тем же email — 409."""
    payload = {
        "email": "duplicate@example.com",
        "password": "password123",
        "username": "firstuser",
    }
    client.post("/api/v1/users/", json=payload)
    resp = client.post(
        "/api/v1/users/",
        json={
            "email": "duplicate@example.com",
            "password": "otherpass123",
            "username": "seconduser",
        },
    )
    assert resp.status_code == 409
    assert "уже существует" in resp.json().get("detail", "")


def test_register_validation_short_password(client: TestClient):
    """Пароль короче 8 символов — 422."""
    resp = client.post(
        "/api/v1/users/",
        json={
            "email": "short@example.com",
            "password": "short",
            "username": "shortuser",
        },
    )
    assert resp.status_code == 422


def test_register_validation_invalid_email(client: TestClient):
    """Некорректный email — 422."""
    resp = client.post(
        "/api/v1/users/",
        json={
            "email": "not-an-email",
            "password": "password123",
            "username": "someuser",
        },
    )
    assert resp.status_code == 422


def test_get_user_by_id_success(client: TestClient):
    """Получение пользователя по id возвращает 200 и данные."""
    create = client.post(
        "/api/v1/users/",
        json={
            "email": "getbyid@example.com",
            "password": "password123",
            "username": "getbyid",
        },
    )
    assert create.status_code == 201
    user_id = create.json()["id"]

    resp = client.get(f"/api/v1/users/?user_id={user_id}")
    assert resp.status_code == 200
    assert resp.json()["id"] == user_id
    assert resp.json()["email"] == "getbyid@example.com"


def test_get_user_by_id_not_found(client: TestClient):
    """Несуществующий id — 404."""
    resp = client.get("/api/v1/users/?user_id=99999")
    assert resp.status_code == 404
    assert "не найден" in resp.json().get("detail", "")


def test_get_me_without_token_401(client: TestClient):
    """GET /users/me без токена — 401."""
    resp = client.get("/api/v1/users/me")
    assert resp.status_code == 401


def test_get_me_with_invalid_token_401(client: TestClient):
    """GET /users/me с невалидным токеном — 401."""
    resp = client.get(
        "/api/v1/users/me",
        headers={"Authorization": "Bearer invalid.token.here"},
    )
    assert resp.status_code == 401


def test_get_me_success(client: TestClient, auth_headers: dict):
    """GET /users/me с валидным токеном возвращает текущего пользователя."""
    resp = client.get("/api/v1/users/me", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == "testuser@example.com"
    assert data["username"] == "testuser"
    assert "id" in data

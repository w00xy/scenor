"""Тесты эндпоинтов авторизации: login, refresh."""
import pytest
from fastapi.testclient import TestClient


def test_login_success(client: TestClient):
    """Успешный вход по email и паролю возвращает access и refresh токены."""
    client.post(
        "/api/v1/users/",
        json={
            "email": "loginuser@example.com",
            "password": "securepass123",
            "username": "loginuser",
        },
    )
    resp = client.post(
        "/api/v1/auth/login",
        json={"login": "loginuser@example.com", "password": "securepass123"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data.get("token_type") == "bearer"
    assert "refresh_token" in data
    assert len(data["access_token"]) > 0
    assert len(data["refresh_token"]) > 0


def test_login_by_username_success(client: TestClient):
    """Вход по username (не email) тоже работает."""
    client.post(
        "/api/v1/users/",
        json={
            "email": "username_login@example.com",
            "password": "pass12345",
            "username": "uniquelogin",
        },
    )
    resp = client.post(
        "/api/v1/auth/login",
        json={"login": "uniquelogin", "password": "pass12345"},
    )
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_login_wrong_password(client: TestClient):
    """Неверный пароль — 401."""
    client.post(
        "/api/v1/users/",
        json={
            "email": "wrongpass@example.com",
            "password": "correct123",
            "username": "wrongpass",
        },
    )
    resp = client.post(
        "/api/v1/auth/login",
        json={"login": "wrongpass@example.com", "password": "wrongpassword"},
    )
    assert resp.status_code == 401
    assert "Неверный логин или пароль" in resp.json().get("detail", "")


def test_login_nonexistent_user(client: TestClient):
    """Несуществующий пользователь — 401."""
    resp = client.post(
        "/api/v1/auth/login",
        json={"login": "nosuchuser@example.com", "password": "anypass123"},
    )
    assert resp.status_code == 401


def test_login_validation_empty(client: TestClient):
    """Пустой логин — 401 (пользователь не найден) или 422 при валидации."""
    resp = client.post(
        "/api/v1/auth/login",
        json={"login": "", "password": "pass"},
    )
    assert resp.status_code in (401, 422)


def test_refresh_success(client: TestClient):
    """Валидный refresh токен возвращает новую пару access и refresh."""
    client.post(
        "/api/v1/users/",
        json={
            "email": "refreshuser@example.com",
            "password": "refreshpass123",
            "username": "refreshuser",
        },
    )
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"login": "refreshuser@example.com", "password": "refreshpass123"},
    )
    assert login_resp.status_code == 200
    refresh_token = login_resp.json()["refresh_token"]

    resp = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data
    # Новая пара токенов выдаётся; access может совпасть, если создан в ту же секунду
    assert isinstance(data["access_token"], str) and isinstance(data["refresh_token"], str)


def test_refresh_invalid_token(client: TestClient):
    """Невалидный refresh токен — 401."""
    resp = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": "invalid.jwt.token"},
    )
    assert resp.status_code == 401
    assert "detail" in resp.json()

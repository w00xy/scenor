"""
Фикстуры для тестов: тестовая БД, клиент, зарегистрированный пользователь с токеном.
Перед импортом app задаём тестовый DB_URL.
"""
import os
import asyncio

import pytest
from fastapi.testclient import TestClient

# Задаём тестовую БД до импорта приложения (настройки читаются при первом импорте)
os.environ.setdefault("DB_URL", "sqlite:///test.db")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-for-pytest-32bytes-long!!")
os.environ.setdefault("JWT_ALGORITHM", "HS256")
os.environ.setdefault("ADMIN_LOGIN", "admin")
os.environ.setdefault("ADMIN_PASSWORD", "testadmin")

from app.main import app
from app.database.engine import init_db, drop_db


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
def init_test_db(event_loop):
    """Пересоздать таблицы в тестовой БД один раз за сессию (актуальная схема)."""
    event_loop.run_until_complete(drop_db())
    event_loop.run_until_complete(init_db())


@pytest.fixture
def client(init_test_db):
    """HTTP-клиент для запросов к API."""
    return TestClient(app)


@pytest.fixture(scope="session")
def _registered_user(init_test_db):
    """Один раз за сессию регистрирует пользователя для авторизованных тестов."""
    with TestClient(app) as c:
        c.post(
            "/api/v1/users/",
            json={
                "email": "testuser@example.com",
                "password": "password123",
                "username": "testuser",
            },
        )
    return None


@pytest.fixture
def auth_headers(client, _registered_user):
    """Заголовки с Bearer-токеном (логин как testuser@example.com)."""
    resp = client.post(
        "/api/v1/auth/login",
        json={"login": "testuser@example.com", "password": "password123"},
    )
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

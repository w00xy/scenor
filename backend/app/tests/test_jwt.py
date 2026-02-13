"""Юнит-тесты JWT: создание и декодирование access/refresh токенов."""
import pytest
import jwt as pyjwt


def test_create_access_token_returns_string():
    from app.core.jwt import create_access_token

    token = create_access_token(1)
    assert isinstance(token, str)
    assert len(token) > 0
    assert token.count(".") == 2  # JWT format


def test_decode_access_token_returns_payload():
    from app.core.jwt import create_access_token, decode_access_token

    token = create_access_token(42)
    payload = decode_access_token(token)
    assert payload["sub"] == "42"
    assert payload.get("type") == "access"
    assert "exp" in payload


def test_decode_access_token_invalid_raises():
    from app.core.jwt import decode_access_token

    with pytest.raises(Exception):
        decode_access_token("invalid.token.here")


def test_decode_access_token_wrong_type_raises():
    """Передача refresh-токена в decode_access_token должна вызывать ошибку."""
    from app.core.jwt import create_refresh_token, decode_access_token

    refresh = create_refresh_token(1)
    with pytest.raises(pyjwt.InvalidTokenError):
        decode_access_token(refresh)


def test_create_refresh_token_returns_string():
    from app.core.jwt import create_refresh_token

    token = create_refresh_token(1)
    assert isinstance(token, str)
    assert len(token) > 0


def test_decode_refresh_token_returns_payload():
    from app.core.jwt import create_refresh_token, decode_refresh_token

    token = create_refresh_token(99)
    payload = decode_refresh_token(token)
    assert payload["sub"] == "99"
    assert payload.get("type") == "refresh"
    assert "exp" in payload


def test_decode_refresh_token_wrong_type_raises():
    """Передача access-токена в decode_refresh_token должна вызывать ошибку."""
    from app.core.jwt import create_access_token, decode_refresh_token

    access = create_access_token(1)
    with pytest.raises(pyjwt.InvalidTokenError):
        decode_refresh_token(access)


def test_access_and_refresh_tokens_differ():
    from app.core.jwt import create_access_token, create_refresh_token

    user_id = 5
    access = create_access_token(user_id)
    refresh = create_refresh_token(user_id)
    assert access != refresh

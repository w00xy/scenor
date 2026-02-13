"""Юнит-тесты хэширования паролей."""
import pytest


def test_hash_password_returns_non_empty_string():
    from app.core.security import hash_password

    result = hash_password("mysecret")
    assert isinstance(result, str)
    assert len(result) > 0
    assert result != "mysecret"
    assert "argon2" in result or len(result) > 20


def test_hash_password_different_each_time():
    """Один и тот же пароль даёт разный хэш (из-за соли)."""
    from app.core.security import hash_password

    a = hash_password("samepass")
    b = hash_password("samepass")
    assert a != b


def test_verify_password_correct():
    """Верный пароль проходит проверку."""
    from app.core.security import hash_password, verify_password

    hashed = hash_password("correct")
    assert verify_password("correct", hashed) is True


def test_verify_password_wrong():
    """Неверный пароль не проходит проверку."""
    from app.core.security import hash_password, verify_password

    hashed = hash_password("correct")
    assert verify_password("wrong", hashed) is False


def test_verify_password_empty_plain():
    from app.core.security import hash_password, verify_password

    hashed = hash_password("any")
    assert verify_password("", hashed) is False

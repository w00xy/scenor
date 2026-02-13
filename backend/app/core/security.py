from pwdlib import PasswordHash

# Argon2 с безопасными параметрами по умолчанию
password_hash = PasswordHash.recommended()


def hash_password(plain: str) -> str:
    """Хэширует пароль. Возвращает строку вида '$argon2...'."""
    return password_hash.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Проверяет пароль против сохранённого хэша. Возвращает True при совпадении."""
    return password_hash.verify(plain, hashed)

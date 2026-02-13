# Backend

## Запуск тестов

**Важно:** тесты нужно запускать из каталога `backend` (здесь должен быть `pyproject.toml` и папка `app/`).

```bash
cd backend
uv run pytest
```

Проверить, что всё работает:

```bash
cd backend && uv run pytest
```

При необходимости запуск только части тестов:

```bash
cd backend
uv run pytest app/tests/test_auth_api.py -v
```

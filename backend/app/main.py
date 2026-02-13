import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.v1.api import api_v1_router
from core.config import settings

app = FastAPI(
    title="API сайта scenor.ru",
    description="API включает в себя модули для работы с пользователями и диалогами пользователей",
    version="1.0.0",
    docs_url="/docs",
    openapi_url="/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ALLOW_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS,
)

# Подключаем роутеры API
app.include_router(api_v1_router, prefix="/api/v1")

# Запуск приложения через uvicorn, если файл запущен напрямую
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, log_level="info", reload=True)
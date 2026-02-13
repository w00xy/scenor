from fastapi import APIRouter

from api.v1.endpoints import hello, users

api_v1_router = APIRouter()
api_v1_router.include_router(hello.router)
api_v1_router.include_router(users.router)
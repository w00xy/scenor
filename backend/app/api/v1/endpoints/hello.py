from fastapi import APIRouter, Depends, HTTPException

router = APIRouter(prefix="/hello", tags=["hello"])

@router.get("/")
def read_root():
    return {"Hello": "World"}
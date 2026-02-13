from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import DeclarativeBase, relationship
from sqlalchemy import func

class Base(DeclarativeBase):
    pass

class BaseModel(Base):
    __abstract__ = True
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class User(BaseModel):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(20), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=True, default=None)
    phone_number = Column(String(20), nullable=True, unique=False, index=False)
    hashed_pwd = Column(String, nullable=False)
import enum

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum
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


class ScenarioStatus(enum.Enum):
    """Статус сценария."""
    DRAFT = "draft"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class Scenario(BaseModel):
    __tablename__ = "scenarios"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    description = Column(String(500), nullable=True, default=None)
    status = Column(
        Enum(ScenarioStatus, name="scenario_status"),
        default=ScenarioStatus.DRAFT,
        nullable=False
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Связи
    user = relationship("User", back_populates="scenarios")
    tags = relationship("Tag", secondary="scenario_tags", back_populates="scenarios")
    comments = relationship("Comment", back_populates="scenario", cascade="all, delete-orphan")
    shares = relationship("ScenarioShare", back_populates="scenario", cascade="all, delete-orphan")


# Добавляем обратную связь для User
User.scenarios = relationship("Scenario", back_populates="user", cascade="all, delete-orphan")


class Tag(BaseModel):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )

    # Связи
    user = relationship("User", back_populates="tags")
    scenarios = relationship("Scenario", secondary="scenario_tags", back_populates="tags")


# Добавляем обратную связь для User
User.tags = relationship("Tag", back_populates="user", cascade="all, delete-orphan")


class ScenarioTag(Base):
    """Таблица связи многие-ко-многим для сценариев и тегов."""
    __tablename__ = "scenario_tags"

    scenario_id = Column(
        Integer,
        ForeignKey("scenarios.id", ondelete="CASCADE"),
        primary_key=True
    )
    tag_id = Column(
        Integer,
        ForeignKey("tags.id", ondelete="CASCADE"),
        primary_key=True
    )


class Comment(BaseModel):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    content = Column(Text, nullable=False)
    scenario_id = Column(
        Integer,
        ForeignKey("scenarios.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    parent_id = Column(
        Integer,
        ForeignKey("comments.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )

    # Связи
    scenario = relationship("Comment", back_populates="scenario")
    user = relationship("User", back_populates="comments")
    parent = relationship("Comment", remote_side=[id], back_populates="replies")
    replies = relationship("Comment", back_populates="parent")


# Добавляем обратную связь для User
User.comments = relationship("Comment", back_populates="user", cascade="all, delete-orphan")


class ScenarioShare(BaseModel):
    __tablename__ = "scenario_shares"

    id = Column(Integer, primary_key=True, autoincrement=True)
    scenario_id = Column(
        Integer,
        ForeignKey("scenarios.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    permission = Column(String(20), nullable=False, default="view")

    # Связи
    scenario = relationship("Scenario", back_populates="shares")
    user = relationship("User", back_populates="scenario_shares")


# Добавляем обратную связь для User
User.scenario_shares = relationship("ScenarioShare", back_populates="user", cascade="all, delete-orphan")
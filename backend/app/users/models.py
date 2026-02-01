from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin

class User(Base, TimestampMixin):
    __tablename__ = "users"

    # 基本信息
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)

    # 状态字段
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)

    # 与其他模块的关系（先保留骨架，避免报错）
    knowledge_bases = relationship("KnowledgeBase", back_populates="user")
    chats = relationship("Chat", back_populates="user")
    api_keys = relationship(
        "APIKey", back_populates="user", cascade="all, delete-orphan"
    )

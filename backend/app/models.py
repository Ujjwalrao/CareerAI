import uuid
from datetime import datetime

from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.database import Base


def gen_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=True)  # nullable — Google-only accounts have no password
    google_id = Column(String, unique=True, nullable=True)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Telegram linking — user gets a one-time code, sends "/start <code>" to the
    # bot, the webhook matches it and fills in telegram_chat_id permanently
    telegram_link_code = Column(String, nullable=True, unique=True)
    telegram_chat_id = Column(String, nullable=True)

    resumes = relationship("Resume", back_populates="owner", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="owner", cascade="all, delete-orphan")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String, primary_key=True, default=gen_uuid)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)

    role = Column(String, nullable=False)
    score = Column(Float, default=0)
    summary = Column(String, default="")

    # Stored as JSON to mirror types.ts shape directly — no extra join tables needed
    experience = Column(JSON, default=list)   # [{company, role, period, bullets}]
    education = Column(JSON, default=list)    # [{institution, degree, period}]
    skills = Column(JSON, default=list)       # [string]

    # 768-dim to match Gemini text-embedding-004 output; used for JD cosine matching
    embedding = Column(Vector(768), nullable=True)

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="resumes")


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(String, primary_key=True, default=gen_uuid)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)

    role = Column(String, nullable=False)
    question = Column(String, nullable=False)
    sample_answer = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)


class Application(Base):
    __tablename__ = "applications"

    id = Column(String, primary_key=True, default=gen_uuid)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)

    company = Column(String, nullable=False)
    role = Column(String, nullable=False)
    applied_date = Column(String, nullable=False)  # kept as ISO date string to mirror frontend directly
    status = Column(String, default="Applied")     # Applied | Interview | Offer | Rejected
    resume_tag = Column(String, default="")
    salary = Column(String, nullable=True)
    notes = Column(String, nullable=True)

    # Used by the reminder cron to avoid re-notifying about the same stale application
    last_reminded_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="applications")

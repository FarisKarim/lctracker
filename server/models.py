from datetime import datetime, timedelta
from enum import Enum
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from database import Base


class Difficulty(str, Enum):
    EASY = "EASY"
    MEDIUM = "MEDIUM"
    HARD = "HARD"


class Outcome(str, Enum):
    PASS = "PASS"
    SHAKY = "SHAKY"
    FAIL = "FAIL"
    SKIP = "SKIP"
    POSTPONE = "POSTPONE"


class Problem(Base):
    __tablename__ = "problems"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    platform = Column(String, default="LeetCode")
    url = Column(String, nullable=True)
    difficulty = Column(String, nullable=False)
    tags = Column(Text, default="[]")  # JSON array as string
    notes_trick = Column(Text, nullable=True)
    notes_mistakes = Column(Text, nullable=True)
    notes_edge_cases = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Scheduling fields
    next_due_date = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(days=1))
    interval_days = Column(Integer, default=1)
    mastery_stage = Column(Integer, default=0)  # 0-5 mapping to ladder
    consecutive_successes = Column(Integer, default=0)
    last_outcome = Column(String, nullable=True)
    last_attempted_at = Column(DateTime, nullable=True)

    attempts = relationship("Attempt", back_populates="problem", cascade="all, delete-orphan")


class Attempt(Base):
    __tablename__ = "attempts"

    id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(Integer, ForeignKey("problems.id", ondelete="CASCADE"))
    attempted_at = Column(DateTime, default=datetime.utcnow)
    outcome = Column(String, nullable=False)
    time_spent_minutes = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)

    # Stage transition tracking
    stage_before = Column(Integer, nullable=True)
    stage_after = Column(Integer, nullable=True)
    next_due_date_after = Column(DateTime, nullable=True)

    problem = relationship("Problem", back_populates="attempts")

from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, field_validator


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


# Problem schemas
class ProblemBase(BaseModel):
    title: str
    platform: str = "LeetCode"
    url: Optional[str] = None
    difficulty: Difficulty
    tags: list[str] = []
    notes_trick: Optional[str] = None
    notes_mistakes: Optional[str] = None
    notes_edge_cases: Optional[str] = None

    @field_validator("url")
    @classmethod
    def validate_url(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "":
            return None
        if not v.startswith(("http://", "https://")):
            raise ValueError("URL must start with http:// or https://")
        return v


class ProblemCreate(ProblemBase):
    pass


class ProblemUpdate(BaseModel):
    title: Optional[str] = None
    platform: Optional[str] = None
    url: Optional[str] = None
    difficulty: Optional[Difficulty] = None
    tags: Optional[list[str]] = None
    notes_trick: Optional[str] = None
    notes_mistakes: Optional[str] = None
    notes_edge_cases: Optional[str] = None

    @field_validator("url")
    @classmethod
    def validate_url(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "":
            return None
        if not v.startswith(("http://", "https://")):
            raise ValueError("URL must start with http:// or https://")
        return v


class ProblemResponse(ProblemBase):
    id: int
    created_at: datetime
    updated_at: datetime
    next_due_date: datetime
    interval_days: int
    mastery_stage: int
    consecutive_successes: int
    last_outcome: Optional[str] = None
    last_attempted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProblemWithAttemptsResponse(ProblemResponse):
    attempts: list["AttemptResponse"] = []


# Attempt schemas
class AttemptBase(BaseModel):
    outcome: Outcome
    time_spent_minutes: Optional[int] = None
    notes: Optional[str] = None


class AttemptCreate(AttemptBase):
    pass


class AttemptResponse(AttemptBase):
    id: int
    problem_id: int
    attempted_at: datetime
    stage_before: Optional[int] = None
    stage_after: Optional[int] = None
    next_due_date_after: Optional[datetime] = None

    class Config:
        from_attributes = True


# Today endpoint response
class TodayResponse(BaseModel):
    due: list[ProblemResponse]
    new: list[ProblemResponse]


# Stats response
class TagStats(BaseModel):
    tag: str
    total_attempts: int
    fail_rate: float


class StatsResponse(BaseModel):
    total_problems: int
    due_today: int
    overdue: int
    attempts_last_7_days: int
    attempts_last_30_days: int
    weak_tags: list[TagStats]


# History response
class HistoryAttemptResponse(BaseModel):
    id: int
    problem_id: int
    problem_title: str
    problem_difficulty: str
    attempted_at: datetime
    outcome: str
    time_spent_minutes: Optional[int] = None
    stage_before: Optional[int] = None
    stage_after: Optional[int] = None

    class Config:
        from_attributes = True


class HistoryResponse(BaseModel):
    attempts: list[HistoryAttemptResponse]
    total: int


# Update forward reference
ProblemWithAttemptsResponse.model_rebuild()

import json
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Problem
from schemas import TodayResponse

router = APIRouter(prefix="/api", tags=["today"])


def problem_to_response(problem: Problem) -> dict:
    """Convert Problem model to response dict with parsed tags."""
    return {
        "id": problem.id,
        "title": problem.title,
        "platform": problem.platform,
        "url": problem.url,
        "difficulty": problem.difficulty,
        "tags": json.loads(problem.tags) if problem.tags else [],
        "notes_trick": problem.notes_trick,
        "notes_mistakes": problem.notes_mistakes,
        "notes_edge_cases": problem.notes_edge_cases,
        "created_at": problem.created_at,
        "updated_at": problem.updated_at,
        "next_due_date": problem.next_due_date,
        "interval_days": problem.interval_days,
        "mastery_stage": problem.mastery_stage,
        "consecutive_successes": problem.consecutive_successes,
        "last_outcome": problem.last_outcome,
        "last_attempted_at": problem.last_attempted_at,
    }


@router.get("/today", response_model=TodayResponse)
def get_today(db: Session = Depends(get_db)):
    """
    Get problems for today's review session.

    Returns:
    - due: Problems where next_due_date <= end of today (overdue + due today)
    - new: Problems that have never been attempted (limit 5)
    """
    now = datetime.utcnow()
    end_of_today = now.replace(hour=23, minute=59, second=59, microsecond=999999)

    # Due Today: problems where next_due_date <= today
    due_problems = (
        db.query(Problem)
        .filter(Problem.next_due_date <= end_of_today)
        .order_by(Problem.next_due_date.asc())
        .all()
    )

    # Optional New: recently added but never attempted, limit 5
    # Exclude problems that are already in the due list
    due_ids = [p.id for p in due_problems]
    new_problems = (
        db.query(Problem)
        .filter(
            Problem.last_attempted_at.is_(None),
            ~Problem.id.in_(due_ids) if due_ids else True,
        )
        .order_by(Problem.created_at.desc())
        .limit(5)
        .all()
    )

    return {
        "due": [problem_to_response(p) for p in due_problems],
        "new": [problem_to_response(p) for p in new_problems],
    }

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from models import Attempt, Problem
from schemas import HistoryResponse

router = APIRouter(prefix="/api", tags=["history"])


@router.get("/history", response_model=HistoryResponse)
def get_history(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    outcome: Optional[str] = Query(None, description="Filter by outcome"),
    db: Session = Depends(get_db),
):
    """
    Get recent attempts across all problems.

    Returns attempts in reverse chronological order (most recent first).
    """
    query = db.query(Attempt, Problem).join(Problem)

    if outcome:
        query = query.filter(Attempt.outcome == outcome.upper())

    total = query.count()

    attempts = (
        query
        .order_by(Attempt.attempted_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return {
        "attempts": [
            {
                "id": a.id,
                "problem_id": a.problem_id,
                "problem_title": p.title,
                "problem_difficulty": p.difficulty,
                "attempted_at": a.attempted_at,
                "outcome": a.outcome,
                "time_spent_minutes": a.time_spent_minutes,
                "stage_before": a.stage_before,
                "stage_after": a.stage_after,
            }
            for a, p in attempts
        ],
        "total": total,
    }

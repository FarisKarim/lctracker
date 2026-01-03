import json
from collections import defaultdict
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Problem, Attempt
from schemas import StatsResponse, TagStats

router = APIRouter(prefix="/api", tags=["stats"])


@router.get("/stats", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    """
    Get statistics for the dashboard.

    Returns:
    - total_problems: Total number of problems tracked
    - due_today: Problems due today (next_due_date <= end of today)
    - overdue: Problems overdue (next_due_date < start of today)
    - attempts_last_7_days: Number of attempts in the last 7 days
    - attempts_last_30_days: Number of attempts in the last 30 days
    - weak_tags: Tags with fail rate > 40% in last 30 days
    """
    now = datetime.utcnow()
    start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    end_of_today = now.replace(hour=23, minute=59, second=59, microsecond=999999)
    thirty_days_ago = now - timedelta(days=30)
    seven_days_ago = now - timedelta(days=7)

    # Total problems
    total_problems = db.query(Problem).count()

    # Due today (including overdue)
    due_today = (
        db.query(Problem)
        .filter(Problem.next_due_date <= end_of_today)
        .count()
    )

    # Overdue (strictly before today)
    overdue = (
        db.query(Problem)
        .filter(Problem.next_due_date < start_of_today)
        .count()
    )

    # Attempts in last 7 days
    attempts_last_7_days = (
        db.query(Attempt)
        .filter(Attempt.attempted_at >= seven_days_ago)
        .count()
    )

    # Attempts in last 30 days
    attempts_last_30_days = (
        db.query(Attempt)
        .filter(Attempt.attempted_at >= thirty_days_ago)
        .count()
    )

    # Calculate weak tags (fail rate > 40% in last 30 days)
    recent_attempts = (
        db.query(Attempt, Problem)
        .join(Problem)
        .filter(Attempt.attempted_at >= thirty_days_ago)
        .filter(Attempt.outcome.in_(["PASS", "SHAKY", "FAIL"]))  # Only count real attempts
        .all()
    )

    tag_stats = defaultdict(lambda: {"total": 0, "failures": 0})

    for attempt, problem in recent_attempts:
        tags = json.loads(problem.tags) if problem.tags else []
        for tag in tags:
            tag_stats[tag]["total"] += 1
            if attempt.outcome in ["FAIL", "SHAKY"]:
                tag_stats[tag]["failures"] += 1

    # Calculate fail rates and filter weak tags
    weak_tags = []
    for tag, stats in tag_stats.items():
        if stats["total"] >= 3:  # Only consider tags with at least 3 attempts
            fail_rate = stats["failures"] / stats["total"]
            if fail_rate > 0.4:
                weak_tags.append(
                    TagStats(
                        tag=tag,
                        total_attempts=stats["total"],
                        fail_rate=round(fail_rate, 2),
                    )
                )

    # Sort by fail rate descending
    weak_tags.sort(key=lambda x: x.fail_rate, reverse=True)

    return StatsResponse(
        total_problems=total_problems,
        due_today=due_today,
        overdue=overdue,
        attempts_last_7_days=attempts_last_7_days,
        attempts_last_30_days=attempts_last_30_days,
        weak_tags=weak_tags[:5],  # Top 5 weakest tags
    )

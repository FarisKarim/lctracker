import json
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from models import Problem, Attempt
from schemas import (
    ProblemCreate,
    ProblemUpdate,
    ProblemResponse,
    ProblemWithAttemptsResponse,
    AttemptCreate,
    AttemptResponse,
)
from services.scheduling import update_schedule

router = APIRouter(prefix="/api/problems", tags=["problems"])


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


@router.get("", response_model=list[ProblemResponse])
def list_problems(
    search: Optional[str] = Query(None, description="Search by title"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty"),
    tag: Optional[str] = Query(None, description="Filter by tag"),
    status: Optional[str] = Query(None, description="Filter by status: overdue, due_soon, mastered"),
    sort: Optional[str] = Query("next_due_date", description="Sort by: next_due_date, last_attempted, difficulty, created_at"),
    db: Session = Depends(get_db),
):
    """List all problems with optional filters."""
    query = db.query(Problem)

    # Search filter
    if search:
        query = query.filter(Problem.title.ilike(f"%{search}%"))

    # Difficulty filter
    if difficulty:
        query = query.filter(Problem.difficulty == difficulty.upper())

    # Tag filter (search in JSON string)
    if tag:
        query = query.filter(Problem.tags.ilike(f'%"{tag}"%'))

    # Status filter
    now = datetime.utcnow()
    if status == "overdue":
        query = query.filter(Problem.next_due_date < now)
    elif status == "due_soon":
        from datetime import timedelta
        query = query.filter(
            Problem.next_due_date >= now,
            Problem.next_due_date <= now + timedelta(days=7)
        )
    elif status == "mastered":
        query = query.filter(Problem.mastery_stage >= 4)

    # Sorting
    if sort == "next_due_date":
        query = query.order_by(Problem.next_due_date.asc())
    elif sort == "last_attempted":
        query = query.order_by(Problem.last_attempted_at.desc().nullslast())
    elif sort == "difficulty":
        # Custom order: HARD > MEDIUM > EASY
        query = query.order_by(Problem.difficulty.desc())
    elif sort == "created_at":
        query = query.order_by(Problem.created_at.desc())

    problems = query.all()
    return [problem_to_response(p) for p in problems]


@router.get("/{problem_id}", response_model=ProblemWithAttemptsResponse)
def get_problem(problem_id: int, db: Session = Depends(get_db)):
    """Get a problem with its attempt history."""
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    response = problem_to_response(problem)
    response["attempts"] = [
        {
            "id": a.id,
            "problem_id": a.problem_id,
            "attempted_at": a.attempted_at,
            "outcome": a.outcome,
            "time_spent_minutes": a.time_spent_minutes,
            "notes": a.notes,
            "stage_before": a.stage_before,
            "stage_after": a.stage_after,
            "next_due_date_after": a.next_due_date_after,
        }
        for a in sorted(problem.attempts, key=lambda x: x.attempted_at, reverse=True)
    ]
    return response


@router.post("", response_model=ProblemResponse, status_code=201)
def create_problem(problem: ProblemCreate, db: Session = Depends(get_db)):
    """Create a new problem."""
    db_problem = Problem(
        title=problem.title,
        platform=problem.platform,
        url=problem.url,
        difficulty=problem.difficulty.value,
        tags=json.dumps(problem.tags),
        notes_trick=problem.notes_trick,
        notes_mistakes=problem.notes_mistakes,
        notes_edge_cases=problem.notes_edge_cases,
    )
    db.add(db_problem)
    db.commit()
    db.refresh(db_problem)
    return problem_to_response(db_problem)


@router.put("/{problem_id}", response_model=ProblemResponse)
def update_problem(problem_id: int, problem: ProblemUpdate, db: Session = Depends(get_db)):
    """Update a problem."""
    db_problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not db_problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    update_data = problem.model_dump(exclude_unset=True)

    # Handle tags specially (convert list to JSON string)
    if "tags" in update_data:
        update_data["tags"] = json.dumps(update_data["tags"])

    # Handle difficulty enum
    if "difficulty" in update_data and update_data["difficulty"]:
        update_data["difficulty"] = update_data["difficulty"].value

    for field, value in update_data.items():
        setattr(db_problem, field, value)

    db.commit()
    db.refresh(db_problem)
    return problem_to_response(db_problem)


@router.delete("/{problem_id}", status_code=204)
def delete_problem(problem_id: int, db: Session = Depends(get_db)):
    """Delete a problem."""
    db_problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not db_problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    db.delete(db_problem)
    db.commit()
    return None


@router.post("/{problem_id}/attempt", response_model=AttemptResponse)
def log_attempt(problem_id: int, attempt: AttemptCreate, db: Session = Depends(get_db)):
    """Log an attempt and update scheduling."""
    db_problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not db_problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    # Capture stage before update
    stage_before = db_problem.mastery_stage

    # Create attempt record
    db_attempt = Attempt(
        problem_id=problem_id,
        outcome=attempt.outcome.value,
        time_spent_minutes=attempt.time_spent_minutes,
        notes=attempt.notes,
        stage_before=stage_before,
    )
    db.add(db_attempt)

    # Update scheduling
    update_schedule(db_problem, attempt.outcome.value)

    # Capture stage after update
    db_attempt.stage_after = db_problem.mastery_stage
    db_attempt.next_due_date_after = db_problem.next_due_date

    db.commit()
    db.refresh(db_attempt)

    return {
        "id": db_attempt.id,
        "problem_id": db_attempt.problem_id,
        "attempted_at": db_attempt.attempted_at,
        "outcome": db_attempt.outcome,
        "time_spent_minutes": db_attempt.time_spent_minutes,
        "notes": db_attempt.notes,
        "stage_before": db_attempt.stage_before,
        "stage_after": db_attempt.stage_after,
        "next_due_date_after": db_attempt.next_due_date_after,
    }


@router.post("/{problem_id}/postpone", response_model=ProblemResponse)
def postpone_problem(problem_id: int, db: Session = Depends(get_db)):
    """Postpone a problem by 1 day."""
    db_problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not db_problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    # Capture stage before update
    stage_before = db_problem.mastery_stage

    # Log postpone attempt and update schedule
    db_attempt = Attempt(
        problem_id=problem_id,
        outcome="POSTPONE",
        stage_before=stage_before,
    )
    db.add(db_attempt)

    update_schedule(db_problem, "POSTPONE")

    # Capture stage after update
    db_attempt.stage_after = db_problem.mastery_stage
    db_attempt.next_due_date_after = db_problem.next_due_date

    db.commit()
    db.refresh(db_problem)

    return problem_to_response(db_problem)

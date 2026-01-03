from datetime import datetime, timedelta
from models import Problem, Outcome

# Interval ladder: stage -> days
INTERVAL_LADDER = {
    0: 1,
    1: 3,
    2: 7,
    3: 14,
    4: 30,
    5: 60,
}


def update_schedule(problem: Problem, outcome: str) -> None:
    """
    Update problem scheduling based on attempt outcome.

    Rules:
    - PASS: Advance up the ladder, increment consecutive successes
    - SHAKY: Drop one stage, reset consecutive successes, due in 3 days
    - FAIL: Reset to stage 0, reset consecutive successes, due tomorrow
    - SKIP: No mastery change, due tomorrow
    - POSTPONE: No mastery change, push due date by 1 day
    """
    now = datetime.utcnow()
    problem.last_attempted_at = now
    problem.last_outcome = outcome

    if outcome == Outcome.PASS.value:
        # Advance up the ladder
        problem.mastery_stage = min(problem.mastery_stage + 1, 5)
        problem.consecutive_successes += 1
        new_interval = INTERVAL_LADDER[problem.mastery_stage]
        problem.interval_days = new_interval
        problem.next_due_date = now + timedelta(days=new_interval)

    elif outcome == Outcome.SHAKY.value:
        # Drop one stage, due in 3 days
        problem.mastery_stage = max(problem.mastery_stage - 1, 0)
        problem.consecutive_successes = 0
        problem.interval_days = 3
        problem.next_due_date = now + timedelta(days=3)

    elif outcome == Outcome.FAIL.value:
        # Reset to stage 0, due tomorrow
        problem.mastery_stage = 0
        problem.consecutive_successes = 0
        problem.interval_days = 1
        problem.next_due_date = now + timedelta(days=1)

    elif outcome == Outcome.SKIP.value:
        # No mastery change, due tomorrow
        problem.next_due_date = now + timedelta(days=1)

    elif outcome == Outcome.POSTPONE.value:
        # No mastery change, push due date by 1 day
        problem.next_due_date = problem.next_due_date + timedelta(days=1)


def get_mastery_label(stage: int) -> str:
    """Get human-readable label for mastery stage."""
    labels = {
        0: "New",
        1: "Learning",
        2: "Familiar",
        3: "Comfortable",
        4: "Proficient",
        5: "Mastered",
    }
    return labels.get(stage, "Unknown")

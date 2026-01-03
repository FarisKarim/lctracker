"""
Seed script to populate the database with real problem data.
Run with: python seed.py
"""

import json
from datetime import datetime, timedelta

from database import engine, Base, SessionLocal
from models import Problem, Attempt


def seed_database():
    # Create tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    # Clear existing data for fresh seed
    db.query(Attempt).delete()
    db.query(Problem).delete()
    db.commit()

    now = datetime.utcnow()

    # Real problems from user's LeetCode history
    # IMPORTANT: next_due_date = last_attempted_at + interval_days
    # Stage 0 = 1 day interval, so if done 3 days ago, due was 2 days ago (overdue)
    problems_data = [
        # Today (3 minutes ago) - due tomorrow
        {
            "title": "Shortest Distance to Target String in a Circular Array",
            "url": "https://leetcode.com/problems/shortest-distance-to-target-string-in-a-circular-array/",
            "difficulty": "EASY",
            "tags": ["array", "string"],
            "last_outcome": "PASS",
            "last_attempted_at": now - timedelta(minutes=3),
            "next_due_date": now - timedelta(minutes=3) + timedelta(days=1),  # due in ~1 day
            "interval_days": 1,
            "mastery_stage": 0,
            "consecutive_successes": 1,
        },
        # 1 hour ago - due in ~23 hours
        {
            "title": "Count Pairs Of Similar Strings",
            "url": "https://leetcode.com/problems/count-pairs-of-similar-strings/",
            "difficulty": "EASY",
            "tags": ["array", "hash-map", "string"],
            "last_outcome": "PASS",
            "last_attempted_at": now - timedelta(hours=1),
            "next_due_date": now - timedelta(hours=1) + timedelta(days=1),  # due in ~23 hours
            "interval_days": 1,
            "mastery_stage": 0,
            "consecutive_successes": 1,
        },
        {
            "title": "Delete Greatest Value in Each Row",
            "url": "https://leetcode.com/problems/delete-greatest-value-in-each-row/",
            "difficulty": "EASY",
            "tags": ["array", "sorting", "matrix"],
            "last_outcome": "PASS",
            "last_attempted_at": now - timedelta(hours=1),
            "next_due_date": now - timedelta(hours=1) + timedelta(days=1),
            "interval_days": 1,
            "mastery_stage": 0,
            "consecutive_successes": 1,
        },
        {
            "title": "Minimum Number of Pushes to Type Word I",
            "url": "https://leetcode.com/problems/minimum-number-of-pushes-to-type-word-i/",
            "difficulty": "EASY",
            "tags": ["string", "greedy"],
            "last_outcome": "PASS",
            "last_attempted_at": now - timedelta(hours=1),
            "next_due_date": now - timedelta(hours=1) + timedelta(days=1),
            "interval_days": 1,
            "mastery_stage": 0,
            "consecutive_successes": 1,
        },
        # 16-17 hours ago - due in ~7-8 hours
        {
            "title": "Valid Parentheses",
            "url": "https://leetcode.com/problems/valid-parentheses/",
            "difficulty": "EASY",
            "tags": ["string", "stack"],
            "notes_trick": "Use a stack, push opening brackets, pop and match closing",
            "last_outcome": "PASS",
            "last_attempted_at": now - timedelta(hours=16),
            "next_due_date": now - timedelta(hours=16) + timedelta(days=1),  # due in ~8 hours
            "interval_days": 1,
            "mastery_stage": 0,
            "consecutive_successes": 1,
        },
        {
            "title": "Convert Integer to the Sum of Two No-Zero Integers",
            "url": "https://leetcode.com/problems/convert-integer-to-the-sum-of-two-no-zero-integers/",
            "difficulty": "EASY",
            "tags": ["math"],
            "last_outcome": "PASS",
            "last_attempted_at": now - timedelta(hours=17),
            "next_due_date": now - timedelta(hours=17) + timedelta(days=1),
            "interval_days": 1,
            "mastery_stage": 0,
            "consecutive_successes": 1,
        },
        {
            "title": "Largest Triangle Area",
            "url": "https://leetcode.com/problems/largest-triangle-area/",
            "difficulty": "EASY",
            "tags": ["array", "math", "geometry"],
            "notes_mistakes": "Got wrong answer - need to review triangle area formula",
            "last_outcome": "FAIL",
            "last_attempted_at": now - timedelta(hours=17),
            "next_due_date": now - timedelta(hours=17) + timedelta(days=1),
            "interval_days": 1,
            "mastery_stage": 0,
            "consecutive_successes": 0,
        },
        {
            "title": "Largest Perimeter Triangle",
            "url": "https://leetcode.com/problems/largest-perimeter-triangle/",
            "difficulty": "EASY",
            "tags": ["array", "math", "sorting", "greedy"],
            "last_outcome": "PASS",
            "last_attempted_at": now - timedelta(hours=17),
            "next_due_date": now - timedelta(hours=17) + timedelta(days=1),
            "interval_days": 1,
            "mastery_stage": 0,
            "consecutive_successes": 1,
        },
        {
            "title": "Number of Unequal Triplets in Array",
            "url": "https://leetcode.com/problems/number-of-unequal-triplets-in-array/",
            "difficulty": "EASY",
            "tags": ["array", "hash-map"],
            "last_outcome": "PASS",
            "last_attempted_at": now - timedelta(hours=17),
            "next_due_date": now - timedelta(hours=17) + timedelta(days=1),
            "interval_days": 1,
            "mastery_stage": 0,
            "consecutive_successes": 1,
        },
        {
            "title": "Two Sum",
            "url": "https://leetcode.com/problems/two-sum/",
            "difficulty": "EASY",
            "tags": ["array", "hash-map"],
            "notes_trick": "Use hash map to store complement values for O(n) solution",
            "last_outcome": "PASS",
            "last_attempted_at": now - timedelta(hours=17),
            "next_due_date": now - timedelta(hours=17) + timedelta(days=1),
            "interval_days": 1,
            "mastery_stage": 0,
            "consecutive_successes": 1,
        },
        # Yesterday (1 day ago) - due today (exactly now)
        {
            "title": "Set Mismatch",
            "url": "https://leetcode.com/problems/set-mismatch/",
            "difficulty": "EASY",
            "tags": ["array", "hash-map", "sorting"],
            "last_outcome": "PASS",
            "last_attempted_at": now - timedelta(days=1),
            "next_due_date": now - timedelta(days=1) + timedelta(days=1),  # due now
            "interval_days": 1,
            "mastery_stage": 0,
            "consecutive_successes": 1,
        },
        {
            "title": "Find Common Characters",
            "url": "https://leetcode.com/problems/find-common-characters/",
            "difficulty": "EASY",
            "tags": ["array", "hash-map", "string"],
            "last_outcome": "PASS",
            "last_attempted_at": now - timedelta(days=1),
            "next_due_date": now - timedelta(days=1) + timedelta(days=1),
            "interval_days": 1,
            "mastery_stage": 0,
            "consecutive_successes": 1,
        },
        {
            "title": "Remove All Adjacent Duplicates in String II",
            "url": "https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string-ii/",
            "difficulty": "MEDIUM",
            "tags": ["string", "stack"],
            "last_outcome": "PASS",
            "last_attempted_at": now - timedelta(days=1),
            "next_due_date": now - timedelta(days=1) + timedelta(days=1),
            "interval_days": 1,
            "mastery_stage": 0,
            "consecutive_successes": 1,
        },
        {
            "title": "Intersection of Multiple Arrays",
            "url": "https://leetcode.com/problems/intersection-of-multiple-arrays/",
            "difficulty": "EASY",
            "tags": ["array", "hash-map", "sorting"],
            "last_outcome": "PASS",
            "last_attempted_at": now - timedelta(days=1),
            "next_due_date": now - timedelta(days=1) + timedelta(days=1),
            "interval_days": 1,
            "mastery_stage": 0,
            "consecutive_successes": 1,
        },
        {
            "title": "Intersection of Two Arrays II",
            "url": "https://leetcode.com/problems/intersection-of-two-arrays-ii/",
            "difficulty": "EASY",
            "tags": ["array", "hash-map", "sorting", "two-pointers"],
            "last_outcome": "PASS",
            "last_attempted_at": now - timedelta(days=1),
            "next_due_date": now - timedelta(days=1) + timedelta(days=1),
            "interval_days": 1,
            "mastery_stage": 0,
            "consecutive_successes": 1,
        },
        {
            "title": "Intersection of Two Arrays",
            "url": "https://leetcode.com/problems/intersection-of-two-arrays/",
            "difficulty": "EASY",
            "tags": ["array", "hash-map", "sorting"],
            "last_outcome": "PASS",
            "last_attempted_at": now - timedelta(days=1),
            "next_due_date": now - timedelta(days=1) + timedelta(days=1),
            "interval_days": 1,
            "mastery_stage": 0,
            "consecutive_successes": 1,
        },
        {
            "title": "Find the Difference of Two Arrays",
            "url": "https://leetcode.com/problems/find-the-difference-of-two-arrays/",
            "difficulty": "EASY",
            "tags": ["array", "hash-map"],
            "last_outcome": "PASS",
            "last_attempted_at": now - timedelta(days=1),
            "next_due_date": now - timedelta(days=1) + timedelta(days=1),
            "interval_days": 1,
            "mastery_stage": 0,
            "consecutive_successes": 1,
        },
        # Thursday (2 days ago) - due 1 day ago (overdue by 1 day)
        {
            "title": "Count Elements With Maximum Frequency",
            "url": "https://leetcode.com/problems/count-elements-with-maximum-frequency/",
            "difficulty": "EASY",
            "tags": ["array", "hash-map"],
            "last_outcome": "PASS",
            "last_attempted_at": now - timedelta(days=2),
            "next_due_date": now - timedelta(days=2) + timedelta(days=1),  # due 1 day ago
            "interval_days": 1,
            "mastery_stage": 0,
            "consecutive_successes": 1,
        },
        {
            "title": "Check If String Is a Prefix of Array",
            "url": "https://leetcode.com/problems/check-if-string-is-a-prefix-of-array/",
            "difficulty": "EASY",
            "tags": ["array", "string"],
            "last_outcome": "PASS",
            "last_attempted_at": now - timedelta(days=2),
            "next_due_date": now - timedelta(days=2) + timedelta(days=1),
            "interval_days": 1,
            "mastery_stage": 0,
            "consecutive_successes": 1,
        },
        {
            "title": "Count Prefixes of a Given String",
            "url": "https://leetcode.com/problems/count-prefixes-of-a-given-string/",
            "difficulty": "EASY",
            "tags": ["array", "string"],
            "last_outcome": "PASS",
            "last_attempted_at": now - timedelta(days=2),
            "next_due_date": now - timedelta(days=2) + timedelta(days=1),
            "interval_days": 1,
            "mastery_stage": 0,
            "consecutive_successes": 1,
        },
        {
            "title": "Check If a Word Occurs As a Prefix of Any Word in a Sentence",
            "url": "https://leetcode.com/problems/check-if-a-word-occurs-as-a-prefix-of-any-word-in-a-sentence/",
            "difficulty": "EASY",
            "tags": ["string"],
            "last_outcome": "PASS",
            "last_attempted_at": now - timedelta(days=2),
            "next_due_date": now - timedelta(days=2) + timedelta(days=1),
            "interval_days": 1,
            "mastery_stage": 0,
            "consecutive_successes": 1,
        },
        {
            "title": "Counting Words With a Given Prefix",
            "url": "https://leetcode.com/problems/counting-words-with-a-given-prefix/",
            "difficulty": "EASY",
            "tags": ["array", "string"],
            "last_outcome": "PASS",
            "last_attempted_at": now - timedelta(days=2),
            "next_due_date": now - timedelta(days=2) + timedelta(days=1),
            "interval_days": 1,
            "mastery_stage": 0,
            "consecutive_successes": 1,
        },
        {
            "title": "Pass the Pillow",
            "url": "https://leetcode.com/problems/pass-the-pillow/",
            "difficulty": "EASY",
            "tags": ["math", "simulation"],
            "last_outcome": "PASS",
            "last_attempted_at": now - timedelta(days=2),
            "next_due_date": now - timedelta(days=2) + timedelta(days=1),
            "interval_days": 1,
            "mastery_stage": 0,
            "consecutive_successes": 1,
        },
        {
            "title": "Middle of the Linked List",
            "url": "https://leetcode.com/problems/middle-of-the-linked-list/",
            "difficulty": "EASY",
            "tags": ["linked-list", "two-pointers"],
            "notes_trick": "Use slow/fast pointer technique",
            "last_outcome": "PASS",
            "last_attempted_at": now - timedelta(days=2),
            "next_due_date": now - timedelta(days=2) + timedelta(days=1),
            "interval_days": 1,
            "mastery_stage": 0,
            "consecutive_successes": 1,
        },
        {
            "title": "Find the Maximum Divisibility Score",
            "url": "https://leetcode.com/problems/find-the-maximum-divisibility-score/",
            "difficulty": "EASY",
            "tags": ["array"],
            "last_outcome": "PASS",
            "last_attempted_at": now - timedelta(days=2),
            "next_due_date": now - timedelta(days=2) + timedelta(days=1),
            "interval_days": 1,
            "mastery_stage": 0,
            "consecutive_successes": 1,
        },
        {
            "title": "Minimize String Length",
            "url": "https://leetcode.com/problems/minimize-string-length/",
            "difficulty": "EASY",
            "tags": ["string", "hash-map"],
            "last_outcome": "PASS",
            "last_attempted_at": now - timedelta(days=2),
            "next_due_date": now - timedelta(days=2) + timedelta(days=1),
            "interval_days": 1,
            "mastery_stage": 0,
            "consecutive_successes": 1,
        },
        {
            "title": "Remove All Adjacent Duplicates In String",
            "url": "https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string/",
            "difficulty": "EASY",
            "tags": ["string", "stack"],
            "last_outcome": "PASS",
            "last_attempted_at": now - timedelta(days=2),
            "next_due_date": now - timedelta(days=2) + timedelta(days=1),
            "interval_days": 1,
            "mastery_stage": 0,
            "consecutive_successes": 1,
        },
        # Wednesday (3 days ago) - due 2 days ago (overdue by 2 days)
        {
            "title": "Count Largest Group",
            "url": "https://leetcode.com/problems/count-largest-group/",
            "difficulty": "EASY",
            "tags": ["hash-map", "math"],
            "last_outcome": "PASS",
            "last_attempted_at": now - timedelta(days=3),
            "next_due_date": now - timedelta(days=3) + timedelta(days=1),  # due 2 days ago
            "interval_days": 1,
            "mastery_stage": 0,
            "consecutive_successes": 1,
        },
        {
            "title": "First Letter to Appear Twice",
            "url": "https://leetcode.com/problems/first-letter-to-appear-twice/",
            "difficulty": "EASY",
            "tags": ["hash-map", "string"],
            "last_outcome": "PASS",
            "last_attempted_at": now - timedelta(days=3),
            "next_due_date": now - timedelta(days=3) + timedelta(days=1),
            "interval_days": 1,
            "mastery_stage": 0,
            "consecutive_successes": 1,
        },
        {
            "title": "First Unique Character in a String",
            "url": "https://leetcode.com/problems/first-unique-character-in-a-string/",
            "difficulty": "EASY",
            "tags": ["hash-map", "string", "queue"],
            "last_outcome": "PASS",
            "last_attempted_at": now - timedelta(days=3),
            "next_due_date": now - timedelta(days=3) + timedelta(days=1),
            "interval_days": 1,
            "mastery_stage": 0,
            "consecutive_successes": 1,
        },
        {
            "title": "Sort Characters By Frequency",
            "url": "https://leetcode.com/problems/sort-characters-by-frequency/",
            "difficulty": "MEDIUM",
            "tags": ["hash-map", "string", "sorting", "heap"],
            "last_outcome": "PASS",
            "last_attempted_at": now - timedelta(days=3),
            "next_due_date": now - timedelta(days=3) + timedelta(days=1),
            "interval_days": 1,
            "mastery_stage": 0,
            "consecutive_successes": 1,
        },
        {
            "title": "Check if Number Has Equal Digit Count and Digit Value",
            "url": "https://leetcode.com/problems/check-if-number-has-equal-digit-count-and-digit-value/",
            "difficulty": "EASY",
            "tags": ["hash-map", "string"],
            "last_outcome": "PASS",
            "last_attempted_at": now - timedelta(days=3),
            "next_due_date": now - timedelta(days=3) + timedelta(days=1),
            "interval_days": 1,
            "mastery_stage": 0,
            "consecutive_successes": 1,
        },
        {
            "title": "Self Dividing Numbers",
            "url": "https://leetcode.com/problems/self-dividing-numbers/",
            "difficulty": "EASY",
            "tags": ["math"],
            "last_outcome": "PASS",
            "last_attempted_at": now - timedelta(days=3),
            "next_due_date": now - timedelta(days=3) + timedelta(days=1),  # due 2 days ago
            "interval_days": 1,
            "mastery_stage": 0,
            "consecutive_successes": 1,
        },
        # Tuesday (4 days ago) - due 3 days ago (overdue by 3 days)
        {
            "title": "Perfect Number",
            "url": "https://leetcode.com/problems/perfect-number/",
            "difficulty": "EASY",
            "tags": ["math"],
            "last_outcome": "PASS",
            "last_attempted_at": now - timedelta(days=4),
            "next_due_date": now - timedelta(days=4) + timedelta(days=1),  # due 3 days ago
            "interval_days": 1,
            "mastery_stage": 0,
            "consecutive_successes": 1,
        },
        {
            "title": "Relative Ranks",
            "url": "https://leetcode.com/problems/relative-ranks/",
            "difficulty": "EASY",
            "tags": ["array", "sorting", "heap"],
            "last_outcome": "PASS",
            "last_attempted_at": now - timedelta(days=4),
            "next_due_date": now - timedelta(days=4) + timedelta(days=1),
            "interval_days": 1,
            "mastery_stage": 0,
            "consecutive_successes": 1,
        },
        {
            "title": "Base 7",
            "url": "https://leetcode.com/problems/base-7/",
            "difficulty": "EASY",
            "tags": ["math"],
            "last_outcome": "PASS",
            "last_attempted_at": now - timedelta(days=4),
            "next_due_date": now - timedelta(days=4) + timedelta(days=1),
            "interval_days": 1,
            "mastery_stage": 0,
            "consecutive_successes": 1,
        },
        # 10 days ago - due 9 days ago (overdue by 9 days)
        {
            "title": "Valid Palindrome",
            "url": "https://leetcode.com/problems/valid-palindrome/",
            "difficulty": "EASY",
            "tags": ["string", "two-pointers"],
            "notes_trick": "Use two pointers from both ends, skip non-alphanumeric",
            "last_outcome": "PASS",
            "last_attempted_at": now - timedelta(days=10),
            "next_due_date": now - timedelta(days=10) + timedelta(days=1),  # due 9 days ago
            "interval_days": 1,
            "mastery_stage": 0,
            "consecutive_successes": 1,
        },
    ]

    # Create problems
    for data in problems_data:
        tags = data.pop("tags")
        problem = Problem(**data, tags=json.dumps(tags))
        db.add(problem)

    db.commit()
    db.close()

    print("Database seeded successfully!")
    print(f"Created {len(problems_data)} problems")


if __name__ == "__main__":
    seed_database()

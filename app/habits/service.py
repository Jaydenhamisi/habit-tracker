from datetime import datetime, timezone
from app import models


def complete_habit_logic(habit):
    now = datetime.now(timezone.utc)
    today = now.date()

    if habit.last_completed_at and habit.last_completed_at.date() == today:
        return habit

    if not habit.last_completed_at:
        habit.streak_count = 1
    else:
        diff = today - habit.last_completed_at.date()
        if diff.days == 1:
            habit.streak_count += 1
        else:
            habit.streak_count = 1

    habit.best_streak = max(habit.best_streak, habit.streak_count)
    habit.last_completed_at = now
    habit.last_checked_date = today  

    return habit

def fail_habit_logic(habit):
    
    habit.streak_count = 0
    habit.last_completed_at = None


def check_and_reset_streak(habit: models.Habit):
    now = datetime.now(timezone.utc).date()

    
    if habit.last_checked_date is None:
        habit.last_checked_date = now
        return habit

    if habit.last_checked_date == now:
        return habit

    last_done = habit.last_completed_at.date() if habit.last_completed_at else None

    if last_done != now and last_done != now.replace(day=now.day - 1):
        habit.streak_count = 0

    habit.last_checked_date = now
    return habit
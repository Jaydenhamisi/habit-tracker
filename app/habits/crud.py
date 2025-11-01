from sqlalchemy.orm import Session
from .. import models, schemas
from datetime import date
from .service import check_and_reset_streak

def create_habit(db, user_id: int, habit_data):
    new_habit = models.Habit(
        name=habit_data.name,
        user_id=user_id,
        streak_count=0,
        best_streak=0,
        last_completed_at=None,
    )
    db.add(new_habit)
    db.commit()
    db.refresh(new_habit)
    return new_habit

def get_habits_for_user(db: Session, user_id: int):
    today = date.today()
    habits = db.query(models.Habit).filter(models.Habit.user_id == user_id).all()
    
    for habit in habits:
        check_and_reset_streak(habit)
            
    
    db.commit()

    return habits



def get_habit_by_id(db: Session, habit_id: int, user_id: int):
    return db.query(models.Habit).filter(
        models.Habit.id == habit_id,
        models.Habit.user_id == user_id
    ).first()


def delete_habit(db, habit_id: int, user_id: int):
    habit = db.query(models.Habit).filter(models.Habit.id == habit_id, models.Habit.user_id == user_id).first()
    if habit:
        db.delete(habit)
        db.commit()
        return True
    return False
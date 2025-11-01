from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from .. import models, schemas
from ..auth.dependencies import get_current_user
from .crud import create_habit, get_habits_for_user, get_habit_by_id
from .service import complete_habit_logic
from .service import fail_habit_logic
from .crud import get_habit_by_id, get_habits_for_user, create_habit, delete_habit
router = APIRouter(prefix="/habits", tags=["habits"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=schemas.HabitResponse)
def create_habit_route(habit_data: schemas.HabitCreate,
                       db: Session = Depends(get_db),
                       current_user: models.User = Depends(get_current_user)):
    return create_habit(db, current_user.id, habit_data)


@router.get("/", response_model=list[schemas.HabitResponse])
def get_habits_route(db: Session = Depends(get_db),
                     current_user: models.User = Depends(get_current_user)):
    return get_habits_for_user(db, current_user.id)


@router.post("/{habit_id}/complete", response_model=schemas.HabitResponse)
def complete_habit_route(
    habit_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    habit = get_habit_by_id(db, habit_id, current_user.id)
    habit = complete_habit_logic(habit)

    db.commit()
    db.refresh(habit)   

    return habit 


@router.put("/{habit_id}", response_model=schemas.HabitResponse)
def update_habit(habit_id: int, habit_update: schemas.HabitCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    habit = get_habit_by_id(db, habit_id, current_user.id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    habit.name = habit_update.name
    db.commit()
    db.refresh(habit)
    return habit

@router.delete("/{habit_id}", status_code=204)
def delete_habit_route(habit_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    success = delete_habit(db, habit_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Habit not found")
    



from datetime import datetime
from typing import Annotated
from pydantic import BaseModel, Field


class UserCreate(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True

class HabitBase(BaseModel):
    name: Annotated[str, Field(min_length=1)]


class HabitCreate(HabitBase):
    pass


class HabitResponse(HabitBase):
    id: int
    created_at: datetime
    last_completed_at: datetime | None
    streak_count: int
    best_streak: int
    user_id: int

    class Config:
        from_attributes = True

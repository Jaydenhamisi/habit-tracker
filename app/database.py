from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "postgresql://habit_db_qddt_user:kytEUDgtEZ9EAgFhs3HfIvVtXKsA8xq9@dpg-d4322rqli9vc73cglvc0-a/habit_db_qddt"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

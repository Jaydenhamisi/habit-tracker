from fastapi import FastAPI
from .database import Base, engine
from .auth.routes import router as auth_router
from .habits.routes import router as habits_router
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(habits_router)


@app.get("/")
def root():
    return {"message": "Habit Tracker API running"}
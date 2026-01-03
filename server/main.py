from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routers import problems, today, stats, history

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LeetReview API",
    description="Anki-style spaced repetition tracker for LeetCode problems",
    version="1.0.0",
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(problems.router)
app.include_router(today.router)
app.include_router(stats.router)
app.include_router(history.router)


@app.get("/")
def root():
    return {"message": "LeetReview API", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "healthy"}

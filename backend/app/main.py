from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import auth, resumes, match, gap, content, interview, applications, telegram, negotiate, analytics

# Creates tables on boot if they don't exist yet — fine for early-stage projects,
# switch to Alembic migrations once the schema stabilizes
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CareerAI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(resumes.router)
app.include_router(match.router)
app.include_router(gap.router)
app.include_router(content.router)
app.include_router(interview.router)
app.include_router(applications.router)
app.include_router(telegram.router)
app.include_router(negotiate.router)
app.include_router(analytics.router)


@app.get("/health")
def health():
    """Hit by the GitHub Actions cron workflow every ~10 min to prevent
    Render free-tier cold starts (15 min inactivity spin-down)."""
    return {"status": "ok"}

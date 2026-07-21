from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import Resume, User
from app.schemas import MatchRequest, MatchResponse
from app.services.embeddings import embed_text

router = APIRouter(prefix="/api/match", tags=["match"])


@router.post("", response_model=MatchResponse)
def analyze_job_match(
    payload: MatchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(Resume.id == payload.resumeId, Resume.owner_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    jd_lower = payload.jdText.lower()
    skills = resume.skills or []

    in_resume = [s for s in skills if s.lower() in jd_lower]
    missing = [s for s in skills if s.lower() not in jd_lower]

    # Keyword overlap ratio — always available, no external API needed
    keyword_ratio = len(in_resume) / len(skills) if skills else 0.0
    score = 40 + keyword_ratio * 40  # 40-80 range from keywords alone

    # Semantic similarity on top, if both embeddings are available —
    # pgvector's cosine_distance returns 0 (identical) to 2 (opposite)
    if resume.embedding is not None:
        try:
            jd_embedding = embed_text(payload.jdText)
            distance = db.query(Resume.embedding.cosine_distance(jd_embedding)).filter(
                Resume.id == resume.id
            ).scalar()
            similarity = 1 - distance  # 1 = identical, 0 = unrelated
            score += similarity * 20  # up to +20 more from semantic match
        except Exception:
            pass  # embedding service unavailable — keyword score alone still returned

    return MatchResponse(
        score=round(min(98, max(35, score)), 1),
        inResume=in_resume,
        missingFromJD=missing,
    )

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import Resume, User
from app.schemas import GapAnalysisRequest, TargetRoleGap
from app.services.gap_analysis import compute_gap_analysis

router = APIRouter(prefix="/api/gap-analysis", tags=["gap-analysis"])


@router.post("", response_model=TargetRoleGap)
def get_gap_analysis(
    payload: GapAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(Resume.id == payload.resumeId, Resume.owner_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    target_role = payload.targetRole or resume.role

    structured = {
        "summary": resume.summary,
        "experience": resume.experience or [],
        "skills": resume.skills or [],
    }

    try:
        result = compute_gap_analysis(structured, target_role)
    except Exception:
        raise HTTPException(status_code=502, detail="Gap analysis generation failed — the AI service may be rate-limited, try again shortly")

    return TargetRoleGap(**result)

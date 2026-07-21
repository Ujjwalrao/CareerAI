from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import Resume, User
from app.schemas import ContentRequest, ContentResponse
from app.services.content_gen import generate_content

router = APIRouter(prefix="/api/content", tags=["content"])


@router.post("", response_model=ContentResponse)
def generate(
    payload: ContentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume_context = ""
    if payload.resumeId:
        resume = db.query(Resume).filter(Resume.id == payload.resumeId, Resume.owner_id == current_user.id).first()
        if resume:
            bullets = [b for exp in (resume.experience or []) for b in exp.get("bullets", [])]
            resume_context = (
                f"Summary: {resume.summary}\n"
                f"Skills: {', '.join(resume.skills or [])}\n"
                f"Key achievements: {'; '.join(bullets[:6])}"
            )

    try:
        body = generate_content(payload.type, payload.role, payload.tone, resume_context, payload.jdText or "")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=502, detail="Content generation failed — the AI service may be rate-limited, try again shortly")

    return ContentResponse(body=body)

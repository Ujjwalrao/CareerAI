from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import Resume, User
from app.schemas import ResumeVersion
from app.services.resume_parser import parse_resume_to_structured, score_resume
from app.services.embeddings import embed_text

router = APIRouter(prefix="/api/resumes", tags=["resumes"])

MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5MB — plenty for a resume, keeps free-tier RAM safe


def _to_response(resume: Resume) -> ResumeVersion:
    return ResumeVersion(
        id=resume.id,
        role=resume.role,
        score=resume.score,
        updatedAt=resume.updated_at.isoformat(),
        summary=resume.summary,
        experience=resume.experience or [],
        education=resume.education or [],
        skills=resume.skills or [],
    )


@router.post("/parse", response_model=ResumeVersion)
async def parse_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    file_bytes = await file.read()
    if len(file_bytes) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File too large — max 5MB")

    try:
        structured = parse_resume_to_structured(file_bytes, file.filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=502, detail="Resume parsing failed — the AI service may be rate-limited, try again shortly")

    resume = Resume(
        owner_id=current_user.id,
        role=structured["role"],
        summary=structured["summary"],
        experience=structured["experience"],
        education=structured["education"],
        skills=structured["skills"],
        score=score_resume(structured),
    )

    # Best-effort embedding — JD matching still works via keyword overlap
    # even if Gemini quota is exhausted, embedding just adds semantic scoring on top
    try:
        embed_source = f"{structured['role']} {structured['summary']} {' '.join(structured['skills'])}"
        resume.embedding = embed_text(embed_source)
    except Exception:
        resume.embedding = None

    db.add(resume)
    db.commit()
    db.refresh(resume)

    return _to_response(resume)


@router.get("", response_model=list[ResumeVersion])
def get_resume_versions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resumes = db.query(Resume).filter(Resume.owner_id == current_user.id).order_by(Resume.updated_at.desc()).all()
    return [_to_response(r) for r in resumes]


@router.put("/{resume_id}", response_model=ResumeVersion)
def save_resume(
    resume_id: str,
    payload: ResumeVersion,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.owner_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    resume.role = payload.role
    resume.summary = payload.summary
    resume.experience = [e.model_dump() for e in payload.experience]
    resume.education = [e.model_dump() for e in payload.education]
    resume.skills = payload.skills

    db.commit()
    db.refresh(resume)
    return _to_response(resume)

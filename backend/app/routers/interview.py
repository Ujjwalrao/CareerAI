from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import InterviewQuestion, Resume, User
from app.schemas import InterviewAnswerRequest, InterviewExchange, InterviewFeedback
from app.services.interview import generate_feedback, generate_questions

router = APIRouter(prefix="/api/interview", tags=["interview"])

_EMPTY_FEEDBACK = InterviewFeedback(score=0, strengths=[], gaps=[], betterWording="")


@router.get("/questions", response_model=list[InterviewExchange])
def get_interview_qa(
    role: str = Query(...),
    resumeId: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume_context = ""
    if resumeId:
        resume = db.query(Resume).filter(Resume.id == resumeId, Resume.owner_id == current_user.id).first()
        if resume:
            resume_context = f"Summary: {resume.summary}\nSkills: {', '.join(resume.skills or [])}"

    try:
        raw_questions = generate_questions(role, resume_context)
    except Exception:
        raise HTTPException(status_code=502, detail="Question generation failed — the AI service may be rate-limited, try again shortly")

    if not raw_questions:
        raise HTTPException(status_code=502, detail="No questions were generated, try again")

    exchanges = []
    for q in raw_questions:
        record = InterviewQuestion(
            owner_id=current_user.id,
            role=role,
            question=q["question"],
            sample_answer=q.get("sampleAnswer", ""),
        )
        db.add(record)
        db.flush()  # get the generated id without committing yet
        exchanges.append(
            InterviewExchange(
                id=record.id,
                role=role,
                question=record.question,
                sampleAnswer=record.sample_answer,
                feedback=_EMPTY_FEEDBACK,
            )
        )
    db.commit()

    return exchanges


@router.post("/answer", response_model=InterviewFeedback)
def send_interview_answer(
    payload: InterviewAnswerRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    question = db.query(InterviewQuestion).filter(
        InterviewQuestion.id == payload.questionId, InterviewQuestion.owner_id == current_user.id
    ).first()
    if not question:
        raise HTTPException(status_code=404, detail="Interview question not found")

    try:
        feedback = generate_feedback(question.question, question.sample_answer, payload.answer)
    except Exception:
        raise HTTPException(status_code=502, detail="Feedback generation failed — the AI service may be rate-limited, try again shortly")

    return InterviewFeedback(**feedback)

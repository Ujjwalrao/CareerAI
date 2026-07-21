from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import Application, Resume, User
from app.schemas import AnalyticsSummary

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
def get_analytics_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """The frontend's Analytics page currently derives everything client-side
    from resumes/applications already in the store — this endpoint exists for
    server-side use cases like the weekly email report cron, so the numbers
    don't need to be recomputed in JS inside an email template."""
    resumes = db.query(Resume).filter(Resume.owner_id == current_user.id).all()
    apps = db.query(Application).filter(Application.owner_id == current_user.id).all()

    total_apps = len(apps)
    interview_count = sum(1 for a in apps if a.status == "Interview")
    offer_count = sum(1 for a in apps if a.status == "Offer")
    rejected_count = sum(1 for a in apps if a.status == "Rejected")
    responded = interview_count + offer_count + rejected_count

    return AnalyticsSummary(
        totalResumes=len(resumes),
        totalApplications=total_apps,
        interviewCount=interview_count,
        offerCount=offer_count,
        rejectedCount=rejected_count,
        avgResumeScore=round(sum(r.score for r in resumes) / len(resumes), 1) if resumes else 0.0,
        responseRate=round(responded / total_apps * 100, 1) if total_apps else 0.0,
    )

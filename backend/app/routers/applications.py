from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import Application as ApplicationModel
from app.models import User
from app.schemas import Application, ApplicationCreate, ApplicationStatusUpdate

router = APIRouter(prefix="/api/applications", tags=["applications"])


def _to_response(app_row: ApplicationModel) -> Application:
    return Application(
        id=app_row.id,
        company=app_row.company,
        role=app_row.role,
        appliedDate=app_row.applied_date,
        status=app_row.status,
        resumeTag=app_row.resume_tag,
        salary=app_row.salary,
        notes=app_row.notes,
    )


@router.get("", response_model=list[Application])
def get_applications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rows = db.query(ApplicationModel).filter(ApplicationModel.owner_id == current_user.id).order_by(
        ApplicationModel.created_at.desc()
    ).all()
    return [_to_response(r) for r in rows]


@router.post("", response_model=Application)
def add_application(
    payload: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    row = ApplicationModel(
        owner_id=current_user.id,
        company=payload.company,
        role=payload.role,
        applied_date=payload.appliedDate,
        status=payload.status,
        resume_tag=payload.resumeTag,
        salary=payload.salary,
        notes=payload.notes,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _to_response(row)


@router.put("/{application_id}", response_model=Application)
def update_application(
    application_id: str,
    payload: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    row = db.query(ApplicationModel).filter(
        ApplicationModel.id == application_id, ApplicationModel.owner_id == current_user.id
    ).first()
    if not row:
        raise HTTPException(status_code=404, detail="Application not found")

    row.company = payload.company
    row.role = payload.role
    row.applied_date = payload.appliedDate
    row.status = payload.status
    row.resume_tag = payload.resumeTag
    row.salary = payload.salary
    row.notes = payload.notes
    db.commit()
    db.refresh(row)
    return _to_response(row)


@router.patch("/{application_id}/status", response_model=Application)
def update_application_status(
    application_id: str,
    payload: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Backs the Kanban drag-and-drop — separate from the full update so a
    drag event doesn't need to resend the whole application payload."""
    row = db.query(ApplicationModel).filter(
        ApplicationModel.id == application_id, ApplicationModel.owner_id == current_user.id
    ).first()
    if not row:
        raise HTTPException(status_code=404, detail="Application not found")

    row.status = payload.status
    db.commit()
    db.refresh(row)
    return _to_response(row)


@router.delete("/{application_id}")
def delete_application(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    row = db.query(ApplicationModel).filter(
        ApplicationModel.id == application_id, ApplicationModel.owner_id == current_user.id
    ).first()
    if not row:
        raise HTTPException(status_code=404, detail="Application not found")

    db.delete(row)
    db.commit()
    return {"deleted": True}

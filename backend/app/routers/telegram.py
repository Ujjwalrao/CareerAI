from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.deps import get_current_user
from app.models import Application, User
from app.schemas import TelegramLinkResponse
from app.services.telegram import generate_link_code, handle_start_command, send_message

router = APIRouter(prefix="/api/telegram", tags=["telegram"])

STALE_AFTER_DAYS = 7


@router.get("/link", response_model=TelegramLinkResponse)
def get_link_code(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    code = generate_link_code(db, current_user)
    bot_username = settings.telegram_bot_username or "YourCareerAIBot"
    return TelegramLinkResponse(
        linkCode=code,
        botDeepLink=f"https://t.me/{bot_username}?start={code}",
        linked=bool(current_user.telegram_chat_id),
    )


@router.post("/webhook")
async def telegram_webhook(request: Request, db: Session = Depends(get_db)):
    """Public endpoint — Telegram calls this on every message sent to the bot.
    Register it with: curl https://api.telegram.org/bot<TOKEN>/setWebhook?url=<your-render-url>/api/telegram/webhook"""
    update = await request.json()
    message = update.get("message", {})
    text = message.get("text", "")
    chat_id = message.get("chat", {}).get("id")

    if text.startswith("/start") and chat_id:
        parts = text.split(maxsplit=1)
        if len(parts) == 2:
            handle_start_command(db, parts[1].strip(), chat_id)
        else:
            send_message(chat_id, "Open your CareerAI dashboard and tap 'Connect Telegram' to get your linking code.")

    return {"ok": True}


@router.post("/reminders/run")
def run_reminder_sweep(
    db: Session = Depends(get_db),
    x_cron_secret: str = Header(default=""),
):
    """Triggered by a GitHub Actions daily scheduled workflow, not by users.
    Finds applications stuck on 'Applied' for 7+ days and nudges via Telegram."""
    if x_cron_secret != settings.cron_secret:
        raise HTTPException(status_code=401, detail="Invalid cron secret")

    cutoff = datetime.utcnow() - timedelta(days=STALE_AFTER_DAYS)
    stale_apps = (
        db.query(Application)
        .join(User, Application.owner_id == User.id)
        .filter(
            Application.status == "Applied",
            User.telegram_chat_id.isnot(None),
        )
        .all()
    )

    sent = 0
    for app_row in stale_apps:
        applied_dt = datetime.fromisoformat(app_row.applied_date)
        already_reminded_recently = app_row.last_reminded_at and app_row.last_reminded_at > cutoff
        if applied_dt > cutoff or already_reminded_recently:
            continue

        user = db.query(User).filter(User.id == app_row.owner_id).first()
        send_message(
            user.telegram_chat_id,
            f"🔔 Follow-up reminder: your application to {app_row.company} ({app_row.role}) "
            f"has been 'Applied' for {STALE_AFTER_DAYS}+ days. Might be worth a follow-up email.",
        )
        app_row.last_reminded_at = datetime.utcnow()
        sent += 1

    db.commit()
    return {"remindersSent": sent}

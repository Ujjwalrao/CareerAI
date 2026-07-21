import secrets

import requests
from sqlalchemy.orm import Session

from app.config import settings
from app.models import User

TELEGRAM_API = "https://api.telegram.org/bot{token}/{method}"


def send_message(chat_id: str, text: str) -> None:
    if not settings.telegram_bot_token:
        return  # bot not configured — silently no-op rather than crash the caller
    url = TELEGRAM_API.format(token=settings.telegram_bot_token, method="sendMessage")
    requests.post(url, json={"chat_id": chat_id, "text": text}, timeout=10)


def generate_link_code(db: Session, user: User) -> str:
    if user.telegram_link_code:
        return user.telegram_link_code
    code = secrets.token_urlsafe(6)
    user.telegram_link_code = code
    db.commit()
    return code


def handle_start_command(db: Session, link_code: str, chat_id: str) -> bool:
    """Called from the /telegram/webhook route when a user sends '/start <code>'."""
    user = db.query(User).filter(User.telegram_link_code == link_code).first()
    if not user:
        return False
    user.telegram_chat_id = str(chat_id)
    db.commit()
    send_message(chat_id, "✅ CareerAI connected! You'll get reminders here for applications sitting stale for 7+ days.")
    return True

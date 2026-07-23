from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 10080  # 7 days
    groq_api_key: str = ""
    gemini_api_key: str = ""
    frontend_origin: str = "http://localhost:3000"
    telegram_bot_token: str = ""
    telegram_bot_username: str = ""
    cron_secret: str = "change-this-secret"
    google_client_id: str = ""

    class Config:
        env_file = ".env"


settings = Settings()

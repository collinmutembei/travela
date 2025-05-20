from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    """
    app_name: str = "travela"
    app_env: str = "development"

    gemini_model: str = "gemini-2.0-flash"

    africastalking_username: Optional[str] = ""
    africastalking_api_key: Optional[str] = ""

    redis_url: str = "redis://localhost:6379"
    jwt_secret_key: str  # required!
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30  # Default expiration time for JWT tokens in minutes

    cors_allow_origins: list[str] = [
        "http://localhost:3000",
        "https://travela.solublecode.dev"
    ]  # Restrict in production!

    otp_expiry_seconds: int = 300  # 5 minutes
    otp_max_attempts: int = 5

    class Config:
        env_file = ".env"

settings = Settings()
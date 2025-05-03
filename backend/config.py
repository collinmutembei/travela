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
    jwt_secret_key: str = "your_default_secret_key"  # Replace with a secure key in production
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30  # Default expiration time for JWT tokens in minutes


settings = Settings()

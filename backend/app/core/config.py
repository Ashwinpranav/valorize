import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Valorize — AI-Powered Industrial Waste Exchange"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "valorize-industrial-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database: Default to SQLite for zero-config local run, configurable to PostgreSQL
    DATABASE_URL: str = "sqlite:///./valorize.db"

    # Uploads
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
    MAX_UPLOAD_SIZE_MB: int = 10
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/png", "image/webp", "image/jpg"]

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000", 
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # Matching Weights
    MATCH_WEIGHT_MATERIAL: float = 0.40
    MATCH_WEIGHT_QUANTITY: float = 0.25
    MATCH_WEIGHT_PROXIMITY: float = 0.20
    MATCH_WEIGHT_CONDITION: float = 0.15

    # Demo mode flag
    DEMO_MODE: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

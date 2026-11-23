from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
from pathlib import Path
import os
import shutil

# Always resolve .env relative to this file (backend/app/config.py → backend/.env)
_ENV_FILE = Path(__file__).parent.parent / ".env"

def _normalize_db_url(url: str) -> str:
    if url and url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url

def _get_default_database_url() -> str:
    # Explicit DATABASE_URL from environment takes precedence
    db_env = os.environ.get("DATABASE_URL")
    if db_env:
        return _normalize_db_url(db_env)

    # If running on Vercel serverless environment without Postgres
    if os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"):
        tmp_db = Path("/tmp/merchantpilot.db")
        orig_db = Path(__file__).parent.parent.parent / "merchantpilot.db"
        if not tmp_db.exists() and orig_db.exists():
            try:
                shutil.copyfile(orig_db, tmp_db)
            except Exception as e:
                print(f"Warning: Could not copy db to /tmp: {e}")
        return f"sqlite:///{tmp_db}"
    return "sqlite:///./merchantpilot.db"

class Settings(BaseSettings):
    APP_NAME: str = "MerchantPilot AI"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    
    # SQLite default, supports PostgreSQL (Neon, Supabase, RDS, etc.)
    DATABASE_URL: str = _get_default_database_url()
    
    # Razorpay Test Credentials (set real keys in backend/.env or Vercel env vars)
    RAZORPAY_KEY_ID: str = "rzp_test_SampleKeyId123456"
    RAZORPAY_KEY_SECRET: str = "SampleSecretKeyForDemo123"
    RAZORPAY_WEBHOOK_SECRET: str = "SampleWebhookSecret123"
    
    # Auth JWT Secret
    AUTH_SECRET_KEY: str = "merchantpilot-auth-secret-key-prod-secure-token"
    TOKEN_EXPIRE_HOURS: int = 24
    
    # AI Engine
    GEMINI_API_KEY: Optional[str] = None
    
    # Merchant Policies Defaults
    DEFAULT_MAX_DISCOUNT_PERCENTAGE: float = 10.0
    DEFAULT_MAX_DISCOUNT_AMOUNT: float = 6000.0
    DEFAULT_MAX_TRANSACTION_AMOUNT: float = 100000.0
    
    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE) if _ENV_FILE.exists() else None,
        extra="ignore"
    )

    def model_post_init(self, __context):
        # Normalize postgres URLs
        if self.DATABASE_URL.startswith("postgres://"):
            self.DATABASE_URL = self.DATABASE_URL.replace("postgres://", "postgresql://", 1)
        # On Vercel / serverless runtime with SQLite, ensure database is writable in /tmp
        if os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"):
            if self.DATABASE_URL.startswith("sqlite") and "/tmp" not in self.DATABASE_URL:
                self.DATABASE_URL = "sqlite:////tmp/merchantpilot.db"

settings = Settings()

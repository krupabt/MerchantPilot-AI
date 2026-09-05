from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
from pathlib import Path

# Always resolve .env relative to this file (backend/app/config.py → backend/.env)
_ENV_FILE = Path(__file__).parent.parent / ".env"

class Settings(BaseSettings):
    APP_NAME: str = "MerchantPilot AI"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    
    # SQLite default, supports PostgreSQL
    DATABASE_URL: str = "sqlite:///./merchantpilot.db"
    
    # Razorpay Test Credentials (set real keys in backend/.env)
    RAZORPAY_KEY_ID: str = "rzp_test_SampleKeyId123456"
    RAZORPAY_KEY_SECRET: str = "SampleSecretKeyForDemo123"
    RAZORPAY_WEBHOOK_SECRET: str = "SampleWebhookSecret123"
    
    # AI Engine
    GEMINI_API_KEY: Optional[str] = None
    
    # Merchant Policies Defaults
    DEFAULT_MAX_DISCOUNT_PERCENTAGE: float = 10.0
    DEFAULT_MAX_DISCOUNT_AMOUNT: float = 6000.0
    DEFAULT_MAX_TRANSACTION_AMOUNT: float = 100000.0
    
    model_config = SettingsConfigDict(env_file=str(_ENV_FILE), extra="ignore")

settings = Settings()

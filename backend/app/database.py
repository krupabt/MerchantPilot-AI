from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.app.config import settings

# Explicit naming convention for deterministic Alembic migrations across SQLite and PostgreSQL
convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
}
metadata = MetaData(naming_convention=convention)

# Configure engine arguments based on database backend
engine_kwargs = {"echo": False}
if settings.DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    # PostgreSQL connection pooling optimizations for serverless
    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["pool_recycle"] = 300

engine = create_engine(settings.DATABASE_URL, **engine_kwargs)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base(metadata=metadata)

_db_initialized = False

def _ensure_schema_columns():
    """Ensure any newly added model columns exist on existing databases."""
    try:
        from sqlalchemy import inspect, text
        inspector = inspect(engine)
        tables = inspector.get_table_names()

        columns_to_add = {
            "products": [
                ("cost_price", "FLOAT DEFAULT 0.0"),
                ("sku", "VARCHAR(100)"),
                ("variants", "TEXT DEFAULT '[]'"),
                ("images", "TEXT DEFAULT '[]'"),
                ("is_published", "BOOLEAN DEFAULT 1"),
                ("is_archived", "BOOLEAN DEFAULT 0")
            ],
            "orders": [
                ("sales_channel", "VARCHAR(30) DEFAULT 'ONLINE'"),
                ("payment_method", "VARCHAR(30) DEFAULT 'RAZORPAY'"),
                ("payment_reference", "VARCHAR(100)"),
                ("shipping_address", "VARCHAR(500)"),
                ("notes", "VARCHAR(500)")
            ],
            "order_items": [
                ("unit_cost", "FLOAT DEFAULT 0.0")
            ],
            "merchants": [
                ("business_category", "VARCHAR(100) DEFAULT 'General Retail'"),
                ("phone", "VARCHAR(30)"),
                ("address", "VARCHAR(300)"),
                ("slug", "VARCHAR(100)"),
                ("description", "VARCHAR(1000)"),
                ("logo_url", "VARCHAR(500)"),
                ("onboarding_completed", "BOOLEAN DEFAULT 0"),
                ("is_published", "BOOLEAN DEFAULT 1"),
                ("is_demo", "BOOLEAN DEFAULT 0")
            ],
            "audit_logs": [
                ("merchant_id", "VARCHAR(50)")
            ]
        }

        with engine.connect() as conn:
            for table_name, cols in columns_to_add.items():
                if table_name in tables:
                    existing_cols = [c["name"] for c in inspector.get_columns(table_name)]
                    for col_name, col_type in cols:
                        if col_name not in existing_cols:
                            try:
                                conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {col_name} {col_type}"))
                                conn.commit()
                            except Exception:
                                pass
            # Ensure demo merchant has default slug
            if "merchants" in tables:
                try:
                    conn.execute(text("UPDATE merchants SET slug = 'smart-accessories', onboarding_completed = 1, is_published = 1 WHERE (id = 'm_1001' OR email = 'merchant@merchantpilot.ai') AND (slug IS NULL OR slug = '')"))
                    conn.commit()
                except Exception:
                    pass
    except Exception as e:
        print(f"_ensure_schema_columns note: {e}")

def init_db():
    global _db_initialized
    if not _db_initialized:
        Base.metadata.create_all(bind=engine)
        _ensure_schema_columns()
        try:
            from backend.app.models.product import Product
            from backend.app.seed.seed_data import seed_database
            with SessionLocal() as db:
                if db.query(Product).count() == 0:
                    seed_database(db)
        except Exception as e:
            print(f"init_db note: {e}")
        _db_initialized = True

def get_db():
    init_db()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

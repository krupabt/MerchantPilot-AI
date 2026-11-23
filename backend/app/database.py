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

def init_db():
    global _db_initialized
    if not _db_initialized:
        Base.metadata.create_all(bind=engine)
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

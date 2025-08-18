from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from decouple import config

# Database URL from environment variables
DATABASE_URL = config("DATABASE_URL", default="postgresql://user:password@localhost:5432/messenger_db")

# Create database engine
engine = create_engine(DATABASE_URL)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
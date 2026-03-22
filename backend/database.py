import os
from sqlalchemy import create_engine, Column, Integer, String, Float, JSON
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Keep this env name consistent across both projects.
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/connectrust_db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class CommunityGrowth(Base):
    __tablename__ = "connectrust_community_growth"

    id = Column(Integer, primary_key=True, index=True)
    clerk_user_id = Column(String, index=True)
    community_name = Column(String)
    community_type = Column(String)
    input_data = Column(JSON)
    analysis_result = Column(JSON)
    # Keeping old columns for compatibility if needed, but not required by new main.py
    members = Column(Integer, nullable=True)
    active_members = Column(Integer, nullable=True)
    events_per_month = Column(Integer, nullable=True)
    community_age_months = Column(Integer, nullable=True)
    engagement_rate = Column(Float, nullable=True)
    location_type = Column(String, nullable=True)
    domain = Column(String, nullable=True)
    mode = Column(String, nullable=True)
    target_demographic = Column(String, nullable=True)
    social_platforms = Column(String, nullable=True)
    health_score = Column(Float, nullable=True)
    stage = Column(String, nullable=True)

# Create table
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

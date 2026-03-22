import os
from sqlalchemy import create_engine, Column, Integer, String, Float, JSON
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:cdw123%40@localhost:5432/hns_db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class CommunityGrowth(Base):
    __tablename__ = "connectrust_community_growth"

    id = Column(Integer, primary_key=True, index=True)
    clerk_user_id = Column(String, index=True)
    members = Column(Integer)
    active_members = Column(Integer)
    events_per_month = Column(Integer)
    community_age_months = Column(Integer)
    engagement_rate = Column(Float)
    location_type = Column(String)
    domain = Column(String)
    mode = Column(String)
    target_demographic = Column(String)
    social_platforms = Column(String)
    health_score = Column(Float)
    stage = Column(String)
    recommendation = Column(JSON)

# Create table
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

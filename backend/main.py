import os
from typing import Any, Dict, Optional, List

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import jwt
import json
from sqlalchemy.orm import Session
from database import get_db, CommunityGrowth

# --- Constants & Paths ---
APP_TITLE = "CONNECTRUST ML API"
BASE_DIR = os.path.dirname(__file__)
CLASSIFIER_PATH = os.path.join(BASE_DIR, "community_growth_model.joblib")
REGRESSOR_PATH = os.path.join(BASE_DIR, "community_health_model.joblib")
ENCODERS_PATH = os.path.join(BASE_DIR, "encoders.joblib")
INPUT_COLS_PATH = os.path.join(BASE_DIR, "input_cols.joblib")

# --- App Setup ---
app = FastAPI(title=APP_TITLE)
allowed_origins = [
    origin.strip() for origin in os.getenv(
        "BACKEND_CORS_ORIGINS",
        "http://localhost:5173,http://localhost:3000"
    ).split(",") if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"^http://localhost:\d+$",
    allow_credentials=True, # Need credentials for auth headers
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Clerk Auth Dependency ---
def get_current_user(authorization: str = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, options={"verify_signature": False})
        return payload.get('sub')
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid auth token")


# --- Pydantic Schema ---
# Matches the 16 features from the Colab notebook
class AnalyzeIn(BaseModel):
    members: int = Field(..., ge=1)
    active_members: int = Field(..., ge=0)
    events_per_month: int = Field(..., ge=0)
    community_age_months: int = Field(..., ge=0)
    engagement_rate: float = Field(0.0, ge=0.0, le=100.0) # Used for fallback calculation
    growth_target: float = Field(0.0, ge=0.0)
    location_type: str
    domain: str
    mode: str
    target_demographic: str
    motive_category: str
    has_formal_leadership: int = Field(0, ge=0, le=1) # 0 or 1
    Social_Platforms: str
    Physical_Platforms: str
    Comm_Type: str = Field(..., alias="Comm Type") # Handle space in name
    Comm_Label: str = Field(..., alias="Comm Label") # Handle space in name

    class Config:
        populate_by_name = True

# --- Advice Logic (Ported from Colab) ---
def get_community_advice(data: Dict[str, Any], health_score: float, stage_label: str) -> Dict[str, Any]:
    # 1. Focus Mapping
    engagement_rate = data['active_members'] / data['members'] if data['members'] > 0 else 0
    
    focus_map = {
        "RETENTION": engagement_rate < 0.25,
        "CONSISTENCY": data['events_per_month'] < 2,
        "SCALING": engagement_rate > 0.40 and data['events_per_month'] >= 3
    }
    
    primary_focus = next((k for k, v in focus_map.items() if v), "SCALING")
    
    # 2. Contextual Nuance
    health_modifier = ""
    if health_score < 30:
        health_modifier = "URGENT: "
    elif health_score > 80:
        health_modifier = "ELITE PERFORMANCE: "

    # 3. Advice Library
    advice_vault = {
        "Tech": {
            "RETENTION": "Host a 'Bug Bash' or 'Code Review' night to re-engage developers.",
            "CONSISTENCY": "Set up an automated 'Weekly Tech Digest' to maintain visibility.",
            "SCALING": "Launch a Contributor Program or GitHub 'Good First Issues' drive."
        },
        "Sustainable": {
            "RETENTION": "Launch a 'Member Spotlight' series to strengthen community ties.",
            "CONSISTENCY": "Implement a 'Recycling Streak' challenge to keep people active.",
            "SCALING": "Partner with local NGOs for co-branded physical events."
        },
        "Empowerment": {
            "RETENTION": "Introduce 'Coffee Break' 1:1 pairings to reduce isolation.",
            "CONSISTENCY": "Start a 'Daily Gratitude' or 'Win of the Week' thread.",
            "SCALING": "Train your most active 5% as 'Peer Mentors' to lead subgroups."
        }
    }

    # 4. Fetch Advice with Fallbacks
    comm_type = data.get('Comm Type', 'Tech')
    type_advice = advice_vault.get(comm_type, advice_vault["Tech"])
    final_advice = type_advice.get(primary_focus, "Focus on referral programs to grow the base.")

    return {
        "primaryFocus": primary_focus.replace("_", " ").title(),
        "riskLevel": "Critical" if health_score < 30 or stage_label == "Stagnant" else "Stable",
        "recommendation": f"{health_modifier}{final_advice}",
        "reason": f"Focusing on {primary_focus.lower()} based on your current engagement and event frequency."
    }

# --- Internal Result Helper (Legacy Support / Heuristic) ---
def _heuristic_result(data: Dict[str, Any]) -> Dict[str, Any]:
    ratio = (data["active_members"] / data["members"] * 100) if data["members"] > 0 else 0
    health = min(100, max(0, round(data.get("engagement_rate", 50) * 0.6 + ratio * 0.4)))
    
    if data["members"] < 50:
        stage = "Early Stage"
    elif data["events_per_month"] >= 3 and ratio > 60:
        stage = "Growing"
    elif ratio < 30:
        stage = "Stagnant"
    else:
        stage = "Stable"

    advice = get_community_advice(data, health, stage)
    
    # Map to UI colors
    colors = {"Early Stage": "#f59e0b", "Growing": "#10d97b", "Stagnant": "#ff4d6d", "Stable": "#00d4ff"}
    clusters = {"Early Stage": "Emerging", "Growing": "High Engagement", "Stagnant": "Low Activity", "Stable": "Moderate Activity"}

    return {
        "stage": stage,
        "stageColor": colors.get(stage, "#00d4ff"),
        "cluster": clusters.get(stage, "General"),
        "confidence": 75,
        "health": health,
        "primaryFocus": advice["primaryFocus"],
        "recommendation": advice["recommendation"],
        "reason": advice["reason"],
    }

# --- Model Hub ---
class ModelHub:
    def __init__(self):
        self.classifier = None
        self.regressor = None
        self.encoders = None
        self.input_cols = None
        self.load()

    def load(self):
        try:
            if os.path.exists(CLASSIFIER_PATH) and os.path.exists(REGRESSOR_PATH) and \
               os.path.exists(ENCODERS_PATH) and os.path.exists(INPUT_COLS_PATH):
                self.classifier = joblib.load(CLASSIFIER_PATH)
                self.regressor = joblib.load(REGRESSOR_PATH)
                self.encoders = joblib.load(ENCODERS_PATH)
                self.input_cols = joblib.load(INPUT_COLS_PATH)
                print("--- Models and Encoders Loaded Successfully ---")
        except Exception as e:
            print(f"Error loading model files: {e}")

    def predict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        if not all([self.classifier, self.regressor, self.encoders, self.input_cols]):
            return _heuristic_result(data)

        # 1. Data Prep for Model
        df = pd.DataFrame([data])
        
        # 2. Encode Categorical Columns
        categorical_cols = [col for col, enc in self.encoders.items() if col in df.columns]
        for col in categorical_cols:
            le = self.encoders[col]
            val = str(df[col].iloc[0])
            # Handle unseen labels by defaulting to the first class or a known safe label
            if val not in le.classes_:
                df[col] = le.transform([le.classes_[0]])
            else:
                df[col] = le.transform([val])

        # 3. Reorder Columns to Match Training
        df = df[self.input_cols]

        # 4. Predict
        try:
            health_score = float(self.regressor.predict(df)[0])
            stage_idx = int(self.classifier.predict(df)[0])
            
            # Use Encoder for Stage if available
            if "growth_stage" in self.encoders:
                stage_label = str(self.encoders["growth_stage"].inverse_transform([stage_idx])[0])
            else:
                stage_label = "Stable" # Fallback

            # Post-process results
            health_score = max(0, min(100, round(health_score)))
            
            # Confidence Calculation (Optional: if the classifier supports it)
            confidence = 85
            if hasattr(self.classifier, "predict_proba"):
                proba = self.classifier.predict_proba(df)[0]
                confidence = int(round(float(np.max(proba)) * 100))

            advice = get_community_advice(data, health_score, stage_label)

            colors = {"Early Stage": "#f59e0b", "Growing": "#10d97b", "Stagnant": "#ff4d6d", "Stable": "#00d4ff"}
            clusters = {"Early Stage": "Emerging", "Growing": "High Engagement", "Stagnant": "Low Activity", "Stable": "Moderate Activity"}

            return {
                "stage": stage_label,
                "stageColor": colors.get(stage_label, "#00d4ff"),
                "cluster": clusters.get(stage_label, "Moderate Activity"),
                "confidence": confidence,
                "health": health_score,
                "primaryFocus": advice["primaryFocus"],
                "recommendation": advice["recommendation"],
                "reason": advice["reason"],
            }
        except Exception as e:
            print(f"Prediction error: {e}")
            return _heuristic_result(data)

HUB = ModelHub()

# --- Routes ---
@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "model_loaded": HUB.classifier is not None,
        "files": {
            "classifier": os.path.exists(CLASSIFIER_PATH),
            "regressor": os.path.exists(REGRESSOR_PATH),
            "encoders": os.path.exists(ENCODERS_PATH),
            "input_cols": os.path.exists(INPUT_COLS_PATH),
        }
    }

@app.post("/api/analyze")
def analyze(
    payload: AnalyzeIn, 
    clerk_user_id: str = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    # Convert Pydantic model to dict, using aliases for keys with spaces
    data = payload.model_dump(by_alias=True)
    result = HUB.predict(data)

    # Store in database
    db_record = CommunityGrowth(
        clerk_user_id=clerk_user_id,
        members=payload.members,
        active_members=payload.active_members,
        events_per_month=payload.events_per_month,
        community_age_months=payload.community_age_months,
        engagement_rate=payload.engagement_rate,
        location_type=payload.location_type,
        domain=payload.domain,
        mode=payload.mode,
        target_demographic=payload.target_demographic,
        social_platforms=payload.Social_Platforms,
        health_score=result.get("health", 0.0),
        stage=result.get("stage", "Stable"),
        recommendation=result
    )
    db.add(db_record)
    db.commit()

    return {"result": result, "source": "model" if HUB.classifier else "heuristic"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

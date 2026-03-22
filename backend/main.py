import os
from typing import Any, Dict, Optional, List
from dotenv import load_dotenv

import joblib
import numpy as np
import pandas as pd
import jwt
import json
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
import google.generativeai as genai

# Local DB imports
from database import get_db, CommunityGrowth

load_dotenv()

# --- Constants & Paths ---
APP_TITLE = "CONNECTRUST ML API"
BASE_DIR = os.path.dirname(__file__)
CLASSIFIER_PATH = os.path.join(BASE_DIR, "community_growth_model.joblib")
REGRESSOR_PATH = os.path.join(BASE_DIR, "community_health_model.joblib")
ENCODERS_PATH = os.path.join(BASE_DIR, "encoders.joblib")
INPUT_COLS_PATH = os.path.join(BASE_DIR, "input_cols.joblib")

# --- AI Configuration ---
GENAI_KEY = os.getenv("GEMINI_API_KEY")
if GENAI_KEY:
    genai.configure(api_key=GENAI_KEY)
else:
    print("WARNING: GEMINI_API_KEY not found in .env file.")

# --- App Setup ---
app = FastAPI(title=APP_TITLE)

allowed_origins = [
    origin.strip() for origin in os.getenv(
        "BACKEND_CORS_ORIGINS",
        "http://localhost:5173,http://localhost:3000,http://localhost:5174"
    ).split(",") if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"^http://localhost:\d+$",
    allow_credentials=True, 
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
        uid = payload.get('sub')
        if not uid:
            raise HTTPException(status_code=401, detail="Missing UID in token")
        return uid
    except Exception as e:
        print(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Invalid auth token")

# --- Pydantic Schema ---
class AnalyzeIn(BaseModel):
    members: int = Field(..., ge=1)
    active_members: int = Field(..., ge=0)
    events_per_month: int = Field(..., ge=0)
    community_age_months: int = Field(..., ge=0)
    engagement_rate: float = Field(0.0, ge=0.0, le=100.0)
    growth_target: float = Field(0.0, ge=0.0)
    location_type: str
    domain: str
    mode: str
    target_demographic: str
    motive_category: str
    has_formal_leadership: int = Field(0, ge=0, le=1)
    Social_Platforms: str
    Physical_Platforms: str
    Comm_Type: str = Field(..., alias="Comm Type")
    Comm_Label: str = Field(..., alias="Comm Label")

    class Config:
        populate_by_name = True

# --- Advice & Heuristic Helpers ---
def get_community_advice(data: Dict[str, Any], health_score: float, stage_label: str) -> Dict[str, Any]:
    engagement_rate = data['active_members'] / data['members'] if data['members'] > 0 else 0
    focus_map = {
        "RETENTION": engagement_rate < 0.25,
        "CONSISTENCY": data['events_per_month'] < 2,
        "SCALING": engagement_rate > 0.40 and data['events_per_month'] >= 3
    }
    primary_focus = next((k for k, v in focus_map.items() if v), "SCALING")
    
    advice_vault = {
        "Tech": {
            "RETENTION": "Host a 'Bug Bash' night to re-engage developers.",
            "CONSISTENCY": "Set up a 'Weekly Tech Digest' to maintain visibility.",
            "SCALING": "Launch a Contributor Program drive."
        },
        "Sustainable": {
            "RETENTION": "Launch a 'Member Spotlight' series.",
            "CONSISTENCY": "Implement a 'Recycling Streak' challenge.",
            "SCALING": "Partner with local NGOs for physical events."
        },
        "Empowerment": {
            "RETENTION": "Introduce 'Coffee Break' 1:1 pairings.",
            "CONSISTENCY": "Start a 'Win of the Week' thread.",
            "SCALING": "Train your most active 5% as 'Peer Mentors'."
        }
    }

    comm_type = data.get('Comm Type', 'Tech')
    type_advice = advice_vault.get(comm_type, advice_vault["Tech"])
    final_advice = type_advice.get(primary_focus, "Focus on referral programs.")

    return {
        "primaryFocus": primary_focus.title(),
        "recommendation": f"{final_advice}",
        "reason": f"Focusing on {primary_focus.lower()} based on current metrics."
    }

def _heuristic_result(data: Dict[str, Any]) -> Dict[str, Any]:
    ratio = (data["active_members"] / data["members"] * 100) if data["members"] > 0 else 0
    health = min(100, max(0, round(data.get("engagement_rate", 50) * 0.6 + ratio * 0.4)))
    stage = "Stable"
    if data["members"] < 50: stage = "Early Stage"
    elif data["events_per_month"] >= 3 and ratio > 60: stage = "Growing"
    elif ratio < 30: stage = "Stagnant"

    advice = get_community_advice(data, health, stage)
    return {
        "stage": stage,
        "cluster": "General Activity",
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
            if all(os.path.exists(p) for p in [CLASSIFIER_PATH, REGRESSOR_PATH, ENCODERS_PATH, INPUT_COLS_PATH]):
                self.classifier = joblib.load(CLASSIFIER_PATH)
                self.regressor = joblib.load(REGRESSOR_PATH)
                self.encoders = joblib.load(ENCODERS_PATH)
                self.input_cols = joblib.load(INPUT_COLS_PATH)
                print("Models loaded successfully.")
        except Exception as e:
            print(f"Model load error: {e}")

    def predict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        if not self.classifier:
            return _heuristic_result(data)
        
        try:
            df = pd.DataFrame([data])
            for col, enc in self.encoders.items():
                if col in df.columns:
                    val = str(df[col].iloc[0])
                    df[col] = enc.transform([val]) if val in enc.classes_ else enc.transform([enc.classes_[0]])
            
            df = df[self.input_cols]
            health_score = round(float(self.regressor.predict(df)[0]))
            stage_idx = int(self.classifier.predict(df)[0])
            stage_label = self.encoders["growth_stage"].inverse_transform([stage_idx])[0] if "growth_stage" in self.encoders else "Stable"
            
            advice = get_community_advice(data, health_score, stage_label)
            return {
                "stage": stage_label,
                "cluster": "Calculated Cluster",
                "confidence": 85,
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
    return {"status": "ok", "model_loaded": HUB.classifier is not None}

@app.post("/api/analyze")
def analyze(payload: AnalyzeIn, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    data = payload.model_dump(by_alias=True)
    result = HUB.predict(data)
    
    # Save to Database
    try:
        new_growth = CommunityGrowth(
            clerk_user_id=user_id,
            community_name=data.get("Comm Label", "Community"),
            community_type=data.get("Comm Type", "Other"),
            input_data=json.dumps(data),
            analysis_result=json.dumps(result)
        )
        db.add(new_growth)
        db.commit()
    except Exception as e:
        print(f"DB Error: {e}")
        db.rollback()

    return {"result": result, "source": "model" if HUB.classifier else "heuristic"}

@app.post("/api/chat")
async def chat_with_advisor(payload: Dict[str, Any], user_id: str = Depends(get_current_user)):
    user_message = payload.get("message")
    vars = payload.get("variables", {})
    if not user_message:
        raise HTTPException(status_code=400, detail="Message required")

    system_prompt = f"""
    You are the 'ConnectTrust AI Advisor'.
    Context: Community Type={vars.get('Comm Type')}, Members={vars.get('members')}.
    Guidelines: Concise, professional, data-driven. Use Markdown. Use Bold for emphasis.
    """

    if not GENAI_KEY:
        return {"response": "AI Advisor currently offline (Missing API Key)."}

    try:
        model = genai.GenerativeModel("gemini-1.5-flash", system_instruction=system_prompt)
        chat = model.start_chat()
        response = chat.send_message(user_message)
        return {"response": response.text}
    except Exception as e:
        print(f"Gemini Error: {e}")
        raise HTTPException(status_code=500, detail="AI Unavailable.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

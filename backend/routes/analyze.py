from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pandas as pd
import os

router = APIRouter()

class AnalysisRequest(BaseModel):
    sessionId: str
    analysisType: str
    params: dict = {}

@router.post("/api/analyze")
def perform_analysis(request: AnalysisRequest):
    file_path = f"uploads/{request.sessionId}/data.csv"  # Adjust if path is different

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="CSV file not found")

    df = pd.read_csv(file_path)

    if request.analysisType == "statistical_summary":
        summary = df.describe(include='all').fillna("").to_dict()
        return {"type": "table", "data": summary}

    raise HTTPException(status_code=400, detail="Invalid analysis type")

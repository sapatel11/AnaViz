from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request, Query
import uuid
from viz.utils import parse_file
from typing import List
import pandas as pd
import io
import os
import json


session_store = {}

app = FastAPI()

# CORS to allow frontend to call the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TEMP_DIR = "session_data"
os.makedirs(TEMP_DIR, exist_ok=True)

def save_session(session_id, data):
    with open(f"{TEMP_DIR}/{session_id}.json", "w") as f:
        json.dump(data, f)

def load_session(session_id):
    try:
        with open(f"{TEMP_DIR}/{session_id}.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return None

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    content = await file.read()
    preview = parse_file(file.filename, content)
    session_id = str(uuid.uuid4())

    # Store the preview in memory for trial retrieval
    session_data = {
        "filename": file.filename,
        "preview": preview
    }
    
    save_session(session_id, session_data)

    return {"filename": file.filename, "preview": preview, "session_id": session_id}

@app.post("/api/statistical-summary")
async def get_statistical_summary(file: UploadFile = File(...)):
    contents = await file.read()
    df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
    summary = df.describe(include="all").fillna("").to_dict()
    return {"summary": summary}

@app.post("/api/missing-data-overview")
async def get_missing_data(file: UploadFile = File(...)):
    contents = await file.read()
    df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
    missing_data = df.isnull().sum().to_dict()
    return {"missing_data": missing_data}

@app.post("/api/outlier-detection")
async def get_outlier_data(file: UploadFile = File(...)):
    contents = await file.read()
    df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
    
    outlier_counts = {}
    numeric_df = df.select_dtypes(include=["number"])

    for col in numeric_df.columns:
        Q1 = numeric_df[col].quantile(0.25)
        Q3 = numeric_df[col].quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        outliers = numeric_df[(numeric_df[col] < lower_bound) | (numeric_df[col] > upper_bound)]
        outlier_counts[col] = len(outliers)

    return {"outliers": outlier_counts}

@app.post("/api/correlation-matrix")
async def get_correlation_matrix(file: UploadFile = File(...)):
    contents = await file.read()
    df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
    corr_matrix = df.corr(numeric_only=True).fillna(0).round(3).to_dict()
    return {"correlation_matrix": corr_matrix}

@app.get("/api/statistical-summary")
async def get_statistical_summary(sessionId: str):
    content = load_session(sessionId)
    if content is None:
        return JSONResponse(status_code=404, content={"error": "Session not found"})

    preview = content["preview"]
    df = pd.DataFrame(preview[1:], columns=preview[0])
    summary = df.describe(include="all").fillna("").to_dict()
    return {"summary": summary}

@app.get("/api/correlation-matrix")
def correlation_matrix(sessionId: str):
    content = load_session(sessionId)
    if content is None:
        return JSONResponse(status_code=404, content={"error": "Session not found"})

    preview = content["preview"]
    df = pd.DataFrame(preview[1:], columns=preview[0])
    
    numeric_df = df.select_dtypes(include="number")
    corr = numeric_df.corr().round(2)
    return {"type": "table", "data": corr.fillna("").to_dict()}


@app.get("/api/missing-data-overview")
def missing_data(sessionId: str):
    content = load_session(sessionId)
    if content is None:
        return JSONResponse(status_code=404, content={"error": "Session not found"})

    preview = content["preview"]
    df = pd.DataFrame(preview[1:], columns=preview[0])

    missing = df.isnull().sum()
    percent = (missing / len(df) * 100).round(2)
    result = pd.DataFrame({
        "Missing Values": missing,
        "Percentage": percent
    }).fillna("")
    
    return {"type": "table", "data": result.to_dict(orient="index")}


@app.get("/api/outlier-detection")
def outlier_detection(sessionId: str):
    content = load_session(sessionId)
    if content is None:
        return JSONResponse(status_code=404, content={"error": "Session not found"})

    preview = content["preview"]
    df = pd.DataFrame(preview[1:], columns=preview[0])

    numeric_df = df.select_dtypes(include="number")
    outliers = {}
    for col in numeric_df.columns:
        q1 = numeric_df[col].quantile(0.25)
        q3 = numeric_df[col].quantile(0.75)
        iqr = q3 - q1
        lower = q1 - 1.5 * iqr
        upper = q3 + 1.5 * iqr
        count = ((numeric_df[col] < lower) | (numeric_df[col] > upper)).sum()
        outliers[col] = {"Outlier Count": int(count)}
    
    return {"type": "table", "data": outliers}

@app.get("/trial")
async def get_trial_preview(sessionId: str = Query(...)):
    session_data = load_session(sessionId)
    if not session_data:
        return JSONResponse(status_code=404, content={"detail": "Not Found"})

    return session_data

# Bar Chart endpoints
@app.post("/api/bar-chart")
async def create_bar_chart(file: UploadFile = File(...), xKey: str = Query(...), yKey: str = Query(...)):
    contents = await file.read()
    df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
    
    # Validate columns exist
    if xKey not in df.columns or yKey not in df.columns:
        return JSONResponse(status_code=400, content={"error": "Invalid column names"})
    
    # Convert data to format expected by frontend
    chart_data = []
    for _, row in df.iterrows():
        chart_data.append({
            xKey: row[xKey],
            yKey: row[yKey]
        })
    
    return {"data": chart_data, "xKey": xKey, "yKey": yKey}

@app.get("/api/bar-chart")
async def get_bar_chart(sessionId: str = Query(...), xKey: str = Query(...), yKey: str = Query(...)):
    content = load_session(sessionId)
    if content is None:
        return JSONResponse(status_code=404, content={"error": "Session not found"})

    preview = content["preview"]
    df = pd.DataFrame(preview[1:], columns=preview[0])
    
    # Validate columns exist
    if xKey not in df.columns or yKey not in df.columns:
        return JSONResponse(status_code=400, content={"error": "Invalid column names"})
    
    # Convert data to format expected by frontend
    chart_data = []
    for _, row in df.iterrows():
        chart_data.append({
            xKey: row[xKey],
            yKey: row[yKey]
        })
    
    return {"data": chart_data, "xKey": xKey, "yKey": yKey}

# Line Graph endpoints
@app.post("/api/line-graph")
async def create_line_graph(file: UploadFile = File(...), xKey: str = Query(...), yKey: str = Query(...)):
    contents = await file.read()
    df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
    
    # Validate columns exist
    if xKey not in df.columns or yKey not in df.columns:
        return JSONResponse(status_code=400, content={"error": "Invalid column names"})
    
    # Convert data to format expected by frontend
    chart_data = []
    for _, row in df.iterrows():
        chart_data.append({
            xKey: row[xKey],
            yKey: row[yKey]
        })
    
    return {"data": chart_data, "xKey": xKey, "yKey": yKey}

@app.get("/api/line-graph")
async def get_line_graph(sessionId: str = Query(...), xKey: str = Query(...), yKey: str = Query(...)):
    content = load_session(sessionId)
    if content is None:
        return JSONResponse(status_code=404, content={"error": "Session not found"})

    preview = content["preview"]
    df = pd.DataFrame(preview[1:], columns=preview[0])
    
    # Validate columns exist
    if xKey not in df.columns or yKey not in df.columns:
        return JSONResponse(status_code=400, content={"error": "Invalid column names"})
    
    # Convert data to format expected by frontend
    chart_data = []
    for _, row in df.iterrows():
        chart_data.append({
            xKey: row[xKey],
            yKey: row[yKey]
        })
    
    return {"data": chart_data, "xKey": xKey, "yKey": yKey}

# Scatter Plot endpoints
@app.post("/api/scatter-plot")
async def create_scatter_plot(file: UploadFile = File(...), xKey: str = Query(...), yKey: str = Query(...)):
    contents = await file.read()
    df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
    
    # Validate columns exist
    if xKey not in df.columns or yKey not in df.columns:
        return JSONResponse(status_code=400, content={"error": "Invalid column names"})
    
    # Convert data to format expected by frontend
    chart_data = []
    for _, row in df.iterrows():
        chart_data.append({
            xKey: row[xKey],
            yKey: row[yKey]
        })
    
    return {"data": chart_data, "xKey": xKey, "yKey": yKey}

@app.get("/api/scatter-plot")
async def get_scatter_plot(sessionId: str = Query(...), xKey: str = Query(...), yKey: str = Query(...)):
    content = load_session(sessionId)
    if content is None:
        return JSONResponse(status_code=404, content={"error": "Session not found"})

    preview = content["preview"]
    df = pd.DataFrame(preview[1:], columns=preview[0])
    
    # Validate columns exist
    if xKey not in df.columns or yKey not in df.columns:
        return JSONResponse(status_code=400, content={"error": "Invalid column names"})
    
    # Convert data to format expected by frontend
    chart_data = []
    for _, row in df.iterrows():
        chart_data.append({
            xKey: row[xKey],
            yKey: row[yKey]
        })
    
    return {"data": chart_data, "xKey": xKey, "yKey": yKey}

# Heatmap endpoints
@app.post("/api/heatmap")
async def create_heatmap(file: UploadFile = File(...), xKey: str = Query(...), yKey: str = Query(...), valueKey: str = Query(...)):
    contents = await file.read()
    df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
    
    # Validate columns exist
    if xKey not in df.columns or yKey not in df.columns or valueKey not in df.columns:
        return JSONResponse(status_code=400, content={"error": "Invalid column names"})
    
    # Convert data to format expected by frontend
    chart_data = []
    for _, row in df.iterrows():
        chart_data.append({
            xKey: row[xKey],
            yKey: row[yKey],
            valueKey: row[valueKey]
        })
    
    return {"data": chart_data, "xKey": xKey, "yKey": yKey, "valueKey": valueKey}

@app.get("/api/heatmap")
async def get_heatmap(sessionId: str = Query(...), xKey: str = Query(...), yKey: str = Query(...), valueKey: str = Query(...)):
    content = load_session(sessionId)
    if content is None:
        return JSONResponse(status_code=404, content={"error": "Session not found"})

    preview = content["preview"]
    df = pd.DataFrame(preview[1:], columns=preview[0])
    
    # Validate columns exist
    if xKey not in df.columns or yKey not in df.columns or valueKey not in df.columns:
        return JSONResponse(status_code=400, content={"error": "Invalid column names"})
    
    # Convert data to format expected by frontend
    chart_data = []
    for _, row in df.iterrows():
        chart_data.append({
            xKey: row[xKey],
            yKey: row[yKey],
            valueKey: row[valueKey]
        })
    
    return {"data": chart_data, "xKey": xKey, "yKey": yKey, "valueKey": valueKey}
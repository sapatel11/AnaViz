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
    preview, full_data = parse_file(file.filename, content)
    session_id = str(uuid.uuid4())

    # Store both preview and full data for retrieval
    session_data = {
        "filename": file.filename,
        "preview": preview,
        "full_data": full_data
    }
    
    save_session(session_id, session_data)

    return {"filename": file.filename, "preview": preview, "session_id": session_id}

@app.post("/api/statistical-summary")
async def get_statistical_summary(file: UploadFile = File(...)):
    contents = await file.read()
    df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
    summary = df.describe(include="all").fillna("").to_dict()
    # Convert numpy types to native Python types
    summary = {k: {kk: float(vv) if isinstance(vv, (int, float)) else str(vv) for kk, vv in v.items()} for k, v in summary.items()}
    return {"summary": summary}

@app.post("/api/missing-data-overview")
async def get_missing_data(file: UploadFile = File(...)):
    contents = await file.read()
    df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
    missing_data = df.isnull().sum().to_dict()
    # Convert numpy types to native Python types
    missing_data = {k: int(v) for k, v in missing_data.items()}
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
        outlier_counts[col] = int(len(outliers))  # Convert to native Python int

    return {"outliers": outlier_counts}

@app.post("/api/correlation-matrix")
async def get_correlation_matrix(file: UploadFile = File(...)):
    contents = await file.read()
    df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
    corr_matrix = df.corr(numeric_only=True).fillna(0).round(3).to_dict()
    # Convert numpy types to native Python types
    corr_matrix = {k: {kk: float(vv) for kk, vv in v.items()} for k, v in corr_matrix.items()}
    return {"correlation_matrix": corr_matrix}

@app.get("/api/statistical-summary")
async def get_statistical_summary(sessionId: str):
    content = load_session(sessionId)
    if content is None:
        return JSONResponse(status_code=404, content={"error": "Session not found"})

    # Use preview data for trial space (5 rows)
    data = content["preview"]
    df = pd.DataFrame(data[1:], columns=data[0])
    summary = df.describe(include="all").fillna("").to_dict()
    return {"summary": summary}

@app.get("/api/correlation-matrix")
def correlation_matrix(sessionId: str):
    content = load_session(sessionId)
    if content is None:
        return JSONResponse(status_code=404, content={"error": "Session not found"})

    # Use preview data for trial space (5 rows)
    data = content["preview"]
    df = pd.DataFrame(data[1:], columns=data[0])
    
    numeric_df = df.select_dtypes(include="number")
    corr = numeric_df.corr().round(2)
    return {"type": "table", "data": corr.fillna("").to_dict()}


@app.get("/api/missing-data-overview")
def missing_data(sessionId: str):
    content = load_session(sessionId)
    if content is None:
        return JSONResponse(status_code=404, content={"error": "Session not found"})

    # Use preview data for trial space (5 rows)
    data = content["preview"]
    df = pd.DataFrame(data[1:], columns=data[0])

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

    # Use preview data for trial space (5 rows)
    data = content["preview"]
    df = pd.DataFrame(data[1:], columns=data[0])

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

@app.get("/full-data")
async def get_full_data(sessionId: str = Query(...)):
    session_data = load_session(sessionId)
    if not session_data:
        return JSONResponse(status_code=404, content={"detail": "Session not found"})

    full_data = session_data.get("full_data")
    if not full_data:
        return JSONResponse(status_code=404, content={"detail": "Full data not found"})

    return {"data": full_data}

# Bar Chart endpoints
@app.post("/api/bar-chart")
async def create_bar_chart(file: UploadFile = File(...), xKey: str = Query(...), yKey: str = Query(...)):
    contents = await file.read()
    df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
    
    # Validate columns exist
    if xKey not in df.columns or yKey not in df.columns:
        return JSONResponse(status_code=400, content={"error": "Invalid column names"})
    
    # Group by xKey and aggregate yKey values
    # For numeric yKey, calculate mean; for non-numeric, count occurrences
    if pd.api.types.is_numeric_dtype(df[yKey]):
        grouped_data = df.groupby(xKey)[yKey].mean().reset_index()
    else:
        grouped_data = df.groupby(xKey).size().reset_index(name=yKey)
    
    # Convert data to format expected by frontend
    chart_data = []
    for _, row in grouped_data.iterrows():
        chart_data.append({
            xKey: str(row[xKey]) if pd.notna(row[xKey]) else str(row[xKey]),
            yKey: float(row[yKey]) if pd.notna(row[yKey]) else 0.0
        })
    
    return {"data": chart_data, "xKey": xKey, "yKey": yKey}

@app.get("/api/bar-chart")
async def get_bar_chart(sessionId: str = Query(...), xKey: str = Query(...), yKey: str = Query(...)):
    content = load_session(sessionId)
    if content is None:
        return JSONResponse(status_code=404, content={"error": "Session not found"})

    # Use preview data for trial space (5 rows)
    data = content["preview"]
    df = pd.DataFrame(data[1:], columns=data[0])
    
    # Validate columns exist
    if xKey not in df.columns or yKey not in df.columns:
        return JSONResponse(status_code=400, content={"error": "Invalid column names"})
    
    # Group by xKey and aggregate yKey values
    # For numeric yKey, calculate mean; for non-numeric, count occurrences
    if pd.api.types.is_numeric_dtype(df[yKey]):
        grouped_data = df.groupby(xKey)[yKey].mean().reset_index()
    else:
        grouped_data = df.groupby(xKey).size().reset_index(name=yKey)
    
    # Convert data to format expected by frontend
    chart_data = []
    for _, row in grouped_data.iterrows():
        chart_data.append({
            xKey: str(row[xKey]) if pd.notna(row[xKey]) else str(row[xKey]),
            yKey: float(row[yKey]) if pd.notna(row[yKey]) else 0.0
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
    
    # Sort by xKey for line graph
    df = df.sort_values(xKey)
    
    # Convert data to format expected by frontend
    chart_data = []
    for _, row in df.iterrows():
        # Handle different data types for yKey
        y_value = row[yKey]
        if pd.notna(y_value):
            if pd.api.types.is_numeric_dtype(df[yKey]):
                y_value = float(y_value)
            else:
                y_value = str(y_value)
        else:
            y_value = 0.0 if pd.api.types.is_numeric_dtype(df[yKey]) else ""
        
        chart_data.append({
            xKey: str(row[xKey]) if pd.notna(row[xKey]) else str(row[xKey]),
            yKey: y_value
        })
    
    return {"data": chart_data, "xKey": xKey, "yKey": yKey}

@app.get("/api/line-graph")
async def get_line_graph(sessionId: str = Query(...), xKey: str = Query(...), yKey: str = Query(...)):
    content = load_session(sessionId)
    if content is None:
        return JSONResponse(status_code=404, content={"error": "Session not found"})

    # Use preview data for trial space (5 rows)
    data = content["preview"]
    df = pd.DataFrame(data[1:], columns=data[0])
    
    # Validate columns exist
    if xKey not in df.columns or yKey not in df.columns:
        return JSONResponse(status_code=400, content={"error": "Invalid column names"})
    
    # Sort by xKey for line graph
    df = df.sort_values(xKey)
    
    # Convert data to format expected by frontend
    chart_data = []
    for _, row in df.iterrows():
        # Handle different data types for yKey
        y_value = row[yKey]
        if pd.notna(y_value):
            if pd.api.types.is_numeric_dtype(df[yKey]):
                y_value = float(y_value)
            else:
                y_value = str(y_value)
        else:
            y_value = 0.0 if pd.api.types.is_numeric_dtype(df[yKey]) else ""
        
        chart_data.append({
            xKey: str(row[xKey]) if pd.notna(row[xKey]) else str(row[xKey]),
            yKey: y_value
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
        # Handle different data types for xKey and yKey
        x_value = row[xKey]
        y_value = row[yKey]
        
        if pd.notna(x_value):
            if pd.api.types.is_numeric_dtype(df[xKey]):
                x_value = float(x_value)
            else:
                x_value = str(x_value)
        else:
            x_value = 0.0 if pd.api.types.is_numeric_dtype(df[xKey]) else ""
            
        if pd.notna(y_value):
            if pd.api.types.is_numeric_dtype(df[yKey]):
                y_value = float(y_value)
            else:
                y_value = str(y_value)
        else:
            y_value = 0.0 if pd.api.types.is_numeric_dtype(df[yKey]) else ""
        
        chart_data.append({
            xKey: x_value,
            yKey: y_value
        })
    
    return {"data": chart_data, "xKey": xKey, "yKey": yKey}

@app.get("/api/scatter-plot")
async def get_scatter_plot(sessionId: str = Query(...), xKey: str = Query(...), yKey: str = Query(...)):
    content = load_session(sessionId)
    if content is None:
        return JSONResponse(status_code=404, content={"error": "Session not found"})

    # Use preview data for trial space (5 rows)
    data = content["preview"]
    df = pd.DataFrame(data[1:], columns=data[0])
    
    # Validate columns exist
    if xKey not in df.columns or yKey not in df.columns:
        return JSONResponse(status_code=400, content={"error": "Invalid column names"})
    
    # Convert data to format expected by frontend
    chart_data = []
    for _, row in df.iterrows():
        # Handle different data types for xKey and yKey
        x_value = row[xKey]
        y_value = row[yKey]
        
        if pd.notna(x_value):
            if pd.api.types.is_numeric_dtype(df[xKey]):
                x_value = float(x_value)
            else:
                x_value = str(x_value)
        else:
            x_value = 0.0 if pd.api.types.is_numeric_dtype(df[xKey]) else ""
            
        if pd.notna(y_value):
            if pd.api.types.is_numeric_dtype(df[yKey]):
                y_value = float(y_value)
            else:
                y_value = str(y_value)
        else:
            y_value = 0.0 if pd.api.types.is_numeric_dtype(df[yKey]) else ""
        
        chart_data.append({
            xKey: x_value,
            yKey: y_value
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
    
    # Group by xKey and yKey, aggregate valueKey
    if pd.api.types.is_numeric_dtype(df[valueKey]):
        grouped_data = df.groupby([xKey, yKey])[valueKey].mean().reset_index()
    else:
        grouped_data = df.groupby([xKey, yKey]).size().reset_index(name=valueKey)
    
    # Convert data to format expected by frontend
    chart_data = []
    for _, row in grouped_data.iterrows():
        chart_data.append({
            xKey: str(row[xKey]) if pd.notna(row[xKey]) else str(row[xKey]),
            yKey: str(row[yKey]) if pd.notna(row[yKey]) else str(row[yKey]),
            valueKey: float(row[valueKey]) if pd.notna(row[valueKey]) else 0.0
        })
    
    return {"data": chart_data, "xKey": xKey, "yKey": yKey, "valueKey": valueKey}

@app.get("/api/heatmap")
async def get_heatmap(sessionId: str = Query(...), xKey: str = Query(...), yKey: str = Query(...), valueKey: str = Query(...)):
    content = load_session(sessionId)
    if content is None:
        return JSONResponse(status_code=404, content={"error": "Session not found"})

    # Use preview data for trial space (5 rows)
    data = content["preview"]
    df = pd.DataFrame(data[1:], columns=data[0])
    
    # Validate columns exist
    if xKey not in df.columns or yKey not in df.columns or valueKey not in df.columns:
        return JSONResponse(status_code=400, content={"error": "Invalid column names"})
    
    # Group by xKey and yKey, aggregate valueKey
    if pd.api.types.is_numeric_dtype(df[valueKey]):
        grouped_data = df.groupby([xKey, yKey])[valueKey].mean().reset_index()
    else:
        grouped_data = df.groupby([xKey, yKey]).size().reset_index(name=valueKey)
    
    # Convert data to format expected by frontend
    chart_data = []
    for _, row in grouped_data.iterrows():
        chart_data.append({
            xKey: str(row[xKey]) if pd.notna(row[xKey]) else str(row[xKey]),
            yKey: str(row[yKey]) if pd.notna(row[yKey]) else str(row[yKey]),
            valueKey: float(row[valueKey]) if pd.notna(row[valueKey]) else 0.0
        })
    
    return {"data": chart_data, "xKey": xKey, "yKey": yKey, "valueKey": valueKey}
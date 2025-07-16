from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from viz.utils import parse_file
from typing import List

app = FastAPI()

# CORS to allow frontend to call the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    content = await file.read()
    preview = parse_file(file.filename, content)
    return {"filename": file.filename, "preview": preview}

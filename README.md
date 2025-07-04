# AnaViz Platform

An interactive web application that allows users to upload analytical datasets and generate rich visualizations and insights.

## Tech Stack

- Frontend: Next.js (React, Tailwind CSS)
- Backend: FastAPI (Python, Pandas, Plotly)
- Visualization: Plotly.js, Chart.js
- Deployment: Vercel + Render/Fly.io

## Setup

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload

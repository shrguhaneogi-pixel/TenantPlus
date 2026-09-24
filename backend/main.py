"""
Project TenantPlus — FastAPI REST Backend
Module: backend.main

Implements the Hybrid Deterministic Architecture:
1. Endpoint /api/v1/extract-notice: Image Upload -> Antigravity Agent Vision OCR -> Supabase Statutes -> Deterministic Rules Engine
2. Endpoint /api/v1/health: Service health check
3. CORS configuration for Next.js frontend (http://localhost:3000)
"""

import os
from typing import Dict, Any, Optional
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

# Import Pydantic schemas, Antigravity service, and deterministic rules engine
from backend.schemas import NoticeExtraction
from backend.agent_service import extract_notice_data
from backend.rules_engine import NoticeEvaluator

# Initialize Supabase Python Client (supabase-py)
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

supabase_client = None
try:
    if SUPABASE_URL and SUPABASE_KEY:
        from supabase import create_client, Client
        supabase_client: Optional[Client] = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    print(f"Warning: Supabase client initialization deferred: {e}")

# Fallback in-memory statutory rules if Supabase connection is not active
DEFAULT_RULES = {
    "3-Day Notice to Pay or Quit": {
        "state": "CA",
        "notice_type": "3-Day Notice to Pay or Quit",
        "days_to_respond": 3,
        "exclude_weekends": True,
        "exclude_holidays": True,
        "mandatory_warnings": [
            "California Code of Civil Procedure Section 1161",
            "Within three (3) days",
            "hours"
        ]
    },
    "14-Day Notice to Quit": {
        "state": "NY",
        "notice_type": "14-Day Notice to Quit",
        "days_to_respond": 14,
        "exclude_weekends": False,
        "exclude_holidays": True,
        "mandatory_warnings": [
            "RPAPL 711",
            "fourteen (14) days",
            "Legal Aid"
        ]
    },
    "5-Day Notice for Nonpayment": {
        "state": "IL",
        "notice_type": "5-Day Notice for Nonpayment",
        "days_to_respond": 5,
        "exclude_weekends": True,
        "exclude_holidays": True,
        "mandatory_warnings": [
            "735 ILCS 5/9-209",
            "within five (5) days"
        ]
    }
}

app = FastAPI(
    title="Project TenantPlus API",
    description="Hybrid Deterministic Eviction Notice Triage Backend",
    version="1.0.0"
)

# CORS configuration for Next.js frontend (localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*" # Allow Cloud Run / dev server preview URLs
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/v1/health")
async def health_check():
    """Health check endpoint confirming API status and database link."""
    return {
        "status": "healthy",
        "service": "TenantPlus Deterministic Engine",
        "supabase_connected": supabase_client is not None,
        "architecture": "Hybrid Deterministic (AI Vision + Python Calendar Arithmetic)"
    }


@app.post("/api/v1/extract-notice")
async def extract_notice_endpoint(file: UploadFile = File(...)):
    """
    Core Triage Pipeline:
    1. Receives WebP compressed eviction notice from Next.js.
    2. Invokes Antigravity Agent for structured vision extraction (schemas.NoticeExtraction).
    3. Queries Supabase 'jurisdiction_rules' table for matching notice_type.
    4. Bypasses LLM for ALL date math, running NoticeEvaluator deterministically.
    5. Returns finalized payload (deadlines, defects, mapped bounding boxes).
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Upload must be an image (WebP, PNG, JPG)."
        )

    image_bytes = await file.read()
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Phase 2: AI Vision extraction via Antigravity Agent
    extraction: NoticeExtraction = await extract_notice_data(image_bytes)

    # Phase 3: Query Supabase PostgreSQL for statutory rules
    rules: Dict[str, Any] = DEFAULT_RULES.get(
        extraction.notice_type, DEFAULT_RULES["3-Day Notice to Pay or Quit"]
    )

    if supabase_client:
        try:
            res = (
                supabase_client.table("jurisdiction_rules")
                .select("*")
                .ilike("notice_type", f"%{extraction.notice_type[:10]}%")
                .limit(1)
                .execute()
            )
            if res.data and len(res.data) > 0:
                rules = res.data[0]
        except Exception as db_err:
            print(f"Supabase query warning (using cached statutes): {db_err}")

    # Run deterministic evaluation (zero LLM in math or defect checks)
    evaluator = NoticeEvaluator(extraction, rules)
    triage_result = evaluator.run_full_triage()

    return {
        "success": True,
        "data": triage_result,
        "extraction": extraction.model_dump()
    }

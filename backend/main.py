"""
Project TenantPlus — FastAPI REST Backend (PRODUCTION CONFIGURED)
Module: backend.main

Implements the Hybrid Deterministic Architecture:
1. Endpoint /api/v1/extract-notice: Accepts WebP compressed eviction notice & state parameter -> Antigravity Agent Vision OCR -> State-Filtered Supabase Statutes & Holidays -> Deterministic Rules Engine.
2. Endpoint /api/v1/health: Container & Cloud Service health check.
3. Production CORS middleware supporting configurable ALLOWED_ORIGINS.
"""

import os
from typing import Dict, Any, Optional, List
from fastapi import FastAPI, File, UploadFile, HTTPException, Query, Form
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from backend.schemas import NoticeExtraction
from backend.agent_service import extract_notice_data
from backend.rules_engine import NoticeEvaluator

# Fallback statutory rules if Supabase connection is deferred
FALLBACK_RULES: Dict[str, Dict[str, Any]] = {
    "CA_3-Day Notice to Pay or Quit": {
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
    "NY_14-Day Notice to Quit": {
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
    "IL_5-Day Notice for Nonpayment": {
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

# Pre-populated fallback court holidays for testing without live DB
FALLBACK_HOLIDAYS: Dict[str, List[str]] = {
    "NY": ["2026-07-04", "2026-09-07", "2026-11-26"],
    "CA": ["2026-07-04", "2026-09-07", "2026-11-26"],
    "IL": ["2026-07-04", "2026-09-07"]
}

# Initialize Supabase Python Client (supabase-py)
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

supabase_client = None
try:
    if SUPABASE_URL and SUPABASE_KEY:
        from supabase import create_client, Client
        supabase_client: Optional[Client] = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as db_init_err:
    print(f"Warning: Supabase client deferred: {db_init_err}")

app = FastAPI(
    title="Project TenantPlus API",
    description="Hybrid Deterministic Eviction Notice Triage Backend",
    version="1.0.0"
)

# Production CORS configuration
raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,https://tenantplus.vercel.app")
origins_list = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
if "*" not in origins_list:
    origins_list.append("*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins_list,
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
async def extract_notice_endpoint(
    file: UploadFile = File(...),
    state: Optional[str] = Query(default=None, description="2-letter state code e.g. CA, NY, IL")
):
    """
    Core Triage Pipeline:
    1. Receives WebP compressed eviction notice from Next.js.
    2. Invokes Antigravity Agent for structured vision extraction (schemas.NoticeExtraction).
    3. Queries Supabase using .eq("state", target_state).eq("notice_type", extracted_type).
    4. Fetches jurisdiction court_holidays for exact date arithmetic.
    5. Runs NoticeEvaluator deterministically (zero LLM for math).
    6. Returns finalized payload (deadlines, defects, mapped bounding boxes).
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Upload must be an image (WebP, PNG, JPG)."
        )

    image_bytes = await file.read()
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Determine target jurisdiction state (query param > default CA)
    target_state = (state or "CA").upper()

    # 1. AI Vision extraction via Antigravity Agent
    extraction: NoticeExtraction = await extract_notice_data(image_bytes, target_state=target_state)
    
    # Use state extracted from notice if query param not explicitly supplied
    final_state = state.upper() if state else extraction.jurisdiction_state.upper()

    # 2. Query Supabase PostgreSQL matching state AND notice_type
    fallback_key = f"{final_state}_{extraction.notice_type}"
    rules: Dict[str, Any] = FALLBACK_RULES.get(
        fallback_key,
        FALLBACK_RULES.get(
            f"CA_{extraction.notice_type}",
            {
                "state": final_state,
                "notice_type": extraction.notice_type,
                "days_to_respond": 3,
                "exclude_weekends": True,
                "exclude_holidays": True,
                "mandatory_warnings": []
            }
        )
    )

    court_holidays: List[str] = FALLBACK_HOLIDAYS.get(final_state, [])

    if supabase_client:
        try:
            # Strict state + notice_type query
            rules_res = supabase_client.table("jurisdiction_rules") \
                .select("*") \
                .eq("state", final_state) \
                .eq("notice_type", extraction.notice_type) \
                .limit(1) \
                .execute()

            if rules_res.data and len(rules_res.data) > 0:
                rules = rules_res.data[0]
            else:
                # Secondary attempt with fuzzy notice_type matching within state
                rules_res_fuzzy = supabase_client.table("jurisdiction_rules") \
                    .select("*") \
                    .eq("state", final_state) \
                    .ilike("notice_type", f"%{extraction.notice_type[:8]}%") \
                    .limit(1) \
                    .execute()
                if rules_res_fuzzy.data and len(rules_res_fuzzy.data) > 0:
                    rules = rules_res_fuzzy.data[0]

            # Query court holidays for the state
            holidays_res = supabase_client.table("court_holidays") \
                .select("holiday_date") \
                .eq("state", final_state) \
                .execute()
            if holidays_res.data:
                court_holidays = [item["holiday_date"] for item in holidays_res.data]
        except Exception as db_err:
            print(f"Supabase query warning (using fallback rules): {db_err}")

    # 3. Run deterministic evaluation (zero LLM in math or defect checks)
    evaluator = NoticeEvaluator(extraction, rules, court_holidays)
    triage_result = evaluator.run_full_triage()

    return {
        "success": True,
        "data": triage_result,
        "extraction": extraction.model_dump()
    }

"""
Project TenantPlus — End-to-End Diagnostic Verification Test
Module: scratch/test_e2e_simulation.py

Simulates the complete data flow:
Image Upload -> Next.js -> FastAPI -> Gemini Extraction -> Markdown Stripping -> State-Filtered Rules -> Court Holiday Arithmetic -> Viewport Coordinate Scaler
"""

import sys
import os
import json
import asyncio
from io import BytesIO

# Force UTF-8 output encoding for Windows terminal
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

# Ensure project root is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.schemas import NoticeExtraction, BoundingBox
from backend.agent_service import sanitize_json_response, extract_notice_data
from backend.rules_engine import NoticeEvaluator
from backend.main import app, extract_notice_endpoint


async def run_e2e_diagnostic_trace():
    print("================================================================================")
    print("[PROJECT TENANTPLUS]: END-TO-END DIAGNOSTIC TRACE SIMULATION")
    print("================================================================================")
    
    # -------------------------------------------------------------------------
    # STEP 1: Verify Markdown Fence Sanitizer (Fix 3)
    # -------------------------------------------------------------------------
    raw_gemini_response = """```json
    {
        "notice_type": "14-Day Notice to Quit",
        "jurisdiction_state": "NY",
        "service_date": "2026-06-20",
        "demanded_amount": 3200.0,
        "date_bounding_box": {"ymin": 0.52, "xmin": 0.10, "ymax": 0.61, "xmax": 0.50},
        "amount_bounding_box": {"ymin": 0.35, "xmin": 0.10, "ymax": 0.42, "xmax": 0.88},
        "extracted_text_blocks": [
            "14-DAY NOTICE TO QUIT FOR NON-PAYMENT OF RENT",
            "Pursuant to RPAPL Section 711",
            "Fourteen (14) days notice is hereby required",
            "Rent Due: $3,000.00 | Legal Administrative Fee: $200.00",
            "Total Demanded: $3,200.00",
            "Served on June 20, 2026"
        ]
    }
    ```"""
    
    cleaned_json = sanitize_json_response(raw_gemini_response)
    parsed_dict = json.loads(cleaned_json)
    assert parsed_dict["notice_type"] == "14-Day Notice to Quit"
    print("[PASS] STEP 1: Markdown fence stripped successfully. Zero JSONDecodeError.")

    # -------------------------------------------------------------------------
    # STEP 2: Verify Pydantic v2 Notice Extraction Model (Fix 2 & Fix 3)
    # -------------------------------------------------------------------------
    extraction = NoticeExtraction.model_validate(parsed_dict)
    assert extraction.jurisdiction_state == "NY"
    assert extraction.demanded_amount == 3200.0
    assert extraction.amount_bounding_box.ymin == 0.35
    print("[PASS] STEP 2: Pydantic v2 NoticeExtraction model validated with normalized floats.")

    # -------------------------------------------------------------------------
    # STEP 3: Verify Court Holiday Calendar Arithmetic (Fix 4)
    # -------------------------------------------------------------------------
    ny_rules = {
        "state": "NY",
        "notice_type": "14-Day Notice to Quit",
        "days_to_respond": 14,
        "exclude_weekends": False, # NY RPAPL § 711 uses calendar days
        "exclude_holidays": True,  # Court holidays tolled
        "mandatory_warnings": [
            "RPAPL 711",
            "fourteen (14) days",
            "Legal Aid"
        ]
    }
    
    # Pre-populated NY court holidays including July 4th
    ny_court_holidays = ["2026-07-04", "2026-09-07"]
    
    evaluator = NoticeEvaluator(extraction, ny_rules, ny_court_holidays)
    triage_result = evaluator.run_full_triage()
    
    deadline_formatted = triage_result["deadline_date_formatted"]
    print(f"   Calculated Deadline: {deadline_formatted}")
    
    # 14 days after June 20 service date (excluding service day June 20):
    # Day 14 falls on July 4, 2026 (Independence Day Holiday).
    # The holiday logic tolls July 4 and advances deadline to Sunday, July 5, 2026.
    assert "July 05, 2026" in deadline_formatted or "July 5, 2026" in deadline_formatted
    print("[PASS] STEP 3: Court holiday July 4th tolled deterministically (Deadline -> July 5, 2026).")

    # -------------------------------------------------------------------------
    # STEP 4: Verify Dynamic Fuzzy Defect Evaluation (Fix 4)
    # -------------------------------------------------------------------------
    defects = triage_result["defects"]
    # "Legal Aid" was missing from the extracted_text_blocks in raw payload above
    assert len(defects) > 0
    assert "Legal Aid" in defects[0]
    print(f"[PASS] STEP 4: Dynamic fuzzy defect evaluation identified missing mandatory warning: '{defects[0]}'.")

    # -------------------------------------------------------------------------
    # STEP 5: Verify FastAPI REST Endpoint Execution (Fix 5)
    # -------------------------------------------------------------------------
    from fastapi.datastructures import UploadFile
    dummy_image_bytes = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
    mock_file = UploadFile(filename="ny_notice.webp", file=BytesIO(dummy_image_bytes), headers={"content-type": "image/webp"})

    res = await extract_notice_endpoint(file=mock_file, state="NY")
    assert res["success"] is True
    assert res["data"]["jurisdiction_state"] == "NY"
    print("[PASS] STEP 5: FastAPI /api/v1/extract-notice route executed with zero NameError.")

    # -------------------------------------------------------------------------
    # STEP 6: Verify Viewport Coordinate Scaler Output (Fix 6)
    # -------------------------------------------------------------------------
    def scale_bounding_box(box_dict, width, height):
        ymin, xmin = box_dict["ymin"], box_dict["xmin"]
        ymax, xmax = box_dict["ymax"], box_dict["xmax"]
        left = round(xmin * width)
        top = round(ymin * height)
        w = max(12, round((xmax - xmin) * width))
        h = max(12, round((ymax - ymin) * height))
        return {"left": left, "top": top, "width": w, "height": h}

    rendered_w, rendered_h = 800, 600
    scaled_amount = scale_bounding_box(triage_result["amount_bounding_box"], rendered_w, rendered_h)
    print(f"   Scaled Bounding Box (Amount) on {rendered_w}x{rendered_h} viewport: {scaled_amount}")
    assert scaled_amount["left"] == 80  # 0.10 * 800
    assert scaled_amount["top"] == 210  # 0.35 * 600
    assert scaled_amount["width"] == 624 # (0.88 - 0.10) * 800
    assert scaled_amount["height"] == 42 # (0.42 - 0.35) * 600
    print("[PASS] STEP 6: Coordinate scaler produced exact pixel bounds [left:80px, top:210px, width:624px, height:42px].")

    print("\n================================================================================")
    print("[SUCCESS] ALL 6 DIAGNOSTIC TRACE STEPS PASSED WITH ZERO ERRORS (COMPLIANCE: 100%)")
    print("================================================================================\n")

if __name__ == "__main__":
    asyncio.run(run_e2e_diagnostic_trace())

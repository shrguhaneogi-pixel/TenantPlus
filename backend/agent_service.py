"""
Project TenantPlus — AI Extraction Layer & Antigravity Agent (PHASE 2)
Module: backend.agent_service

Orchestrates the Google Antigravity Agent and Gemini Vision pipeline.
Enforces strict Pydantic v2 structured output for entity and spatial bounding box extraction.
ZERO mathematical calculations or legal evaluations occur in this layer.
"""

import os
import json
import base64
from typing import Optional
from backend.schemas import NoticeExtraction, BoundingBox

# Import Google Antigravity Agent SDK
try:
    from google.antigravity import Agent, LocalAgentConfig
except ImportError:
    # Graceful fallback mock for environments without antigravity pre-installed
    Agent = None
    LocalAgentConfig = None


AGENT_SYSTEM_INSTRUCTION = """
You are an expert legal document OCR and visual layout extraction agent.
Your ONLY responsibility is to read the eviction notice image and extract structured factual information:
1. Notice type (e.g., '3-Day Notice to Pay or Quit', '14-Day Notice to Quit')
2. Date of service in ISO 8601 (YYYY-MM-DD)
3. Total demanded rent amount (float)
4. Spatial bounding boxes for the service date and demanded amount, normalized between 0.0 and 1.0 (ymin, xmin, ymax, xmax)
5. All verbatim text blocks visible on the document for statutory compliance checking

CRITICAL: DO NOT calculate any deadlines. DO NOT evaluate whether the notice has expired.
Extract only the factual content as observed on the face of the document.
"""


async def extract_notice_data(image_bytes: bytes) -> NoticeExtraction:
    """
    Invokes the Google Antigravity Agent / Gemini Vision to extract factual notice entities.
    Returns a validated NoticeExtraction Pydantic v2 instance.
    """
    if Agent is not None and LocalAgentConfig is not None:
        # Standard GCP Vertex or API Key configuration
        use_vertex = os.getenv("USE_VERTEX_AI", "false").lower() == "true"
        config = LocalAgentConfig(vertex=use_vertex)
        
        async with Agent(config) as agent:
            prompt = (
                "Analyze this eviction notice image. Extract the notice type, service date, demanded amount, "
                "normalized bounding boxes for date and amount, and all extracted text blocks into JSON matching the schema."
            )
            # Pass image bytes and structured prompt to Antigravity Agent
            response = await agent.run(
                prompt=prompt,
                media=[{"data": image_bytes, "mime_type": "image/webp"}],
                system_instruction=AGENT_SYSTEM_INSTRUCTION,
                output_schema=NoticeExtraction.model_json_schema()
            )
            
            raw_json = response.text if hasattr(response, "text") else str(response)
            data = json.loads(raw_json)
            return NoticeExtraction.model_validate(data)
    else:
        # Fallback simulation parser when google-antigravity library is mocked
        return NoticeExtraction(
            notice_type="3-Day Notice to Pay or Quit",
            service_date="2026-09-21",
            demanded_amount=2450.00,
            date_bounding_box=BoundingBox(
                ymin=0.56,
                xmin=0.08,
                ymax=0.65,
                xmax=0.55,
                label="SERVICE_DATE",
                text_content="September 21, 2026"
            ),
            amount_bounding_box=BoundingBox(
                ymin=0.31,
                xmin=0.08,
                ymax=0.39,
                xmax=0.92,
                label="DEMANDED_AMOUNT",
                text_content="$2,450.00 ($2,300 rent + $150 late fee)"
            ),
            extracted_text_blocks=[
                "THREE-DAY NOTICE TO PAY RENT OR QUIT",
                "Pursuant to California Code of Civil Procedure Section 1161",
                "Within three (3) days after service",
                "pay the total sum or quit",
                "Base Rent: $2,300.00 | Late Fee: $150.00",
                "Total Demanded: $2,450.00",
                "Served on September 21, 2026"
            ]
        )

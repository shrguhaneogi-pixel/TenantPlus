"""
Project TenantPlus — Backend Pydantic v2 Schemas
Module: backend.models.notice_extraction

Strict Pydantic v2 schemas for Gemini Antigravity Agent entity extraction
and deterministic statutory calculation output.
"""

from typing import List, Optional, Literal
from pydantic import BaseModel, Field, field_validator
from datetime import date, datetime


class BoundingBox(BaseModel):
    """
    Spatial coordinates for document clauses normalized to a 1000x1000 coordinate space.
    Coordinates represent [ymin, xmin, ymax, xmax] where (0,0) is top-left and (1000,1000) is bottom-right.
    """
    box_id: str = Field(
        ...,
        description="Unique identifier for the bounding box (e.g. 'box-notice-title', 'box-defect-latefee')"
    )
    ymin: int = Field(
        ...,
        ge=0,
        le=1000,
        description="Top edge coordinate normalized to [0, 1000]"
    )
    xmin: int = Field(
        ...,
        ge=0,
        le=1000,
        description="Left edge coordinate normalized to [0, 1000]"
    )
    ymax: int = Field(
        ...,
        ge=0,
        le=1000,
        description="Bottom edge coordinate normalized to [0, 1000]"
    )
    xmax: int = Field(
        ...,
        ge=0,
        le=1000,
        description="Right edge coordinate normalized to [0, 1000]"
    )
    label: str = Field(
        ...,
        description="Classification label: 'NOTICE_TITLE', 'SERVICE_DATE', 'DEMANDED_AMOUNT', 'LATE_FEE_DEFECT', 'MISSING_HOURS_DEFECT', 'LANDLORD_INFO', 'PROPERTY_ADDRESS', 'SIGNATURE_BLOCK'"
    )
    clause_text: str = Field(
        ...,
        description="Verbatim or summarized text located within this document region"
    )
    is_defect: bool = Field(
        default=False,
        description="True if this region represents or triggers a legal/statutory defect"
    )
    severity: Optional[Literal["FATAL", "HIGH", "MEDIUM", "INFORMATIONAL"]] = Field(
        default="INFORMATIONAL",
        description="Legal severity of the clause or defect"
    )
    plain_english_explanation: str = Field(
        ...,
        description="Plain-English explanation displayed in interactive frontend popover/tooltip"
    )


class RentItem(BaseModel):
    """Line-item breakdown of the financial demand stated on the notice."""
    category: Literal["BASE_RENT", "LATE_FEE", "UTILITY_CHARGE", "SECURITY_DEPOSIT", "UNSPECIFIED"] = Field(
        ...,
        description="Categorization of the charge"
    )
    amount: float = Field(
        ...,
        ge=0.0,
        description="Dollar amount stated for this category"
    )
    period_or_description: Optional[str] = Field(
        default=None,
        description="Description or month/year for the charge (e.g. 'September 2026 rent')"
    )


class AgentNoticeExtraction(BaseModel):
    """
    Raw vision/OCR extraction model produced by Gemini via Google Antigravity Agent.
    Contains ONLY extracted factual text and spatial coordinates.
    CRITICAL: Does NOT contain mathematical deadline calculations.
    """
    notice_type: str = Field(
        ...,
        description="Exact title or type of eviction notice detected on document (e.g. '3-Day Notice to Pay Rent or Quit', '14-Day Notice to Quit', '5-Day Notice of Termination')"
    )
    jurisdiction_detected: str = Field(
        default="US-CA",
        description="ISO state/jurisdiction code detected from document address or statute references (e.g. 'US-CA', 'US-NY', 'US-IL-COOK')"
    )
    service_date: str = Field(
        ...,
        description="Date the notice was served or signed as stated on the document in ISO 8601 YYYY-MM-DD format"
    )
    demanded_rent: float = Field(
        ...,
        ge=0.0,
        description="Total monetary demand stated on the face of the notice"
    )
    rent_breakdown: List[RentItem] = Field(
        default_factory=list,
        description="Detailed itemization of the demanded sum (base rent, late charges, fees)"
    )
    late_fee_included: bool = Field(
        default=False,
        description="True if late fees, interest, or non-rent charges are included in the demand"
    )
    late_fee_amount: float = Field(
        default=0.0,
        ge=0.0,
        description="Dollar amount of late fees included in the demand"
    )
    landlord_name: Optional[str] = Field(
        default=None,
        description="Name of landlord, property manager, or legal representative on notice"
    )
    tenant_name: Optional[str] = Field(
        default=None,
        description="Name of tenant(s) named on the notice"
    )
    property_address: Optional[str] = Field(
        default=None,
        description="Leased premises address stated on notice"
    )
    payment_hours_provided: bool = Field(
        default=False,
        description="True if notice explicitly provides physical hours (e.g. Mon-Fri 9am-5pm) or electronic tender instructions"
    )
    payment_methods_specified: Optional[str] = Field(
        default=None,
        description="Description of payment methods listed (personal check, cashier check, online portal, in-person)"
    )
    bounding_boxes: List[BoundingBox] = Field(
        ...,
        description="List of normalized bounding boxes covering key clauses and defect areas for SVG overlay"
    )

    @field_validator("service_date")
    @classmethod
    def validate_date_format(cls, v: str) -> str:
        try:
            date.fromisoformat(v)
            return v
        except ValueError:
            # Fallback to today if unparseable
            return date.today().isoformat()


class StatutoryDefect(BaseModel):
    """
    A specific procedural or substantive legal defect identified by the deterministic engine.
    """
    id: str = Field(..., description="Unique defect code (e.g. 'DEFECT_LATE_FEE_BUNDLED')")
    severity: Literal["FATAL", "HIGH", "MEDIUM", "INFORMATIONAL"] = Field(
        ...,
        description="FATAL defects typically dismiss unlawful detainer actions as a matter of law"
    )
    title: str = Field(..., description="Short headline for defect checklist")
    statutory_citation: str = Field(..., description="Specific governing statutory code or court precedent")
    plain_english_explanation: str = Field(..., description="Clear explanation for tenant or legal advocate")
    defense_strategy_text: str = Field(..., description="Actionable defense text for tenant Answer form or demurrer")
    related_box_id: Optional[str] = Field(default=None, description="Linked bounding box ID for UI highlighting")


class DeterministicTriageResponse(BaseModel):
    """
    Final JSON response returned by the FastAPI backend to the Next.js frontend.
    Combines extracted entities with zero-hallucination mathematical deadlines and statutory rulings.
    """
    session_id: str = Field(..., description="Unique UUID for this triage run")
    jurisdiction_id: str = Field(..., description="Jurisdiction applied (e.g. 'US-CA')")
    jurisdiction_name: str = Field(..., description="Human-readable jurisdiction name")
    court_name: str = Field(..., description="Target court system with jurisdiction")
    notice_type: str = Field(..., description="Validated statutory notice type")
    
    -- Mathematical Deadline Results (Strictly Python Date Engine, ZERO LLM)
    service_date: str = Field(..., description="Service date in YYYY-MM-DD")
    statutory_cure_days: int = Field(..., description="Statutory cure period in days")
    day_counting_rule: str = Field(..., description="'COURT_DAYS' or 'CALENDAR_DAYS'")
    deadline_date_iso: str = Field(..., description="Exact answer deadline in ISO 8601 timestamp")
    deadline_date_formatted: str = Field(..., description="Human-readable deadline format")
    is_expired: bool = Field(..., description="True if the deadline timestamp has already passed")
    hours_remaining: float = Field(..., description="Exact hours remaining until court deadline")
    days_remaining: int = Field(..., description="Exact full days remaining until court deadline")
    holidays_excluded: List[str] = Field(
        default_factory=list,
        description="List of court judicial holidays that tolled/extended the deadline"
    )
    weekends_excluded_count: int = Field(
        default=0,
        description="Number of weekend days excluded under court day rules"
    )

    -- Financial & Substantive Checks
    demanded_amount: float
    base_rent_amount: float
    improper_fees_amount: float
    has_fatal_defects: bool
    defects: List[StatutoryDefect]

    -- Bounding Boxes for Scalable SVG Overlay
    bounding_boxes: List[BoundingBox]

    -- Actionable Legal Resources
    legal_aid_hotline: str
    legal_aid_org_name: str
    legal_aid_url: str
    generated_at: str

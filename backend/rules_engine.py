"""
Project TenantPlus — Deterministic Rules Engine (PHASE 3)
Module: backend.rules_engine

ZERO-HALLUCINATION DETERMINISTIC LEGAL ENGINE.
This module executes standard Python calendar arithmetic and statutory defect evaluation.
Under NO circumstances is an LLM allowed to calculate deadline dates or evaluate defects.
"""

from datetime import datetime, date, timedelta, time
from typing import Dict, Any, List
from backend.schemas import NoticeExtraction


class NoticeEvaluator:
    """
    Deterministic legal evaluation engine backed by cached PostgreSQL / Supabase statutes.
    """

    def __init__(self, extraction: NoticeExtraction, rules: Dict[str, Any]):
        self.extraction = extraction
        self.rules = rules

    @staticmethod
    def calculate_deadline(service_date: str, rules: Dict[str, Any]) -> datetime:
        """
        Deterministically calculates the exact answer deadline:
        - Parses ISO 8601 service_date.
        - Excludes day of service (service day 0 rule).
        - Adds days_to_respond.
        - If exclude_weekends is true, skips Saturdays (5) and Sundays (6).
        """
        try:
            start_date = date.fromisoformat(service_date)
        except (ValueError, TypeError):
            start_date = date.today()

        days_to_respond = int(rules.get("days_to_respond", 3))
        exclude_weekends = bool(rules.get("exclude_weekends", True))

        current_date = start_date + timedelta(days=1) # Exclude service day

        if exclude_weekends:
            counted = 0
            while counted < days_to_respond:
                # 5 = Saturday, 6 = Sunday
                if current_date.weekday() < 5:
                    counted += 1
                if counted < days_to_respond:
                    current_date += timedelta(days=1)
        else:
            current_date += timedelta(days=days_to_respond - 1)
            # Roll over to Monday if final day ends on Saturday or Sunday
            while current_date.weekday() >= 5:
                current_date += timedelta(days=1)

        # Deadline is end of court day (11:59:59 PM)
        return datetime.combine(current_date, time(23, 59, 59))

    @staticmethod
    def evaluate_defects(
        extracted_blocks: List[str], mandatory_warnings: List[str]
    ) -> List[str]:
        """
        Performs substring matching to verify if mandatory warnings from Supabase
        are actually present in the text blocks extracted by the AI vision agent.
        """
        defects: List[str] = []
        combined_text = " ".join(extracted_blocks).lower()

        for warning in mandatory_warnings:
            # Check if warning keyword or phrase exists in notice text
            if warning.lower() not in combined_text:
                defects.append(f"Statutory Defect: Missing mandatory disclosure — '{warning}'")

        return defects

    def run_full_triage(self) -> Dict[str, Any]:
        """
        Executes complete deterministic triage pipeline.
        """
        deadline = self.calculate_deadline(
            self.extraction.service_date, self.rules
        )
        mandatory_warnings = self.rules.get("mandatory_warnings", [])
        defects = self.evaluate_defects(
            self.extraction.extracted_text_blocks, mandatory_warnings
        )

        # Check for bundled late fees (common statutory defect under CCP § 1161(2))
        combined_text = " ".join(self.extraction.extracted_text_blocks).lower()
        if "late fee" in combined_text or "late charge" in combined_text:
            defects.append(
                "Fatal Defect: Late fees bundled in notice to pay or quit (Violates Cal. CCP § 1161(2) & Levitz Furniture)"
            )

        now = datetime.now()
        diff = deadline - now
        is_expired = diff.total_seconds() <= 0
        hours_remaining = max(0.0, round(diff.total_seconds() / 3600.0, 1))
        days_remaining = max(0, diff.days)

        return {
            "notice_type": self.extraction.notice_type,
            "service_date": self.extraction.service_date,
            "demanded_amount": self.extraction.demanded_amount,
            "days_to_respond": self.rules.get("days_to_respond", 3),
            "exclude_weekends": self.rules.get("exclude_weekends", True),
            "deadline_date_iso": deadline.isoformat(),
            "deadline_date_formatted": deadline.strftime("%A, %B %d, %Y at 11:59 PM"),
            "is_expired": is_expired,
            "hours_remaining": hours_remaining,
            "days_remaining": days_remaining,
            "defects": defects,
            "has_fatal_defects": len(defects) > 0,
            "date_bounding_box": self.extraction.date_bounding_box.model_dump(),
            "amount_bounding_box": self.extraction.amount_bounding_box.model_dump(),
        }

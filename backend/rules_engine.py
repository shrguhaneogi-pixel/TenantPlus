"""
Project TenantPlus — Deterministic Rules Engine (FIX 4)
Module: backend.rules_engine

ZERO-HALLUCINATION DETERMINISTIC LEGAL ENGINE.
This module executes pure Python calendar arithmetic and dynamic statutory defect evaluation.
All rules are driven dynamically by the Supabase payload.
Includes comprehensive court holiday date exclusion and fuzzy string matching for OCR variations.
"""

from datetime import datetime, date, timedelta, time
from typing import Dict, Any, List, Set, Optional
import difflib
import re
from backend.schemas import NoticeExtraction


class NoticeEvaluator:
    """
    Deterministic legal evaluation engine backed by cached PostgreSQL / Supabase statutes.
    """

    def __init__(
        self,
        extraction: NoticeExtraction,
        rules: Dict[str, Any],
        holidays: Optional[List[str]] = None
    ):
        self.extraction = extraction
        self.rules = rules
        # Set of date objects representing official court holidays for the jurisdiction
        self.holidays: Set[date] = set()
        if holidays:
            for h in holidays:
                try:
                    self.holidays.add(date.fromisoformat(str(h).strip()))
                except (ValueError, TypeError):
                    pass

    @staticmethod
    def calculate_deadline(
        service_date_str: str,
        rules: Dict[str, Any],
        court_holidays: Optional[Set[date]] = None
    ) -> datetime:
        """
        Deterministically calculates the exact court answer deadline:
        1. Parses ISO 8601 service_date.
        2. Excludes day of service (service day 0 rule).
        3. Adds days_to_respond.
        4. If exclude_weekends is true, skips Saturdays (5) and Sundays (6).
        5. If exclude_holidays is true, skips court holiday dates in court_holidays dataset.
        6. Ensures final deadline date does not fall on a weekend or court holiday (rolls forward to next business day).
        """
        try:
            start_date = date.fromisoformat(service_date_str)
        except (ValueError, TypeError):
            start_date = date.today()

        days_to_respond = int(rules.get("days_to_respond", 3))
        exclude_weekends = bool(rules.get("exclude_weekends", True))
        exclude_holidays = bool(rules.get("exclude_holidays", True))
        holiday_set = court_holidays or set()

        current_date = start_date + timedelta(days=1)  # Exclude day of service

        if exclude_weekends or exclude_holidays:
            counted = 0
            while counted < days_to_respond:
                is_weekend = exclude_weekends and current_date.weekday() >= 5
                is_holiday = exclude_holidays and current_date in holiday_set

                if not is_weekend and not is_holiday:
                    counted += 1
                
                if counted < days_to_respond:
                    current_date += timedelta(days=1)

            # Ensure final deadline date itself does not land on a weekend or court holiday
            while (exclude_weekends and current_date.weekday() >= 5) or (exclude_holidays and current_date in holiday_set):
                current_date += timedelta(days=1)
        else:
            current_date += timedelta(days=max(0, days_to_respond - 1))
            while (exclude_weekends and current_date.weekday() >= 5) or (exclude_holidays and current_date in holiday_set):
                current_date += timedelta(days=1)

        return datetime.combine(current_date, time(23, 59, 59))

    @staticmethod
    def fuzzy_match_warning(warning: str, text_blocks: List[str]) -> bool:
        """
        Uses token boundary matching and difflib fuzzy matching to verify if a mandatory
        warning disclosure is present in the OCR text blocks despite minor OCR noise.
        """
        warning_clean = warning.lower().strip()
        combined_text = " ".join(text_blocks).lower()

        # 1. Direct substring check
        if warning_clean in combined_text:
            return True

        # 2. Key statutory numbers / citations check e.g. "1161", "711", "9-209"
        citations = re.findall(r"\b\d+[-\w]*\b", warning_clean)
        if citations:
            all_found = True
            for cite in citations:
                if len(cite) >= 3 and cite not in combined_text:
                    all_found = False
                    break
            if all_found and len(citations) > 0:
                return True

        # 3. Token-based word presence check (token ratio >= 0.85)
        stop_words = {"within", "days", "after", "service", "notice", "hereby", "shall"}
        tokens = [w for w in re.findall(r"\b[a-z0-9]+\b", warning_clean) if len(w) >= 3 and w not in stop_words]
        if not tokens:
            tokens = [w for w in re.findall(r"\b[a-z0-9]+\b", warning_clean) if len(w) >= 3]

        if not tokens:
            return warning_clean in combined_text

        doc_words = set(re.findall(r"\b[a-z0-9]+\b", combined_text))
        matched_tokens = 0

        for token in tokens:
            if token in doc_words:
                matched_tokens += 1
            else:
                for w in doc_words:
                    if len(w) >= 3 and difflib.SequenceMatcher(None, token, w).ratio() >= 0.85:
                        matched_tokens += 1
                        break

        return matched_tokens == len(tokens)

    def evaluate_defects(self) -> List[str]:
        """
        Evaluates statutory defects dynamically driven by the Supabase rules payload.
        Completely eliminates hardcoded state checks.
        """
        defects: List[str] = []
        mandatory_warnings = self.rules.get("mandatory_warnings", [])
        if isinstance(mandatory_warnings, str):
            import json
            try:
                mandatory_warnings = json.loads(mandatory_warnings)
            except Exception:
                mandatory_warnings = []

        extracted_blocks = self.extraction.extracted_text_blocks or []

        # Check mandatory warning disclosures dynamically
        for warning in mandatory_warnings:
            if not self.fuzzy_match_warning(warning, extracted_blocks):
                defects.append(f"Statutory Defect: Missing required mandatory warning disclosure — '{warning}'")

        return defects

    def run_full_triage(self) -> Dict[str, Any]:
        """
        Executes complete deterministic triage pipeline.
        """
        deadline = self.calculate_deadline(
            self.extraction.service_date,
            self.rules,
            self.holidays
        )
        defects = self.evaluate_defects()

        now = datetime.now()
        diff = deadline - now
        is_expired = diff.total_seconds() <= 0
        hours_remaining = max(0.0, round(diff.total_seconds() / 3600.0, 1))
        days_remaining = max(0, diff.days)

        return {
            "notice_type": self.extraction.notice_type,
            "jurisdiction_state": self.rules.get("state", self.extraction.jurisdiction_state),
            "service_date": self.extraction.service_date,
            "demanded_amount": self.extraction.demanded_amount,
            "days_to_respond": self.rules.get("days_to_respond", 3),
            "exclude_weekends": self.rules.get("exclude_weekends", True),
            "exclude_holidays": self.rules.get("exclude_holidays", True),
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

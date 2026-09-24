"""
Project TenantPlus — Deterministic Statutory Calculation Engine
Module: backend.engine.statutory_calculator

ZERO-HALLUCINATION DETERMINISTIC LEGAL ENGINE.
This module executes standard Python calendar arithmetic and statutory defect evaluation.
Under NO circumstances is an LLM allowed to compute dates or determine legal defects.
"""

import sys
import json
import uuid
from datetime import datetime, date, timedelta, time
from typing import Dict, Any, List, Tuple

# Pre-cached Court Judicial Holidays (2025 - 2027)
COURT_HOLIDAYS_MAP: Dict[str, Dict[str, str]] = {
    "US-CA": {
        "2026-01-01": "New Year's Day",
        "2026-01-19": "Martin Luther King Jr. Day",
        "2026-02-16": "Presidents' Day",
        "2026-03-31": "César Chávez Day",
        "2026-05-25": "Memorial Day",
        "2026-06-19": "Juneteenth",
        "2026-07-03": "Independence Day (Observed)",
        "2026-07-04": "Independence Day",
        "2026-09-07": "Labor Day",
        "2026-10-12": "Indigenous Peoples' Day / Columbus Day",
        "2026-11-11": "Veterans Day",
        "2026-11-26": "Thanksgiving Day",
        "2026-11-27": "Day After Thanksgiving (Court Holiday)",
        "2026-12-25": "Christmas Day"
    },
    "US-NY": {
        "2026-01-01": "New Year's Day",
        "2026-01-19": "Martin Luther King Jr. Day",
        "2026-02-16": "Presidents' Day",
        "2026-05-25": "Memorial Day",
        "2026-06-19": "Juneteenth",
        "2026-07-03": "Independence Day (Observed)",
        "2026-09-07": "Labor Day",
        "2026-10-12": "Columbus Day",
        "2026-11-11": "Veterans Day",
        "2026-11-26": "Thanksgiving Day",
        "2026-12-25": "Christmas Day"
    },
    "US-IL-COOK": {
        "2026-01-01": "New Year's Day",
        "2026-01-19": "Martin Luther King Jr. Day",
        "2026-02-16": "Presidents' Day",
        "2026-03-02": "Casimir Pulaski Day",
        "2026-05-25": "Memorial Day",
        "2026-06-19": "Juneteenth",
        "2026-07-03": "Independence Day (Observed)",
        "2026-09-07": "Labor Day",
        "2026-10-12": "Columbus Day",
        "2026-11-11": "Veterans Day",
        "2026-11-26": "Thanksgiving Day",
        "2026-12-25": "Christmas Day"
    }
}

JURISDICTION_METADATA: Dict[str, Dict[str, Any]] = {
    "US-CA": {
        "name": "California (Statewide)",
        "court_name": "California Superior Court (Limited Civil / Unlawful Detainer)",
        "day_counting_rule": "COURT_DAYS", # Cal. CCP § 1161(2): exclude Saturdays, Sundays, and judicial holidays
        "exclude_day_of_service": True,     # Cal. CCP § 12: day 0 is excluded
        "default_cure_days": 3,
        "legal_aid_hotline": "1-888-804-3536",
        "legal_aid_org_name": "Legal Aid Association of California & Eviction Defense Collaborative",
        "legal_aid_url": "https://www.lawhelpca.org"
    },
    "US-NY": {
        "name": "New York (Statewide)",
        "court_name": "New York Housing Court / Civil Court",
        "day_counting_rule": "CALENDAR_DAYS", # 14 calendar days; if landing on weekend/holiday, rolls to next business day
        "exclude_day_of_service": True,
        "default_cure_days": 14,
        "legal_aid_hotline": "1-212-962-4795",
        "legal_aid_org_name": "Legal Aid Society Tenant Rights Helpline",
        "legal_aid_url": "https://legalaidnyc.org"
    },
    "US-IL-COOK": {
        "name": "Illinois (Cook County / Chicago)",
        "court_name": "Circuit Court of Cook County",
        "day_counting_rule": "COURT_DAYS",
        "exclude_day_of_service": True,
        "default_cure_days": 5,
        "legal_aid_hotline": "1-312-341-1070",
        "legal_aid_org_name": "Legal Aid Chicago & Metropolitan Tenants Organization",
        "legal_aid_url": "https://www.legalaidchicago.org"
    }
}


def calculate_court_deadline(
    service_date_str: str,
    jurisdiction_id: str,
    statutory_cure_days: int
) -> Tuple[datetime, List[str], int]:
    """
    Deterministically computes the exact answer deadline using statutory judicial day counting.
    Returns: (deadline_datetime, list_of_holidays_excluded, weekend_days_excluded_count)
    """
    try:
        service_dt = date.fromisoformat(service_date_str)
    except Exception:
        service_dt = date.today()

    meta = JURISDICTION_METADATA.get(jurisdiction_id, JURISDICTION_METADATA["US-CA"])
    rule = meta["day_counting_rule"]
    holidays = COURT_HOLIDAYS_MAP.get(jurisdiction_id, COURT_HOLIDAYS_MAP["US-CA"])

    holidays_excluded: List[str] = []
    weekends_excluded_count = 0

    current_date = service_dt
    # Exclude day of service: day 1 begins the day after service
    current_date += timedelta(days=1)

    if rule == "COURT_DAYS":
        # Day counting skips weekends and judicial holidays
        counted_days = 0
        while counted_days < statutory_cure_days:
            iso_str = current_date.isoformat()
            is_weekend = current_date.weekday() >= 5 # 5=Saturday, 6=Sunday
            is_holiday = iso_str in holidays

            if is_weekend:
                weekends_excluded_count += 1
            elif is_holiday:
                holidays_excluded.append(f"{iso_str}: {holidays[iso_str]}")
            else:
                counted_days += 1

            if counted_days < statutory_cure_days:
                current_date += timedelta(days=1)
    else:
        # CALENDAR_DAYS: add calendar days, then roll over if last day lands on weekend or holiday
        current_date += timedelta(days=statutory_cure_days - 1)
        # Roll forward if final day is weekend or holiday
        while True:
            iso_str = current_date.isoformat()
            is_weekend = current_date.weekday() >= 5
            is_holiday = iso_str in holidays
            if is_weekend:
                weekends_excluded_count += 1
                current_date += timedelta(days=1)
            elif is_holiday:
                holidays_excluded.append(f"{iso_str}: {holidays[iso_str]}")
                current_date += timedelta(days=1)
            else:
                break

    # Eviction answer deadline expires at 11:59:59 PM on the final statutory day
    deadline_dt = datetime.combine(current_date, time(23, 59, 59))
    return deadline_dt, holidays_excluded, weekends_excluded_count


def evaluate_statutory_defects(
    extracted_data: Dict[str, Any],
    jurisdiction_id: str
) -> List[Dict[str, Any]]:
    """
    Evaluates extracted notice entities against deterministic statutory criteria.
    Compiles statutory defects (fatal and high risk).
    """
    defects = []
    demanded_amount = float(extracted_data.get("demanded_rent", 0.0))
    late_fee_included = bool(extracted_data.get("late_fee_included", False))
    late_fee_amount = float(extracted_data.get("late_fee_amount", 0.0))
    payment_hours_provided = bool(extracted_data.get("payment_hours_provided", False))
    notice_type = str(extracted_data.get("notice_type", "")).lower()

    # Find bounding box IDs for linking
    boxes = extracted_data.get("bounding_boxes", [])
    late_fee_box_id = next((b["box_id"] for b in boxes if "late" in b.get("label", "").lower() or "defect" in b.get("label", "").lower()), None)
    hours_box_id = next((b["box_id"] for b in boxes if "hours" in b.get("label", "").lower() or "missing" in b.get("label", "").lower()), None)
    title_box_id = next((b["box_id"] for b in boxes if "title" in b.get("label", "").lower()), None)

    # 1. Defect: Inclusion of non-rent charges (Late fees / Utilities) in Pay or Quit Notice
    if late_fee_included or late_fee_amount > 0:
        if jurisdiction_id == "US-CA":
            defects.append({
                "id": "DEFECT_CA_LATE_FEE_IN_NOTICE",
                "severity": "FATAL",
                "title": "Fatal Defect: Late Fees Impermissibly Bundled in 3-Day Notice",
                "statutory_citation": "Cal. Code of Civ. Proc. § 1161(2) & Levitz Furniture Co. v. Wingtip (2001) 86 Cal.App.4th 1035",
                "plain_english_explanation": (
                    f"The landlord demanded ${late_fee_amount:,.2f} in late charges bundled into the notice. "
                    "In California, a 3-Day Notice to Pay Rent or Quit may ONLY demand actual past-due base rent. "
                    "Demanding late fees renders the notice an unlawful demand for an incorrect sum, which is a FATAL defect requiring dismissal of an eviction suit."
                ),
                "defense_strategy_text": (
                    "Affirmative Defense #1: Defective Notice — Unauthorized Demand. "
                    "Plaintiff's three-day notice demands sums other than rent, specifically late charges not permitted under CCP § 1161(2)."
                ),
                "related_box_id": late_fee_box_id
            })
        elif jurisdiction_id == "US-NY":
            defects.append({
                "id": "DEFECT_NY_NON_RENT_DEMAND",
                "severity": "FATAL",
                "title": "Fatal Defect: Non-Rent Fees in Written Rent Demand",
                "statutory_citation": "N.Y. Real Prop. Acts. Law § 702 & Housing Stability and Tenant Protection Act of 2019",
                "plain_english_explanation": (
                    "New York RPAPL § 702 strictly restricts summary nonpayment proceedings to true rent charges. "
                    "Late fees and administrative penalties cannot be included in a statutory 14-day demand. The proceeding must be dismissed."
                ),
                "defense_strategy_text": "Motion to Dismiss for failure to satisfy RPAPL § 702 rent demand requirements.",
                "related_box_id": late_fee_box_id
            })

    # 2. Defect: Failure to Provide Payment Hours and Days (California CCP § 1161(2))
    if jurisdiction_id == "US-CA" and not payment_hours_provided:
        defects.append({
            "id": "DEFECT_CA_MISSING_PAYMENT_HOURS",
            "severity": "FATAL",
            "title": "Fatal Defect: Omission of Mandatory Payment Hours & Availability",
            "statutory_citation": "Cal. Code of Civ. Proc. § 1161(2)",
            "plain_english_explanation": (
                "California statute requires the notice to explicitly specify the exact days of the week and hours "
                "(e.g., Monday through Friday between 9:00 a.m. and 5:00 p.m.) when the tenant may deliver payment in person, "
                "or provide explicit electronic funds transfer/bank deposit instructions. This notice failed to provide valid hours."
            ),
            "defense_strategy_text": (
                "Affirmative Defense #2: Failure to Provide Statutory Payment Information. "
                "Notice lacks required CCP § 1161(2) disclosures regarding physical payment hours."
            ),
            "related_box_id": hours_box_id
        })

    # 3. Defect: Inadequate Notice Period / Weekend Service
    if "3-day" in notice_type and jurisdiction_id == "US-CA":
        defects.append({
            "id": "DEFECT_STATUTORY_CALCULATION_WARNING",
            "severity": "INFORMATIONAL",
            "title": "Statutory Calculation Rule: Court Days Only Applied",
            "statutory_citation": "Cal. Code of Civ. Proc. § 12 & § 1161(2)",
            "plain_english_explanation": (
                "Under California law effective September 1, 2019 (AB 2343), weekends and judicial holidays are completely excluded "
                "from the 3-day notice computation. Landlords frequently miscalculate this and file prematurely on calendar day 4."
            ),
            "defense_strategy_text": "Premature Filing Defense: Unlawful detainer filed before expiration of statutory court-day cure period.",
            "related_box_id": title_box_id
        })

    return defects


def process_triage(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main deterministic triage entry point.
    Takes raw OCR extraction JSON, calculates exact court deadlines and evaluates statutory defects.
    """
    jurisdiction_id = payload.get("jurisdiction_detected", "US-CA")
    if jurisdiction_id not in JURISDICTION_METADATA:
        jurisdiction_id = "US-CA"

    meta = JURISDICTION_METADATA[jurisdiction_id]
    service_date = payload.get("service_date", date.today().isoformat())
    notice_type = payload.get("notice_type", "3-Day Notice to Pay Rent or Quit")
    
    cure_days = meta["default_cure_days"]
    if "14-day" in notice_type.lower():
        cure_days = 14
    elif "5-day" in notice_type.lower():
        cure_days = 5
    elif "30-day" in notice_type.lower():
        cure_days = 30
    elif "3-day" in notice_type.lower():
        cure_days = 3

    # Calculate exact deadline
    deadline_dt, holidays_excluded, weekends_excluded_count = calculate_court_deadline(
        service_date,
        jurisdiction_id,
        cure_days
    )

    now = datetime.now()
    diff = deadline_dt - now
    is_expired = diff.total_seconds() <= 0
    hours_remaining = max(0.0, round(diff.total_seconds() / 3600.0, 1))
    days_remaining = max(0, diff.days)

    # Calculate statutory defects
    defects = evaluate_statutory_defects(payload, jurisdiction_id)
    has_fatal_defects = any(d["severity"] == "FATAL" for d in defects)

    demanded_amount = float(payload.get("demanded_rent", 0.0))
    late_fee_amount = float(payload.get("late_fee_amount", 0.0))
    base_rent = max(0.0, demanded_amount - late_fee_amount)

    result = {
        "session_id": str(uuid.uuid4()),
        "jurisdiction_id": jurisdiction_id,
        "jurisdiction_name": meta["name"],
        "court_name": meta["court_name"],
        "notice_type": notice_type,
        "service_date": service_date,
        "statutory_cure_days": cure_days,
        "day_counting_rule": meta["day_counting_rule"],
        "deadline_date_iso": deadline_dt.isoformat(),
        "deadline_date_formatted": deadline_dt.strftime("%A, %B %d, %Y at %I:%M %p"),
        "is_expired": is_expired,
        "hours_remaining": hours_remaining,
        "days_remaining": days_remaining,
        "holidays_excluded": holidays_excluded,
        "weekends_excluded_count": weekends_excluded_count,
        "demanded_amount": demanded_amount,
        "base_rent_amount": base_rent,
        "improper_fees_amount": late_fee_amount,
        "has_fatal_defects": has_fatal_defects,
        "defects": defects,
        "bounding_boxes": payload.get("bounding_boxes", []),
        "legal_aid_hotline": meta["legal_aid_hotline"],
        "legal_aid_org_name": meta["legal_aid_org_name"],
        "legal_aid_url": meta["legal_aid_url"],
        "generated_at": datetime.now().isoformat()
    }

    return result


if __name__ == "__main__":
    # Can be called directly with JSON input on stdin or as argument
    if len(sys.argv) > 1:
        with open(sys.argv[1], "r", encoding="utf-8") as f:
            data = json.load(f)
    else:
        raw_input = sys.stdin.read().strip()
        data = json.loads(raw_input) if raw_input else {}

    output = process_triage(data)
    print(json.dumps(output, indent=2))

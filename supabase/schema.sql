-- ============================================================================
-- PROJECT TENANTPLUS — SUPABASE / POSTGRESQL SCHEMA
-- Database Schema for Deterministic Eviction Notice Triage & Statutory Statutes
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. JURISDICTIONS TABLE
-- Stores legal jurisdiction parameters (State, County, Municipal RLTO rules)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS jurisdictions (
    id VARCHAR(50) PRIMARY KEY, -- e.g., 'US-CA', 'US-NY', 'US-IL-COOK'
    name VARCHAR(150) NOT NULL,
    state_code VARCHAR(2) NOT NULL,
    county VARCHAR(100),
    municipality VARCHAR(100),
    court_name VARCHAR(255) NOT NULL,
    -- Calculation rules: 'COURT_DAYS' (exclude weekends & holidays) vs 'CALENDAR_DAYS' (extend if ends on weekend/holiday)
    day_counting_rule VARCHAR(50) NOT NULL DEFAULT 'COURT_DAYS',
    exclude_day_of_service BOOLEAN NOT NULL DEFAULT TRUE,
    statutory_citations TEXT[] NOT NULL DEFAULT '{}',
    legal_aid_hotline VARCHAR(50),
    legal_aid_org_name VARCHAR(255),
    legal_aid_url VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. STATUTORY NOTICE TYPES TABLE
-- Governs notice types recognized under state/municipal property codes
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS statutory_notice_types (
    id VARCHAR(80) PRIMARY KEY, -- e.g., 'CA_3DAY_PAY_OR_QUIT'
    jurisdiction_id VARCHAR(50) NOT NULL REFERENCES jurisdictions(id) ON DELETE CASCADE,
    code_name VARCHAR(100) NOT NULL, -- e.g., '3-Day Notice to Pay Rent or Quit'
    legal_statute_citation VARCHAR(150) NOT NULL, -- e.g., 'Cal. Code of Civ. Proc. § 1161(2)'
    statutory_cure_days INT NOT NULL, -- e.g., 3
    allows_late_fees_in_demand BOOLEAN NOT NULL DEFAULT FALSE, -- In CA, bundling late fees is a FATAL DEFECT
    allows_utilities_in_demand BOOLEAN NOT NULL DEFAULT FALSE,
    requires_payment_hours BOOLEAN NOT NULL DEFAULT TRUE, -- Cal. CCP § 1161(2) requires landlord payment hours
    requires_payee_address BOOLEAN NOT NULL DEFAULT TRUE,
    requires_electronic_option_disclaimer BOOLEAN NOT NULL DEFAULT FALSE,
    requires_rent_stabilization_disclosure BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. MANDATORY STATUTORY WARNING CLAUSES
-- Disclosures and warnings required by law on the notice face
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mandatory_statutory_clauses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    statutory_notice_type_id VARCHAR(80) NOT NULL REFERENCES statutory_notice_types(id) ON DELETE CASCADE,
    clause_category VARCHAR(50) NOT NULL, -- 'FAIR_HOUSING', 'LEGAL_AID_DISCLOSURE', 'COVID_TENANT_RELIEF', 'PAYMENT_HOURS', 'CERTIFICATE_OF_SERVICE'
    mandatory_keywords TEXT[] NOT NULL,
    required_exact_phrase TEXT,
    statute_reference VARCHAR(150) NOT NULL,
    fatal_if_missing BOOLEAN NOT NULL DEFAULT TRUE,
    defect_explanation TEXT NOT NULL,
    cure_recommendation TEXT NOT NULL
);

-- ----------------------------------------------------------------------------
-- 4. COURT HOLIDAYS TABLE
-- Official judicial holidays where courts are closed and notice periods are tolled
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS court_holidays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jurisdiction_id VARCHAR(50) NOT NULL REFERENCES jurisdictions(id) ON DELETE CASCADE,
    holiday_date DATE NOT NULL,
    holiday_name VARCHAR(150) NOT NULL,
    is_judicial_closure BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (jurisdiction_id, holiday_date)
);

-- ----------------------------------------------------------------------------
-- 5. TRIAGE SESSIONS & AUDIT LOGS TABLE
-- Records incoming tenant notices, extracted metadata, and deterministic rulings
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS triage_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_ip_hash VARCHAR(64),
    jurisdiction_id VARCHAR(50) REFERENCES jurisdictions(id),
    notice_type_detected VARCHAR(100),
    service_date DATE,
    demanded_amount NUMERIC(10, 2),
    base_rent_amount NUMERIC(10, 2),
    improper_fees_detected NUMERIC(10, 2) DEFAULT 0.00,
    has_fatal_defects BOOLEAN NOT NULL DEFAULT FALSE,
    calculated_deadline_date TIMESTAMPTZ NOT NULL,
    is_expired BOOLEAN NOT NULL DEFAULT FALSE,
    raw_extraction_payload JSONB NOT NULL,
    deterministic_result_payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for rapid lookup
CREATE INDEX IF NOT EXISTS idx_holidays_jurisdiction_date ON court_holidays (jurisdiction_id, holiday_date);
CREATE INDEX IF NOT EXISTS idx_notice_types_jurisdiction ON statutory_notice_types (jurisdiction_id);
CREATE INDEX IF NOT EXISTS idx_triage_sessions_created ON triage_sessions (created_at DESC);

-- ============================================================================
-- SEED DATA: JURISDICTIONS & STATUTORY RULES
-- ============================================================================

INSERT INTO jurisdictions (id, name, state_code, county, municipality, court_name, day_counting_rule, exclude_day_of_service, statutory_citations, legal_aid_hotline, legal_aid_org_name, legal_aid_url)
VALUES 
(
    'US-CA',
    'California (Statewide)',
    'CA',
    NULL,
    NULL,
    'California Superior Court',
    'COURT_DAYS',
    TRUE,
    ARRAY['Cal. Code of Civ. Proc. § 1161(2)', 'Cal. Code of Civ. Proc. § 12', 'Cal. Civ. Code § 1946.2 (AB 1482)'],
    '1-888-804-3536',
    'Legal Aid Association of California & Eviction Defense Collaborative',
    'https://www.lawhelpca.org'
),
(
    'US-NY',
    'New York (Statewide)',
    'NY',
    NULL,
    NULL,
    'New York City Housing Court / District Court',
    'CALENDAR_DAYS',
    TRUE,
    ARRAY['N.Y. Real Prop. Acts. Law § 711(2)', 'N.Y. Real Prop. Law § 235-e', 'Housing Stability and Tenant Protection Act of 2019'],
    '1-212-962-4795',
    'Legal Aid Society Housing Helpline (NYC / NYS)',
    'https://legalaidnyc.org'
),
(
    'US-IL-COOK',
    'Illinois (Cook County / Chicago)',
    'IL',
    'Cook',
    'Chicago',
    'Circuit Court of Cook County',
    'COURT_DAYS',
    TRUE,
    ARRAY['735 ILCS 5/9-209', 'Chicago Municipal Code Title 5 Ch. 12 (RLTO)', 'Cook County RTLO § 42-805'],
    '1-312-341-1070',
    'Legal Aid Chicago / Metropolitan Tenants Organization',
    'https://www.legalaidchicago.org'
)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Seed Notice Types
INSERT INTO statutory_notice_types 
(id, jurisdiction_id, code_name, legal_statute_citation, statutory_cure_days, allows_late_fees_in_demand, allows_utilities_in_demand, requires_payment_hours, requires_payee_address)
VALUES 
(
    'CA_3DAY_PAY_OR_QUIT',
    'US-CA',
    '3-Day Notice to Pay Rent or Quit',
    'Cal. Code of Civ. Proc. § 1161(2)',
    3,
    FALSE, -- STRICT PROHIBITION: late fees cannot be claimed in pay-or-quit notice
    FALSE,
    TRUE,  -- Must state business hours (between 8:00 AM - 5:00 PM) when rent can be paid
    TRUE
),
(
    'NY_14DAY_RENT_DEMAND',
    'US-NY',
    '14-Day Written Demand for Rent',
    'N.Y. Real Prop. Acts. Law § 711(2)',
    14,
    FALSE, -- RPAPL § 702 strictly defines rent to exclude late fees, legal fees, or non-rent charges
    FALSE,
    TRUE,
    TRUE
),
(
    'IL_5DAY_NOTICE',
    'US-IL-COOK',
    '5-Day Notice of Termination for Nonpayment',
    '735 ILCS 5/9-209',
    5,
    FALSE,
    FALSE,
    TRUE,
    TRUE
)
ON CONFLICT (id) DO NOTHING;

-- Seed Mandatory Warning Clauses
INSERT INTO mandatory_statutory_clauses
(statutory_notice_type_id, clause_category, mandatory_keywords, required_exact_phrase, statute_reference, fatal_if_missing, defect_explanation, cure_recommendation)
VALUES 
(
    'CA_3DAY_PAY_OR_QUIT',
    'PAYMENT_HOURS',
    ARRAY['hours', 'a.m.', 'p.m.', 'monday', 'friday'],
    NULL,
    'Cal. Code of Civ. Proc. § 1161(2)',
    TRUE,
    'Under California law, a 3-Day Notice to Pay or Quit must specify the exact days and hours of the week the tenant may tender payment in person (unless an established electronic payment method or bank account transfer info is provided). Omission of hours renders the notice fatally defective.',
    'Landlord must re-issue notice providing clear payment hours and verifiable physical or electronic tendering options.'
),
(
    'CA_3DAY_PAY_OR_QUIT',
    'NO_LATE_FEES',
    ARRAY['late fee', 'penalty', 'interest', 'administrative fee'],
    NULL,
    'Cal. Code of Civ. Proc. § 1161(2) & Levitz Furniture Co. v. Wingtip (2001)',
    TRUE,
    'Demanding non-rent charges (late charges, utilities, bounced check fees) on a 3-Day Notice to Pay Rent or Quit is a fatal defect in California. The notice demands an unauthorized sum, which invalidates any subsequent unlawful detainer filing.',
    'Tenant may assert affirmative defense of defective notice and excessive rent demand.'
),
(
    'NY_14DAY_RENT_DEMAND',
    'RENT_ONLY_RESTRICTION',
    ARRAY['late fee', 'late charge', 'legal fee', 'court cost'],
    NULL,
    'N.Y. RPAPL § 702 & § 711(2)',
    TRUE,
    'Under New York RPAPL § 702, in a summary proceeding for nonpayment, rent is strictly defined to exclude late fees, attorney fees, utilities, or penalties. Demanding these fees invalidates the 14-day demand.',
    'Motion to dismiss nonpayment petition for defective statutory rent demand.'
)
ON CONFLICT DO NOTHING;

-- Seed Court Holidays (2025 - 2027 Federal & California/NY Court Holidays)
INSERT INTO court_holidays (jurisdiction_id, holiday_date, holiday_name)
VALUES 
('US-CA', '2026-01-01', 'New Year''s Day'),
('US-CA', '2026-01-19', 'Martin Luther King Jr. Day'),
('US-CA', '2026-02-16', 'Presidents'' Day (Washington''s Birthday)'),
('US-CA', '2026-03-31', 'César Chávez Day (California Judicial Branch Holiday)'),
('US-CA', '2026-05-25', 'Memorial Day'),
('US-CA', '2026-06-19', 'Juneteenth National Independence Day'),
('US-CA', '2026-07-03', 'Independence Day (Observed)'),
('US-CA', '2026-07-04', 'Independence Day'),
('US-CA', '2026-09-07', 'Labor Day'),
('US-CA', '2026-10-12', 'Indigenous Peoples'' Day / Columbus Day'),
('US-CA', '2026-11-11', 'Veterans Day'),
('US-CA', '2026-11-26', 'Thanksgiving Day'),
('US-CA', '2026-11-27', 'Day After Thanksgiving (California Court Closure)'),
('US-CA', '2026-12-25', 'Christmas Day'),

('US-NY', '2026-01-01', 'New Year''s Day'),
('US-NY', '2026-01-19', 'Martin Luther King Jr. Day'),
('US-NY', '2026-02-16', 'Presidents'' Day'),
('US-NY', '2026-05-25', 'Memorial Day'),
('US-NY', '2026-06-19', 'Juneteenth'),
('US-NY', '2026-07-03', 'Independence Day (Observed)'),
('US-NY', '2026-09-07', 'Labor Day'),
('US-NY', '2026-10-12', 'Columbus Day'),
('US-NY', '2026-11-11', 'Veterans Day'),
('US-NY', '2026-11-26', 'Thanksgiving Day'),
('US-NY', '2026-12-25', 'Christmas Day'),

('US-IL-COOK', '2026-01-01', 'New Year''s Day'),
('US-IL-COOK', '2026-01-19', 'Martin Luther King Jr. Day'),
('US-IL-COOK', '2026-02-16', 'Presidents'' Day'),
('US-IL-COOK', '2026-03-02', 'Casimir Pulaski Day (Cook County Judicial Holiday)'),
('US-IL-COOK', '2026-05-25', 'Memorial Day'),
('US-IL-COOK', '2026-06-19', 'Juneteenth'),
('US-IL-COOK', '2026-07-03', 'Independence Day (Observed)'),
('US-IL-COOK', '2026-09-07', 'Labor Day'),
('US-IL-COOK', '2026-10-12', 'Columbus Day'),
('US-IL-COOK', '2026-11-11', 'Veterans Day'),
('US-IL-COOK', '2026-11-26', 'Thanksgiving Day'),
('US-IL-COOK', '2026-12-25', 'Christmas Day')
ON CONFLICT (jurisdiction_id, holiday_date) DO NOTHING;

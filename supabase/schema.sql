-- Project TenantPlus — Unified Supabase PostgreSQL Schema
-- Module: supabase/schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. JURISDICTION RULES TABLE
CREATE TABLE IF NOT EXISTS jurisdiction_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    state VARCHAR(2) NOT NULL,                           -- e.g., 'CA', 'NY', 'IL'
    notice_type VARCHAR(150) NOT NULL,                   -- e.g., '3-Day Notice to Pay or Quit'
    days_to_respond INT NOT NULL,                        -- Statutory cure period in days
    exclude_weekends BOOLEAN NOT NULL DEFAULT TRUE,      -- Skip Saturdays and Sundays
    exclude_holidays BOOLEAN NOT NULL DEFAULT TRUE,      -- Skip court holidays
    mandatory_warnings JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of mandatory warning strings
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_state_notice UNIQUE (state, notice_type)
);

-- 2. COURT HOLIDAYS TABLE
CREATE TABLE IF NOT EXISTS court_holidays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    state VARCHAR(2) NOT NULL,                           -- e.g., 'CA', 'NY', 'IL'
    holiday_date DATE NOT NULL,
    holiday_name VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_state_holiday UNIQUE (state, holiday_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_jurisdiction_rules_state_notice 
ON jurisdiction_rules (state, notice_type);

CREATE INDEX IF NOT EXISTS idx_court_holidays_state_date 
ON court_holidays (state, holiday_date);

-- SEED DATA: JURISDICTION RULES
INSERT INTO jurisdiction_rules (state, notice_type, days_to_respond, exclude_weekends, exclude_holidays, mandatory_warnings)
VALUES 
(
    'CA',
    '3-Day Notice to Pay or Quit',
    3,
    TRUE,
    TRUE,
    '["California Code of Civil Procedure Section 1161", "Within three (3) days", "hours"]'::jsonb
),
(
    'NY',
    '14-Day Notice to Quit',
    14,
    FALSE,
    TRUE,
    '["RPAPL 711", "fourteen (14) days", "Legal Aid"]'::jsonb
),
(
    'IL',
    '5-Day Notice for Nonpayment',
    5,
    TRUE,
    TRUE,
    '["735 ILCS 5/9-209", "within five (5) days"]'::jsonb
)
ON CONFLICT (state, notice_type) DO UPDATE SET
    days_to_respond = EXCLUDED.days_to_respond,
    exclude_weekends = EXCLUDED.exclude_weekends,
    exclude_holidays = EXCLUDED.exclude_holidays,
    mandatory_warnings = EXCLUDED.mandatory_warnings;

-- SEED DATA: COURT HOLIDAYS (2026 - 2027 Judicial Holidays)
INSERT INTO court_holidays (state, holiday_date, holiday_name)
VALUES
    ('NY', '2026-07-04', 'Independence Day'),
    ('NY', '2026-09-07', 'Labor Day'),
    ('NY', '2026-11-26', 'Thanksgiving Day'),
    ('CA', '2026-07-04', 'Independence Day'),
    ('CA', '2026-09-07', 'Labor Day'),
    ('CA', '2026-11-26', 'Thanksgiving Day'),
    ('IL', '2026-07-04', 'Independence Day'),
    ('IL', '2026-09-07', 'Labor Day')
ON CONFLICT (state, holiday_date) DO NOTHING;

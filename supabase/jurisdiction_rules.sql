-- ============================================================================
-- PROJECT TENANTPLUS — SUPABASE POSTGRESQL SCHEMA (PHASE 1)
-- Table: jurisdiction_rules
-- Stores statutory timeline constraints, weekend/holiday counting rules,
-- and mandatory warning disclosures per jurisdiction and notice type.
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create jurisdiction_rules table
CREATE TABLE IF NOT EXISTS jurisdiction_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    state VARCHAR(2) NOT NULL, -- e.g., 'CA', 'NY', 'IL'
    notice_type VARCHAR(150) NOT NULL, -- e.g., '3-Day Notice to Pay or Quit'
    days_to_respond INT NOT NULL, -- Statutory cure/answer period
    exclude_weekends BOOLEAN NOT NULL DEFAULT TRUE, -- Cal. CCP § 1161(2) excludes Saturdays and Sundays
    exclude_holidays BOOLEAN NOT NULL DEFAULT TRUE, -- Judicial court holidays do not count
    mandatory_warnings JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of required statutory warning phrases
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by state and notice type
CREATE INDEX IF NOT EXISTS idx_jurisdiction_rules_state_notice 
ON jurisdiction_rules (state, notice_type);

-- ----------------------------------------------------------------------------
-- SEED DATA: Pre-populate statutory jurisdiction rules
-- ----------------------------------------------------------------------------
INSERT INTO jurisdiction_rules (id, state, notice_type, days_to_respond, exclude_weekends, exclude_holidays, mandatory_warnings)
VALUES 
(
    uuid_generate_v4(),
    'CA',
    '3-Day Notice to Pay or Quit',
    3,
    TRUE,
    TRUE,
    '[
        "California Code of Civil Procedure Section 1161",
        "Within three (3) days",
        "pay the total sum or quit",
        "hours",
        "Right to legal assistance"
    ]'::jsonb
),
(
    uuid_generate_v4(),
    'NY',
    '14-Day Notice to Quit',
    14,
    FALSE,
    TRUE,
    '[
        "Real Property Actions and Proceedings Law",
        "RPAPL 711",
        "fourteen (14) days",
        "Legal Aid Society"
    ]'::jsonb
),
(
    uuid_generate_v4(),
    'IL',
    '5-Day Notice for Nonpayment',
    5,
    TRUE,
    TRUE,
    '[
        "735 ILCS 5/9-209",
        "within five (5) days",
        "termination of tenancy",
        "Cook County Residential Tenant Landlord Ordinance"
    ]'::jsonb
)
ON CONFLICT DO NOTHING;

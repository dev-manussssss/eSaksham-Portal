-- SAKSHAM Database DDL Initialization Script (Reference Schema)
-- Database Engine: PostgreSQL 15+ with PostGIS Extension

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_code VARCHAR(64) UNIQUE NOT NULL,
    mp_name VARCHAR(255) NOT NULL,
    constituency_code VARCHAR(64) NOT NULL,
    district_id VARCHAR(64) NOT NULL,
    work_category VARCHAR(128) NOT NULL,
    sanction_date DATE NOT NULL,
    allocated_amount NUMERIC(15, 2) NOT NULL,
    disbursed_amount NUMERIC(15, 2) DEFAULT 0.00,
    physical_progress_percent NUMERIC(5, 2) DEFAULT 0.00,
    financial_progress_percent NUMERIC(5, 2) DEFAULT 0.00,
    status VARCHAR(32) NOT NULL DEFAULT 'RECOMMENDED',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Vendors Table
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gstin VARCHAR(15) UNIQUE,
    pan VARCHAR(10) UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    registered_address TEXT,
    bank_account_hash VARCHAR(64),
    director_dins TEXT[],
    longitudinal_risk_score NUMERIC(5, 2) DEFAULT 0.00,
    is_blacklisted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Risk Evaluations (Versioned & Cached)
CREATE TABLE IF NOT EXISTS risk_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(32) NOT NULL,
    entity_id UUID NOT NULL,
    evaluation_version INT NOT NULL DEFAULT 1,
    composite_score NUMERIC(5, 2) NOT NULL,
    severity VARCHAR(16) NOT NULL,
    vendor_score NUMERIC(5, 2) NOT NULL,
    tender_score NUMERIC(5, 2) NOT NULL,
    project_score NUMERIC(5, 2) NOT NULL,
    inspection_score NUMERIC(5, 2) NOT NULL,
    payment_score NUMERIC(5, 2) NOT NULL,
    document_score NUMERIC(5, 2) NOT NULL,
    is_latest BOOLEAN DEFAULT TRUE,
    computed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Risk Signals (Explainable Indicators)
CREATE TABLE IF NOT EXISTS risk_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluation_id UUID NOT NULL REFERENCES risk_evaluations(id) ON DELETE CASCADE,
    dimension VARCHAR(32) NOT NULL,
    signal_type VARCHAR(64) NOT NULL,
    weight NUMERIC(4, 2) NOT NULL,
    confidence_score NUMERIC(4, 2) NOT NULL,
    explanation_summary TEXT NOT NULL,
    evidence_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Investigations Table
CREATE TABLE IF NOT EXISTS investigations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_number VARCHAR(64) UNIQUE NOT NULL,
    project_id UUID NOT NULL REFERENCES projects(id),
    case_status VARCHAR(32) NOT NULL DEFAULT 'OPEN',
    assigned_officer_id VARCHAR(64),
    officer_notes TEXT,
    evidence_snapshot JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Fast Lookups
CREATE INDEX IF NOT EXISTS idx_projects_district ON projects(district_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_risk_eval_entity ON risk_evaluations(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_investigations_project ON investigations(project_id);

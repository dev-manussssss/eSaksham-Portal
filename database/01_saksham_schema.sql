-- SAKSHAM eSaksham SIH26102 Authoritative Schema v2.0
-- Database Engine: PostgreSQL 15+ with uuid-ossp

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Roles Definition Table
CREATE TABLE IF NOT EXISTS roles (
    role_key VARCHAR(64) PRIMARY KEY,
    title VARCHAR(128) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Profiles / Users (Server-side identity; no client role manipulation)
CREATE TABLE IF NOT EXISTS profiles (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    designation VARCHAR(255),
    role_key VARCHAR(64) NOT NULL REFERENCES roles(role_key),
    organization_name VARCHAR(255) NOT NULL,
    state VARCHAR(128) NOT NULL,
    district VARCHAR(128) NOT NULL,
    constituency VARCHAR(128),
    vendor_id VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Vendors
CREATE TABLE IF NOT EXISTS vendors (
    id VARCHAR(64) PRIMARY KEY, -- e.g. VND-001
    company_name VARCHAR(255) NOT NULL,
    gstin VARCHAR(15),
    pan VARCHAR(10),
    state VARCHAR(128),
    district VARCHAR(128),
    sector VARCHAR(128),
    longitudinal_risk_score NUMERIC(5, 2) DEFAULT 0.00,
    risk_level VARCHAR(16) DEFAULT 'LOW',
    is_blacklisted BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tenders
CREATE TABLE IF NOT EXISTS tenders (
    id VARCHAR(64) PRIMARY KEY, -- e.g. TND-001
    reference_no VARCHAR(128) NOT NULL,
    title VARCHAR(255) NOT NULL,
    scheme VARCHAR(64) DEFAULT 'MPLADS',
    estimated_budget NUMERIC(15, 2) NOT NULL,
    status VARCHAR(32) DEFAULT 'AWARDED', -- DRAFT, PUBLISHED, EVALUATION, AWARDED, CANCELLED
    awarded_vendor_id VARCHAR(64) REFERENCES vendors(id),
    state VARCHAR(128),
    district VARCHAR(128),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Bids (e-Procurement Domain)
CREATE TABLE IF NOT EXISTS bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tender_id VARCHAR(64) NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
    bid_reference VARCHAR(128) NOT NULL,
    submission_date TIMESTAMPTZ NOT NULL,
    technical_score NUMERIC(5, 2),
    financial_quote NUMERIC(15, 2) NOT NULL,
    status VARCHAR(32) DEFAULT 'SUBMITTED', -- SUBMITTED, QUALIFIED, DISQUALIFIED, SELECTED
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Bid Participants (Bid to Vendor association, consortium shares)
CREATE TABLE IF NOT EXISTS bid_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bid_id UUID NOT NULL REFERENCES bids(id) ON DELETE CASCADE,
    vendor_id VARCHAR(64) NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    is_lead_bidder BOOLEAN DEFAULT TRUE,
    consortium_share_percent NUMERIC(5, 2) DEFAULT 100.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Projects (with mandatory MPLADS 12-sector classification)
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(64) PRIMARY KEY, -- e.g. PRJ-001
    project_code VARCHAR(128) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    sector VARCHAR(128) NOT NULL, -- Mandatory canonical 12 sectors
    category VARCHAR(128),        -- Legacy category alias preserved
    scheme VARCHAR(64) DEFAULT 'MPLADS',
    mp_name VARCHAR(255) NOT NULL,
    constituency VARCHAR(128) NOT NULL,
    district VARCHAR(128) NOT NULL,
    state VARCHAR(128) NOT NULL,
    implementing_agency VARCHAR(255) DEFAULT 'District Implementing Agency',
    vendor_id VARCHAR(64) REFERENCES vendors(id),
    tender_id VARCHAR(64) REFERENCES tenders(id),
    sanctioned_amount NUMERIC(15, 2) NOT NULL,
    released_amount NUMERIC(15, 2) DEFAULT 0.00,
    expenditure_amount NUMERIC(15, 2) DEFAULT 0.00,
    physical_progress_percent NUMERIC(5, 2) DEFAULT 0.00,
    financial_progress_percent NUMERIC(5, 2) DEFAULT 0.00,
    status VARCHAR(64) NOT NULL DEFAULT 'UNDER_IMPLEMENTATION',
    risk_level VARCHAR(16) NOT NULL DEFAULT 'LOW',
    risk_score INT DEFAULT 10,
    inspection_note TEXT,
    start_date DATE,
    target_completion_date DATE,
    last_inspection_date DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. Bill of Quantities (BOQ) Items
CREATE TABLE IF NOT EXISTS boq_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    item_no VARCHAR(32) NOT NULL,
    description TEXT NOT NULL,
    unit VARCHAR(32) NOT NULL,
    sanctioned_qty NUMERIC(12, 2) NOT NULL,
    rate NUMERIC(15, 2) NOT NULL,
    total_amount NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. Measurements (Measurement Book entries)
CREATE TABLE IF NOT EXISTS measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    mb_number VARCHAR(64) NOT NULL,
    item_no VARCHAR(32) NOT NULL,
    description TEXT NOT NULL,
    recorded_qty NUMERIC(12, 2) NOT NULL,
    observed_qty NUMERIC(12, 2) NOT NULL,
    unit VARCHAR(32) NOT NULL,
    entry_date DATE NOT NULL,
    verification_status VARCHAR(32) DEFAULT 'RECORDED',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 10. Inspections (Site milestone and physical inspections)
CREATE TABLE IF NOT EXISTS inspections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    inspector_id VARCHAR(64) NOT NULL,
    inspector_name VARCHAR(255) NOT NULL,
    inspection_date DATE NOT NULL,
    milestone_stage VARCHAR(64) NOT NULL,
    physical_progress_observed NUMERIC(5, 2) NOT NULL,
    quality_assessment VARCHAR(32) NOT NULL DEFAULT 'SATISFACTORY', -- SATISFACTORY, DEFICIENCIES_NOTED, UNACCEPTABLE
    remarks TEXT,
    cadastral_boundary_verified BOOLEAN DEFAULT TRUE,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 11. Evidence Geotags (Cadastral & Site photo evidence)
CREATE TABLE IF NOT EXISTS evidence_geotags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    captured_at TIMESTAMPTZ NOT NULL,
    device_fingerprint VARCHAR(255),
    tampering_detected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 12. Bills / Invoices
CREATE TABLE IF NOT EXISTS bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    bill_no VARCHAR(64) NOT NULL,
    bill_date DATE NOT NULL,
    item_no VARCHAR(32) NOT NULL,
    executed_qty NUMERIC(12, 2) NOT NULL,
    rate NUMERIC(15, 2) NOT NULL,
    billed_amount NUMERIC(15, 2) NOT NULL,
    status VARCHAR(32) DEFAULT 'SUBMITTED',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 13. Project Documents
CREATE TABLE IF NOT EXISTS project_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    uploaded_by VARCHAR(64) NOT NULL,
    uploader_role VARCHAR(64) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(64) NOT NULL,
    storage_path TEXT NOT NULL,
    document_category VARCHAR(64) NOT NULL,
    upload_status VARCHAR(32) NOT NULL DEFAULT 'UPLOADED',
    file_size INT,
    checksum VARCHAR(64),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 14. Project Status History
CREATE TABLE IF NOT EXISTS project_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    previous_status VARCHAR(64) NOT NULL,
    new_status VARCHAR(64) NOT NULL,
    changed_by VARCHAR(64) NOT NULL,
    changed_by_role VARCHAR(64) NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 15. AI Analysis Runs
CREATE TABLE IF NOT EXISTS ai_analysis_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    document_id UUID REFERENCES project_documents(id) ON DELETE SET NULL,
    model_name VARCHAR(64) NOT NULL,
    execution_status VARCHAR(32) NOT NULL, -- COMPLETED, DEGRADED_RULE_BASED, FAILED
    extracted_data JSONB,
    normalized_data JSONB,
    rules_triggered JSONB,
    llm_assessment JSONB,
    duration_ms INT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 16. AI Flags (Explainable findings; non-autonomous)
CREATE TABLE IF NOT EXISTS ai_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    document_id UUID REFERENCES project_documents(id) ON DELETE SET NULL,
    analysis_run_id UUID REFERENCES ai_analysis_runs(id) ON DELETE SET NULL,
    flag_code VARCHAR(64) NOT NULL,
    severity VARCHAR(16) NOT NULL, -- LOW, MEDIUM, HIGH, CRITICAL
    title VARCHAR(255) NOT NULL,
    explanation TEXT NOT NULL,
    recommended_action VARCHAR(64) NOT NULL,
    primary_evidence JSONB,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, UNDER_REVIEW, RESOLVED, DISMISSED
    resolved_by VARCHAR(64),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 17. Risk Scores
CREATE TABLE IF NOT EXISTS risk_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    vendor_score NUMERIC(5, 2) DEFAULT 0,
    tender_score NUMERIC(5, 2) DEFAULT 0,
    project_score NUMERIC(5, 2) DEFAULT 0,
    inspection_score NUMERIC(5, 2) DEFAULT 0,
    composite_score NUMERIC(5, 2) DEFAULT 0,
    severity VARCHAR(16) DEFAULT 'LOW',
    is_latest BOOLEAN DEFAULT TRUE,
    calculated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 18. Alerts (Cross-cutting risk signals)
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
    vendor_id VARCHAR(64) REFERENCES vendors(id) ON DELETE SET NULL,
    tender_id VARCHAR(64) REFERENCES tenders(id) ON DELETE SET NULL,
    severity VARCHAR(16) NOT NULL, -- LOW, MEDIUM, HIGH, CRITICAL
    category VARCHAR(64) NOT NULL, -- COLLUSION, FINANCIAL, TIMELINE, QUALITY, DOCUMENT
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'ACTIVE', -- ACTIVE, UNDER_REVIEW, RESOLVED, DISMISSED
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 19. Human Actions (Authoritative decisions taken by statutory officers)
CREATE TABLE IF NOT EXISTS human_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    actor_id VARCHAR(64) NOT NULL,
    actor_role VARCHAR(64) NOT NULL,
    action_type VARCHAR(64) NOT NULL,
    decision VARCHAR(64) NOT NULL,
    notes TEXT,
    related_flag_id UUID REFERENCES ai_flags(id) ON DELETE SET NULL,
    related_document_id UUID REFERENCES project_documents(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 20. Audit Logs (Append-only governance record; AUD-022 fixed with nullable project_id & entity references)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE SET NULL, -- NULLABLE for vendor/tender events
    entity_type VARCHAR(64) DEFAULT 'PROJECT', -- PROJECT, VENDOR, TENDER, BID, DOCUMENT, AUTH
    entity_id VARCHAR(64),
    actor_id VARCHAR(64) NOT NULL,
    role VARCHAR(64) NOT NULL,
    action VARCHAR(64) NOT NULL,
    previous_status VARCHAR(64),
    new_status VARCHAR(64),
    comment TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_risk ON projects(risk_level);
CREATE INDEX IF NOT EXISTS idx_projects_sector ON projects(sector);
CREATE INDEX IF NOT EXISTS idx_projects_vendor ON projects(vendor_id);
CREATE INDEX IF NOT EXISTS idx_bids_tender ON bids(tender_id);
CREATE INDEX IF NOT EXISTS idx_bid_parts_bid ON bid_participants(bid_id);
CREATE INDEX IF NOT EXISTS idx_bid_parts_vendor ON bid_participants(vendor_id);
CREATE INDEX IF NOT EXISTS idx_inspections_project ON inspections(project_id);
CREATE INDEX IF NOT EXISTS idx_evidence_inspection ON evidence_geotags(inspection_id);
CREATE INDEX IF NOT EXISTS idx_alerts_project ON alerts(project_id);
CREATE INDEX IF NOT EXISTS idx_alerts_vendor ON alerts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_ai_flags_project ON ai_flags(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_flags_status ON ai_flags(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_project ON audit_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_human_actions_project ON human_actions(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_project ON project_documents(project_id);

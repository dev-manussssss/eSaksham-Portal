-- SAKSHAM Migration 03: Procurement & Inspections Domain Extension
-- Adds bids, bid participants, inspections, geotagged evidence, and alerts

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Bids Table
CREATE TABLE IF NOT EXISTS bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tender_id VARCHAR(64) NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
    bid_reference VARCHAR(128) NOT NULL,
    submission_date TIMESTAMPTZ NOT NULL,
    technical_score NUMERIC(5, 2),
    financial_quote NUMERIC(15, 2) NOT NULL,
    status VARCHAR(32) DEFAULT 'SUBMITTED',
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bid Participants
CREATE TABLE IF NOT EXISTS bid_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bid_id UUID NOT NULL REFERENCES bids(id) ON DELETE CASCADE,
    vendor_id VARCHAR(64) NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    is_lead_bidder BOOLEAN DEFAULT TRUE,
    consortium_share_percent NUMERIC(5, 2) DEFAULT 100.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Inspections
CREATE TABLE IF NOT EXISTS inspections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    inspector_id VARCHAR(64) NOT NULL,
    inspector_name VARCHAR(255) NOT NULL,
    inspection_date DATE NOT NULL,
    milestone_stage VARCHAR(64) NOT NULL,
    physical_progress_observed NUMERIC(5, 2) NOT NULL,
    quality_assessment VARCHAR(32) NOT NULL DEFAULT 'SATISFACTORY',
    remarks TEXT,
    cadastral_boundary_verified BOOLEAN DEFAULT TRUE,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Evidence Geotags
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

-- 5. Alerts
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
    vendor_id VARCHAR(64) REFERENCES vendors(id) ON DELETE SET NULL,
    tender_id VARCHAR(64) REFERENCES tenders(id) ON DELETE SET NULL,
    severity VARCHAR(16) NOT NULL,
    category VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Audit Logs Fix (AUD-022)
ALTER TABLE audit_logs ALTER COLUMN project_id DROP NOT NULL;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS entity_type VARCHAR(64) DEFAULT 'PROJECT';
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS entity_id VARCHAR(64);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS metadata JSONB;

-- 7. Projects Sector Fix
ALTER TABLE projects ADD COLUMN IF NOT EXISTS sector VARCHAR(128) NOT NULL DEFAULT 'Public & Community Buildings';

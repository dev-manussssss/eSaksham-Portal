-- SAKSHAM Migration 02 — Vendor Risk Scores & Vendor Lifecycle Columns
-- Apply to Supabase SQL editor AFTER 01_saksham_schema.sql

-- 1. Add lifecycle columns to vendors table
ALTER TABLE vendors
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS deactivated_by VARCHAR(64),
  ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deactivation_reason TEXT;

-- 2. Vendor Risk Scores table (vendor-scoped, not project-scoped)
-- Stores versioned, explainable 4-dimension risk assessments per vendor
CREATE TABLE IF NOT EXISTS vendor_risk_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id VARCHAR(64) NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

    -- 4 weighted dimensions (0–100 each)
    historical_performance_score NUMERIC(5, 2) NOT NULL DEFAULT 0,
    collusion_network_score      NUMERIC(5, 2) NOT NULL DEFAULT 0,
    financial_anomaly_score      NUMERIC(5, 2) NOT NULL DEFAULT 0,
    document_integrity_score     NUMERIC(5, 2) NOT NULL DEFAULT 0,

    -- Composite weighted result: 0.35*A + 0.25*B + 0.25*C + 0.15*D
    composite_score NUMERIC(5, 2) NOT NULL DEFAULT 0,

    -- Threshold: LOW 0-39 | MODERATE 40-69 | HIGH 70-84 | CRITICAL 85-100
    severity VARCHAR(16) NOT NULL DEFAULT 'LOW',

    -- Blacklist override flag (if true, composite forced to 100 / CRITICAL)
    blacklist_override BOOLEAN NOT NULL DEFAULT FALSE,

    -- Explainability: array of signal objects
    -- Each: { dimension, signal_code, label, value, points, source_field, status }
    -- status: ACTIVE | ANALYSIS_PENDING | SERVICE_UNAVAILABLE
    signals JSONB NOT NULL DEFAULT '[]',

    -- Versioning: only one is_latest=true per vendor at any time
    is_latest BOOLEAN NOT NULL DEFAULT TRUE,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast latest-score lookup per vendor
CREATE INDEX IF NOT EXISTS idx_vendor_risk_vendor ON vendor_risk_scores(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_risk_latest ON vendor_risk_scores(vendor_id, is_latest);
CREATE INDEX IF NOT EXISTS idx_vendors_active ON vendors(is_active);

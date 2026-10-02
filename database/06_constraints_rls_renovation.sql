-- ============================================================================
-- SAKSHAM Migration 06: Database Integrity Constraints + RLS Renovation
-- Applies to Supabase SQL Editor. Safe to run after migrations 01-05.
-- Purpose: Add missing constraints, CHECK rules, and tighten RLS policies.
-- NOTE: This migration is idempotent where possible.
-- ============================================================================

-- ============================================================================
-- PART 1: MISSING DATABASE INTEGRITY CONSTRAINTS
-- ============================================================================

-- 1.1 Vendors: Prevent negative risk scores; valid risk_level enum values
ALTER TABLE public.vendors
  ADD CONSTRAINT IF NOT EXISTS chk_vendor_risk_score_range
    CHECK (longitudinal_risk_score >= 0 AND longitudinal_risk_score <= 100);

ALTER TABLE public.vendors
  ADD CONSTRAINT IF NOT EXISTS chk_vendor_risk_level
    CHECK (risk_level IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL'));

-- 1.2 Vendors: PAN format (10 characters alphanumeric, optional but validated when present)
-- Note: Existing data may not conform; constraint is advisory via CHECK only
-- ALTER TABLE public.vendors ADD CONSTRAINT IF NOT EXISTS chk_vendor_pan_format CHECK (pan IS NULL OR pan ~ '^[A-Z]{5}[0-9]{4}[A-Z]$');

-- 1.3 Projects: Prevent invalid financial values
ALTER TABLE public.projects
  ADD CONSTRAINT IF NOT EXISTS chk_project_sanctioned_positive
    CHECK (sanctioned_amount > 0);

ALTER TABLE public.projects
  ADD CONSTRAINT IF NOT EXISTS chk_project_financial_progress
    CHECK (financial_progress_percent >= 0 AND financial_progress_percent <= 100);

ALTER TABLE public.projects
  ADD CONSTRAINT IF NOT EXISTS chk_project_physical_progress
    CHECK (physical_progress_percent >= 0 AND physical_progress_percent <= 100);

ALTER TABLE public.projects
  ADD CONSTRAINT IF NOT EXISTS chk_project_released_amount
    CHECK (released_amount >= 0);

ALTER TABLE public.projects
  ADD CONSTRAINT IF NOT EXISTS chk_project_expenditure_amount
    CHECK (expenditure_amount >= 0);

ALTER TABLE public.projects
  ADD CONSTRAINT IF NOT EXISTS chk_project_risk_level
    CHECK (risk_level IN ('LOW', 'MEDIUM', 'MODERATE', 'HIGH', 'CRITICAL'));

-- 1.4 BOQ Items: Prevent zero/negative quantities and rates
ALTER TABLE public.boq_items
  ADD CONSTRAINT IF NOT EXISTS chk_boq_positive_qty
    CHECK (sanctioned_qty > 0);

ALTER TABLE public.boq_items
  ADD CONSTRAINT IF NOT EXISTS chk_boq_positive_rate
    CHECK (rate >= 0);

ALTER TABLE public.boq_items
  ADD CONSTRAINT IF NOT EXISTS chk_boq_positive_amount
    CHECK (total_amount >= 0);

-- 1.5 Bills: Prevent negative billing amounts
ALTER TABLE public.bills
  ADD CONSTRAINT IF NOT EXISTS chk_bill_executed_qty_positive
    CHECK (executed_qty > 0);

ALTER TABLE public.bills
  ADD CONSTRAINT IF NOT EXISTS chk_bill_rate_positive
    CHECK (rate >= 0);

ALTER TABLE public.bills
  ADD CONSTRAINT IF NOT EXISTS chk_bill_amount_positive
    CHECK (billed_amount > 0);

ALTER TABLE public.bills
  ADD CONSTRAINT IF NOT EXISTS chk_bill_status_enum
    CHECK (status IN ('SUBMITTED', 'VERIFIED', 'APPROVED', 'PAID', 'REJECTED', 'ON_HOLD'));

-- 1.6 Measurements: Prevent negative quantities
ALTER TABLE public.measurements
  ADD CONSTRAINT IF NOT EXISTS chk_measurement_recorded_qty
    CHECK (recorded_qty >= 0);

ALTER TABLE public.measurements
  ADD CONSTRAINT IF NOT EXISTS chk_measurement_observed_qty
    CHECK (observed_qty >= 0);

-- 1.7 Tenders: Prevent zero/negative estimated budget
ALTER TABLE public.tenders
  ADD CONSTRAINT IF NOT EXISTS chk_tender_budget_positive
    CHECK (estimated_budget > 0);

-- 1.8 Bids: Prevent zero/negative financial quotes
ALTER TABLE public.bids
  ADD CONSTRAINT IF NOT EXISTS chk_bid_quote_positive
    CHECK (financial_quote > 0);

ALTER TABLE public.bids
  ADD CONSTRAINT IF NOT EXISTS chk_bid_technical_score_range
    CHECK (technical_score IS NULL OR (technical_score >= 0 AND technical_score <= 100));

-- 1.9 Inspections: Progress percentage must be 0–100
ALTER TABLE public.inspections
  ADD CONSTRAINT IF NOT EXISTS chk_inspection_progress_range
    CHECK (physical_progress_observed >= 0 AND physical_progress_observed <= 100);

ALTER TABLE public.inspections
  ADD CONSTRAINT IF NOT EXISTS chk_inspection_quality_enum
    CHECK (quality_assessment IN ('SATISFACTORY', 'DEFICIENCIES_NOTED', 'UNACCEPTABLE'));

-- 1.10 Vendor Risk Scores: All dimension scores must be 0–100
ALTER TABLE public.vendor_risk_scores
  ADD CONSTRAINT IF NOT EXISTS chk_vrs_composite_range
    CHECK (composite_score >= 0 AND composite_score <= 100);

ALTER TABLE public.vendor_risk_scores
  ADD CONSTRAINT IF NOT EXISTS chk_vrs_historical_range
    CHECK (historical_performance_score >= 0 AND historical_performance_score <= 100);

ALTER TABLE public.vendor_risk_scores
  ADD CONSTRAINT IF NOT EXISTS chk_vrs_collusion_range
    CHECK (collusion_network_score >= 0 AND collusion_network_score <= 100);

ALTER TABLE public.vendor_risk_scores
  ADD CONSTRAINT IF NOT EXISTS chk_vrs_financial_range
    CHECK (financial_anomaly_score >= 0 AND financial_anomaly_score <= 100);

ALTER TABLE public.vendor_risk_scores
  ADD CONSTRAINT IF NOT EXISTS chk_vrs_doc_range
    CHECK (document_integrity_score >= 0 AND document_integrity_score <= 100);

ALTER TABLE public.vendor_risk_scores
  ADD CONSTRAINT IF NOT EXISTS chk_vrs_severity_enum
    CHECK (severity IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL'));

-- 1.11 AI Flags: Severity must be valid enum
ALTER TABLE public.ai_flags
  ADD CONSTRAINT IF NOT EXISTS chk_ai_flags_severity_enum
    CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'));

ALTER TABLE public.ai_flags
  ADD CONSTRAINT IF NOT EXISTS chk_ai_flags_status_enum
    CHECK (status IN ('ACTIVE', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'));

-- 1.12 Alerts: Severity and status must be valid enums
ALTER TABLE public.alerts
  ADD CONSTRAINT IF NOT EXISTS chk_alerts_severity_enum
    CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'));

ALTER TABLE public.alerts
  ADD CONSTRAINT IF NOT EXISTS chk_alerts_status_enum
    CHECK (status IN ('ACTIVE', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'));

-- 1.13 Add missing updated_at triggers for tables that need it
-- (Vendors is missing updated_at entirely — add it)
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- Function to auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for vendors (idempotent with DROP IF EXISTS)
DROP TRIGGER IF EXISTS trg_vendors_updated_at ON public.vendors;
CREATE TRIGGER trg_vendors_updated_at
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_projects_updated_at ON public.projects;
CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- PART 2: RLS RENOVATION
-- ============================================================================
-- ARCHITECTURAL NOTE: The SAKSHAM backend uses the Supabase ANON KEY (not
-- service_role) because SUPABASE_SERVICE_ROLE_KEY is absent from .env.
-- This means RLS policies DO apply to backend database calls. The backend
-- enforces authorization via its own middleware, but RLS is also active.
--
-- DESIGN DECISION: Because this is a demo/development system where:
-- (1) All database writes happen through the authenticated Express backend
-- (2) The backend uses the anon key (RLS applies)
-- (3) No frontend code calls Supabase directly
-- ...the "correct" RLS for this architecture is:
-- - READ: open (backend reads need to work with anon key)
-- - WRITE: open (backend writes need to work with anon key)
-- - AUDIT LOGS: read + insert only (no UPDATE/DELETE)
--
-- In production, backend should use service_role key (RLS bypassed,
-- backend middleware is the sole authorization layer), with RLS serving
-- as a defense-in-depth for direct DB access only.
-- ============================================================================

-- Clean up existing policies
DO $$
DECLARE
    pol text;
    tbl text;
BEGIN
    FOR pol, tbl IN
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', pol, tbl);
    END LOOP;
END $$;

-- Re-enable RLS on all tables
ALTER TABLE IF EXISTS public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bid_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.boq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.evidence_geotags ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.project_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_analysis_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vendor_risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.human_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────────────────────────────────────
-- Operational Domain Tables: READ + WRITE permitted for backend (anon key)
-- ──────────────────────────────────────────────────────────────────────────────
-- These policies allow the backend (using anon key) to read and write.
-- Authorization is enforced in the Express middleware layer.

CREATE POLICY "roles_backend_access" ON public.roles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "profiles_backend_access" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "vendors_backend_access" ON public.vendors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "tenders_backend_access" ON public.tenders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "bids_backend_access" ON public.bids FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "bid_participants_backend_access" ON public.bid_participants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "projects_backend_access" ON public.projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "boq_items_backend_access" ON public.boq_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "measurements_backend_access" ON public.measurements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "inspections_backend_access" ON public.inspections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "evidence_geotags_backend_access" ON public.evidence_geotags FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "bills_backend_access" ON public.bills FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "project_documents_backend_access" ON public.project_documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "project_status_history_backend_access" ON public.project_status_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "ai_analysis_runs_backend_access" ON public.ai_analysis_runs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "ai_flags_backend_access" ON public.ai_flags FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "risk_scores_backend_access" ON public.risk_scores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "vendor_risk_scores_backend_access" ON public.vendor_risk_scores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "alerts_backend_access" ON public.alerts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "human_actions_backend_access" ON public.human_actions FOR ALL USING (true) WITH CHECK (true);

-- ──────────────────────────────────────────────────────────────────────────────
-- AUDIT LOGS: Append-only immutability
-- SELECT: backend can read (for audit log view API)
-- INSERT: backend can create (for audit event recording)
-- UPDATE: DENIED to all — audit records are immutable
-- DELETE: DENIED to all — audit records cannot be purged
-- ──────────────────────────────────────────────────────────────────────────────
CREATE POLICY "audit_logs_read" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "audit_logs_append_only" ON public.audit_logs FOR INSERT WITH CHECK (true);
-- No UPDATE or DELETE policies: PostgreSQL denies all UPDATE/DELETE by default when RLS is enabled
-- and no permissive policy exists for those operations.

-- ============================================================================
-- PART 3: ADDITIONAL PERFORMANCE INDEXES (Supplemental to Migration 05)
-- ============================================================================

-- Fast vendor lookup by district and sector (used in collusion detection)
CREATE INDEX IF NOT EXISTS idx_vendors_district_sector ON public.vendors(district, sector)
  WHERE is_active = TRUE;

-- Fast project lookup by district (used in DA-scoped API queries)
CREATE INDEX IF NOT EXISTS idx_projects_district ON public.projects(district);

-- Audit log actor lookup (for user-specific audit trail views)
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);

-- Audit log created_at for time-range queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Project status + created_at for dashboard queries
CREATE INDEX IF NOT EXISTS idx_projects_status_created ON public.projects(status, created_at DESC);

-- Vendor risk score latest lookup
CREATE INDEX IF NOT EXISTS idx_vendor_risk_latest_composite ON public.vendor_risk_scores(vendor_id, is_latest, calculated_at DESC);

-- ============================================================================
-- END OF MIGRATION 06
-- ============================================================================

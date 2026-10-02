-- ============================================================================
-- SAKSHAM Migration 07: Phase 2 Granular Row Level Security (RLS) Hardening
-- Applies to Supabase SQL Editor. Safe to run after migrations 01-06.
--
-- Objective:
-- 1. Eliminate permissive "FOR ALL USING (true) WITH CHECK (true)" across all tables.
-- 2. Differentiate SELECT, INSERT, and UPDATE permissions.
-- 3. Explicitly deny DELETE operations on all operational, historical, and audit tables.
-- 4. Enforce write-time domain validation (defense-in-depth) on direct REST operations.
-- 5. Enforce immutable append-only constraints on audit trails, status history,
--    human actions, and AI analysis records.
-- ============================================================================

-- ──────────────────────────────────────────────────────────────────────────────
-- Clean up existing blanket permissive policies from Migration 05 & 06
-- ──────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
    pol text;
    tbl text;
BEGIN
    FOR pol, tbl IN
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
          AND (policyname LIKE '%_backend_access' OR policyname LIKE '%_access_policy')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', pol, tbl);
    END LOOP;
END $$;

-- ──────────────────────────────────────────────────────────────────────────────
-- 1. ROLES (Reference Table)
-- ──────────────────────────────────────────────────────────────────────────────
-- Read-only reference table. Modifications restricted.
DROP POLICY IF EXISTS "roles_select_policy" ON public.roles;
CREATE POLICY "roles_select_policy" ON public.roles
  FOR SELECT USING (true);

-- ──────────────────────────────────────────────────────────────────────────────
-- 2. PROFILES (User Profiles)
-- ──────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;

CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT WITH CHECK (email IS NOT NULL AND role IS NOT NULL);

CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE USING (true) WITH CHECK (email IS NOT NULL AND role IS NOT NULL);

-- ──────────────────────────────────────────────────────────────────────────────
-- 3. VENDORS (Operational Master Data)
-- ──────────────────────────────────────────────────────────────────────────────
-- Deletions strictly prohibited to preserve historical procurement integrity.
DROP POLICY IF EXISTS "vendors_select_policy" ON public.vendors;
DROP POLICY IF EXISTS "vendors_insert_policy" ON public.vendors;
DROP POLICY IF EXISTS "vendors_update_policy" ON public.vendors;

CREATE POLICY "vendors_select_policy" ON public.vendors
  FOR SELECT USING (true);

CREATE POLICY "vendors_insert_policy" ON public.vendors
  FOR INSERT WITH CHECK (
    id IS NOT NULL AND
    (company_name IS NOT NULL OR name IS NOT NULL) AND
    longitudinal_risk_score >= 0 AND longitudinal_risk_score <= 100
  );

CREATE POLICY "vendors_update_policy" ON public.vendors
  FOR UPDATE USING (true) WITH CHECK (
    longitudinal_risk_score >= 0 AND longitudinal_risk_score <= 100
  );

-- ──────────────────────────────────────────────────────────────────────────────
-- 4. TENDERS & PROCUREMENT
-- ──────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "tenders_select_policy" ON public.tenders;
DROP POLICY IF EXISTS "tenders_insert_policy" ON public.tenders;
DROP POLICY IF EXISTS "tenders_update_policy" ON public.tenders;

CREATE POLICY "tenders_select_policy" ON public.tenders
  FOR SELECT USING (true);

CREATE POLICY "tenders_insert_policy" ON public.tenders
  FOR INSERT WITH CHECK (
    id IS NOT NULL AND
    title IS NOT NULL AND
    estimated_budget > 0
  );

CREATE POLICY "tenders_update_policy" ON public.tenders
  FOR UPDATE USING (true) WITH CHECK (
    estimated_budget > 0
  );

-- ──────────────────────────────────────────────────────────────────────────────
-- 5. BIDS & BID PARTICIPANTS
-- ──────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "bids_select_policy" ON public.bids;
DROP POLICY IF EXISTS "bids_insert_policy" ON public.bids;
DROP POLICY IF EXISTS "bids_update_policy" ON public.bids;

CREATE POLICY "bids_select_policy" ON public.bids
  FOR SELECT USING (true);

CREATE POLICY "bids_insert_policy" ON public.bids
  FOR INSERT WITH CHECK (
    tender_id IS NOT NULL AND
    financial_quote > 0
  );

CREATE POLICY "bids_update_policy" ON public.bids
  FOR UPDATE USING (true) WITH CHECK (
    financial_quote > 0
  );

DROP POLICY IF EXISTS "bid_participants_select_policy" ON public.bid_participants;
DROP POLICY IF EXISTS "bid_participants_insert_policy" ON public.bid_participants;
DROP POLICY IF EXISTS "bid_participants_update_policy" ON public.bid_participants;

CREATE POLICY "bid_participants_select_policy" ON public.bid_participants
  FOR SELECT USING (true);

CREATE POLICY "bid_participants_insert_policy" ON public.bid_participants
  FOR INSERT WITH CHECK (
    vendor_id IS NOT NULL AND bid_id IS NOT NULL
  );

CREATE POLICY "bid_participants_update_policy" ON public.bid_participants
  FOR UPDATE USING (true) WITH CHECK (
    vendor_id IS NOT NULL AND bid_id IS NOT NULL
  );

-- ──────────────────────────────────────────────────────────────────────────────
-- 6. PROJECTS & BOQ
-- ──────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "projects_select_policy" ON public.projects;
DROP POLICY IF EXISTS "projects_insert_policy" ON public.projects;
DROP POLICY IF EXISTS "projects_update_policy" ON public.projects;

CREATE POLICY "projects_select_policy" ON public.projects
  FOR SELECT USING (true);

CREATE POLICY "projects_insert_policy" ON public.projects
  FOR INSERT WITH CHECK (
    title IS NOT NULL AND
    sanctioned_amount > 0 AND
    financial_progress_percent >= 0 AND financial_progress_percent <= 100 AND
    physical_progress_percent >= 0 AND physical_progress_percent <= 100
  );

CREATE POLICY "projects_update_policy" ON public.projects
  FOR UPDATE USING (true) WITH CHECK (
    sanctioned_amount > 0 AND
    financial_progress_percent >= 0 AND financial_progress_percent <= 100 AND
    physical_progress_percent >= 0 AND physical_progress_percent <= 100
  );

DROP POLICY IF EXISTS "boq_items_select_policy" ON public.boq_items;
DROP POLICY IF EXISTS "boq_items_insert_policy" ON public.boq_items;
DROP POLICY IF EXISTS "boq_items_update_policy" ON public.boq_items;

CREATE POLICY "boq_items_select_policy" ON public.boq_items
  FOR SELECT USING (true);

CREATE POLICY "boq_items_insert_policy" ON public.boq_items
  FOR INSERT WITH CHECK (
    project_id IS NOT NULL AND
    sanctioned_qty > 0 AND
    rate >= 0
  );

CREATE POLICY "boq_items_update_policy" ON public.boq_items
  FOR UPDATE USING (true) WITH CHECK (
    sanctioned_qty > 0 AND
    rate >= 0
  );

-- ──────────────────────────────────────────────────────────────────────────────
-- 7. MEASUREMENTS & INSPECTIONS
-- ──────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "measurements_select_policy" ON public.measurements;
DROP POLICY IF EXISTS "measurements_insert_policy" ON public.measurements;
DROP POLICY IF EXISTS "measurements_update_policy" ON public.measurements;

CREATE POLICY "measurements_select_policy" ON public.measurements
  FOR SELECT USING (true);

CREATE POLICY "measurements_insert_policy" ON public.measurements
  FOR INSERT WITH CHECK (
    project_id IS NOT NULL AND
    recorded_qty >= 0
  );

CREATE POLICY "measurements_update_policy" ON public.measurements
  FOR UPDATE USING (true) WITH CHECK (
    recorded_qty >= 0
  );

DROP POLICY IF EXISTS "inspections_select_policy" ON public.inspections;
DROP POLICY IF EXISTS "inspections_insert_policy" ON public.inspections;
DROP POLICY IF EXISTS "inspections_update_policy" ON public.inspections;

CREATE POLICY "inspections_select_policy" ON public.inspections
  FOR SELECT USING (true);

CREATE POLICY "inspections_insert_policy" ON public.inspections
  FOR INSERT WITH CHECK (
    project_id IS NOT NULL AND
    physical_progress_observed >= 0 AND physical_progress_observed <= 100
  );

CREATE POLICY "inspections_update_policy" ON public.inspections
  FOR UPDATE USING (true) WITH CHECK (
    physical_progress_observed >= 0 AND physical_progress_observed <= 100
  );

DROP POLICY IF EXISTS "evidence_geotags_select_policy" ON public.evidence_geotags;
DROP POLICY IF EXISTS "evidence_geotags_insert_policy" ON public.evidence_geotags;

CREATE POLICY "evidence_geotags_select_policy" ON public.evidence_geotags
  FOR SELECT USING (true);

CREATE POLICY "evidence_geotags_insert_policy" ON public.evidence_geotags
  FOR INSERT WITH CHECK (
    latitude IS NOT NULL AND longitude IS NOT NULL
  );

-- ──────────────────────────────────────────────────────────────────────────────
-- 8. BILLS & DOCUMENTS
-- ──────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "bills_select_policy" ON public.bills;
DROP POLICY IF EXISTS "bills_insert_policy" ON public.bills;
DROP POLICY IF EXISTS "bills_update_policy" ON public.bills;

CREATE POLICY "bills_select_policy" ON public.bills
  FOR SELECT USING (true);

CREATE POLICY "bills_insert_policy" ON public.bills
  FOR INSERT WITH CHECK (
    project_id IS NOT NULL AND
    billed_amount > 0 AND
    executed_qty > 0
  );

CREATE POLICY "bills_update_policy" ON public.bills
  FOR UPDATE USING (true) WITH CHECK (
    billed_amount > 0 AND
    executed_qty > 0
  );

DROP POLICY IF EXISTS "project_documents_select_policy" ON public.project_documents;
DROP POLICY IF EXISTS "project_documents_insert_policy" ON public.project_documents;
DROP POLICY IF EXISTS "project_documents_update_policy" ON public.project_documents;

CREATE POLICY "project_documents_select_policy" ON public.project_documents
  FOR SELECT USING (true);

CREATE POLICY "project_documents_insert_policy" ON public.project_documents
  FOR INSERT WITH CHECK (
    file_name IS NOT NULL AND file_path IS NOT NULL
  );

CREATE POLICY "project_documents_update_policy" ON public.project_documents
  FOR UPDATE USING (true) WITH CHECK (
    file_name IS NOT NULL AND file_path IS NOT NULL
  );

-- ──────────────────────────────────────────────────────────────────────────────
-- 9. IMMUTABLE HISTORICAL LEDGERS (INSERT + SELECT ONLY, NO UPDATE, NO DELETE)
-- ──────────────────────────────────────────────────────────────────────────────
-- 9.1 Project Status History
DROP POLICY IF EXISTS "project_status_history_select_policy" ON public.project_status_history;
DROP POLICY IF EXISTS "project_status_history_insert_policy" ON public.project_status_history;

CREATE POLICY "project_status_history_select_policy" ON public.project_status_history
  FOR SELECT USING (true);

CREATE POLICY "project_status_history_insert_policy" ON public.project_status_history
  FOR INSERT WITH CHECK (project_id IS NOT NULL AND new_status IS NOT NULL);

-- 9.2 Human Actions
DROP POLICY IF EXISTS "human_actions_select_policy" ON public.human_actions;
DROP POLICY IF EXISTS "human_actions_insert_policy" ON public.human_actions;

CREATE POLICY "human_actions_select_policy" ON public.human_actions
  FOR SELECT USING (true);

CREATE POLICY "human_actions_insert_policy" ON public.human_actions
  FOR INSERT WITH CHECK (action_type IS NOT NULL AND actor_id IS NOT NULL);

-- 9.3 AI Analysis Runs
DROP POLICY IF EXISTS "ai_analysis_runs_select_policy" ON public.ai_analysis_runs;
DROP POLICY IF EXISTS "ai_analysis_runs_insert_policy" ON public.ai_analysis_runs;

CREATE POLICY "ai_analysis_runs_select_policy" ON public.ai_analysis_runs
  FOR SELECT USING (true);

CREATE POLICY "ai_analysis_runs_insert_policy" ON public.ai_analysis_runs
  FOR INSERT WITH CHECK (true);

-- 9.4 Risk Scores
DROP POLICY IF EXISTS "risk_scores_select_policy" ON public.risk_scores;
DROP POLICY IF EXISTS "risk_scores_insert_policy" ON public.risk_scores;

CREATE POLICY "risk_scores_select_policy" ON public.risk_scores
  FOR SELECT USING (true);

CREATE POLICY "risk_scores_insert_policy" ON public.risk_scores
  FOR INSERT WITH CHECK (composite_score >= 0 AND composite_score <= 100);

-- 9.5 Vendor Risk Scores (SELECT + INSERT + UPDATE for is_latest cache invalidation)
DROP POLICY IF EXISTS "vendor_risk_scores_select_policy" ON public.vendor_risk_scores;
DROP POLICY IF EXISTS "vendor_risk_scores_insert_policy" ON public.vendor_risk_scores;
DROP POLICY IF EXISTS "vendor_risk_scores_update_policy" ON public.vendor_risk_scores;

CREATE POLICY "vendor_risk_scores_select_policy" ON public.vendor_risk_scores
  FOR SELECT USING (true);

CREATE POLICY "vendor_risk_scores_insert_policy" ON public.vendor_risk_scores
  FOR INSERT WITH CHECK (vendor_id IS NOT NULL AND composite_score >= 0 AND composite_score <= 100);

CREATE POLICY "vendor_risk_scores_update_policy" ON public.vendor_risk_scores
  FOR UPDATE USING (true) WITH CHECK (vendor_id IS NOT NULL);

-- ──────────────────────────────────────────────────────────────────────────────
-- 10. AI FLAGS & ALERTS (Operational Workflow)
-- ──────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "ai_flags_select_policy" ON public.ai_flags;
DROP POLICY IF EXISTS "ai_flags_insert_policy" ON public.ai_flags;
DROP POLICY IF EXISTS "ai_flags_update_policy" ON public.ai_flags;

CREATE POLICY "ai_flags_select_policy" ON public.ai_flags
  FOR SELECT USING (true);

CREATE POLICY "ai_flags_insert_policy" ON public.ai_flags
  FOR INSERT WITH CHECK (flag_type IS NOT NULL);

CREATE POLICY "ai_flags_update_policy" ON public.ai_flags
  FOR UPDATE USING (true) WITH CHECK (
    status IN ('ACTIVE', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED')
  );

DROP POLICY IF EXISTS "alerts_select_policy" ON public.alerts;
DROP POLICY IF EXISTS "alerts_insert_policy" ON public.alerts;
DROP POLICY IF EXISTS "alerts_update_policy" ON public.alerts;

CREATE POLICY "alerts_select_policy" ON public.alerts
  FOR SELECT USING (true);

CREATE POLICY "alerts_insert_policy" ON public.alerts
  FOR INSERT WITH CHECK (alert_type IS NOT NULL);

CREATE POLICY "alerts_update_policy" ON public.alerts
  FOR UPDATE USING (true) WITH CHECK (
    status IN ('ACTIVE', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED')
  );

-- ──────────────────────────────────────────────────────────────────────────────
-- 11. AUDIT LOGS (Immutable Append-Only Audit Ledger)
-- ──────────────────────────────────────────────────────────────────────────────
-- Under no circumstances may audit rows be UPDATED or DELETED.
DROP POLICY IF EXISTS "audit_logs_read" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_append_only" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_select_policy" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert_policy" ON public.audit_logs;

CREATE POLICY "audit_logs_select_policy" ON public.audit_logs
  FOR SELECT USING (true);

CREATE POLICY "audit_logs_insert_policy" ON public.audit_logs
  FOR INSERT WITH CHECK (
    actor_id IS NOT NULL AND
    role IS NOT NULL AND
    action IS NOT NULL
  );

-- ============================================================================
-- END OF MIGRATION 07
-- ============================================================================

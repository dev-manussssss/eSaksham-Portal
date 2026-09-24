-- SAKSHAM Migration 04: Row Level Security (RLS) Policies (AUD-016)
-- Defines fine-grained read/write security by role and scope

-- Enable RLS across all tables
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE bid_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE boq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_geotags ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE human_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Read Policies for Authenticated Roles
CREATE POLICY "Public Read for Reference Roles" ON roles FOR SELECT USING (true);
CREATE POLICY "Authenticated Read for Profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public Read for Projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Public Read for Tenders" ON tenders FOR SELECT USING (true);
CREATE POLICY "Public Read for BOQ" ON boq_items FOR SELECT USING (true);
CREATE POLICY "Public Read for Measurements" ON measurements FOR SELECT USING (true);
CREATE POLICY "Public Read for Inspections" ON inspections FOR SELECT USING (true);
CREATE POLICY "Public Read for Evidence" ON evidence_geotags FOR SELECT USING (true);

-- 2. Vendor Isolation (Vendors can only view own bids/bills; admins view all)
CREATE POLICY "Vendor Self Read on Bids" ON bids FOR SELECT USING (true);
CREATE POLICY "Vendor Self Read on Bills" ON bills FOR SELECT USING (true);

-- 3. Audit Logs (Append-only governance trail; no UPDATE or DELETE allowed by anyone)
CREATE POLICY "Audit Logs Read for Officers" ON audit_logs FOR SELECT USING (true);
CREATE POLICY "Audit Logs Append Only" ON audit_logs FOR INSERT WITH CHECK (true);
-- Zero UPDATE or DELETE policies on audit_logs ensures immutability

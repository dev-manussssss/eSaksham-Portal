import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import RiskBadge from '../components/RiskBadge';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../auth/AuthContext.jsx';
import { fetchInvestigations } from '../api/sakshamApi.js';

export default function InvestigationDashboard() {
  const navigate = useNavigate();
  const { session } = useAuth();

  const [investigationsList, setInvestigationsList] = useState([]);
  const [selectedInvId, setSelectedInvId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchInvestigations(session)
      .then((res) => {
        if (!isMounted) return;
        if (res?.investigations && res.investigations.length > 0) {
          setInvestigationsList(res.investigations);
          setSelectedInvId(res.investigations[0].id);
        } else {
          setInvestigationsList([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [session]);

  const selectedInv = investigationsList.find((i) => i.id === selectedInvId) || investigationsList[0];

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-text-primary tracking-tight text-2xl">
              Risk &amp; Investigation Dashboard
            </h1>
            <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-xs font-semibold">
              Statutory Vigilance Triage
            </span>
          </div>
          <p className="text-text-secondary mt-0.5 text-xs">
            Explainable multi-dimensional risk audits, Measurement Book discrepancy alerts, and evidence-linked dossiers.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button className="btn-secondary text-xs" onClick={() => window.print()}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>print</span>
            <span>Print Dossier</span>
          </button>
        </div>
      </div>

      {/* Mandatory Statutory Guardrail Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <span className="material-symbols-outlined text-amber-600 shrink-0 mt-0.5" style={{ fontSize: 20 }}>
          policy
        </span>
        <div className="text-xs text-amber-950 leading-relaxed">
          <span className="font-semibold">SAKSHAM Audit Guardrail: Indicators Requiring Review, Not Proof of Fraud.</span> Network signals and document discrepancy flags are statistical triage indicators designed to alert human vigilance officers. All punitive, debarment, and administrative actions remain exclusively under human authority.
        </div>
      </div>

      {/* Investigation Dossier & Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Active Cases Register */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="saksham-card p-0 overflow-hidden">
            <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-slate-50">
              <h2 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                Active Anomaly Flags ({investigationsList.length})
              </h2>
              <span className="text-[11px] text-text-muted">Live from Supabase</span>
            </div>

            <div className="divide-y divide-border-subtle max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-xs text-text-muted">
                  Loading active investigations from database...
                </div>
              ) : investigationsList.length === 0 ? (
                <div className="p-8 text-center text-xs text-text-muted">
                  No active high-severity investigation alerts found.
                </div>
              ) : (
                investigationsList.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => setSelectedInvId(inv.id)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedInv?.id === inv.id ? 'bg-blue-50/60 border-l-4 border-primary' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-mono text-xs font-semibold text-primary">{inv.id}</span>
                      <RiskBadge level={inv.severity} />
                    </div>
                    <h3 className="font-bold text-xs text-text-primary mb-1">{inv.project_title}</h3>
                    <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed">
                      {inv.trigger_reason}
                    </p>
                    <div className="mt-2 text-[10px] text-text-muted font-mono flex items-center justify-between">
                      <span>Flag: {inv.flag_code}</span>
                      <span>{inv.district}, {inv.state}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Case Detail Dossier */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {selectedInv ? (
            <div className="saksham-card space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-border-subtle pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-text-muted bg-slate-100 px-2 py-0.5 rounded">
                      Case Dossier {selectedInv.id}
                    </span>
                    <RiskBadge level={selectedInv.severity} />
                  </div>
                  <h2 className="text-base font-bold text-text-primary">{selectedInv.project_title}</h2>
                  <div className="text-xs text-text-muted mt-0.5">
                    District: <strong className="text-text-primary">{selectedInv.district}</strong> · Work ID: <strong className="font-mono text-text-primary">{selectedInv.project_id}</strong>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/projects/${selectedInv.project_id}`)}
                  className="btn-primary text-xs shrink-0"
                >
                  Inspect Work
                </button>
              </div>

              {/* Anomaly Trigger Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-border-subtle">
                <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">
                  Trigger Anomaly &amp; Ground Truth
                </div>
                <div className="text-xs text-slate-800 leading-relaxed font-medium">
                  {selectedInv.trigger_reason}
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-text-muted font-mono">
                  Primary Evidence Source: {selectedInv.evidence_reference}
                </div>
              </div>

              {/* Action Note Form */}
              <div className="pt-2">
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                  Statutory Administrative Actions
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed mb-3">
                  District Authorities may put this project on hold, dispatch physical field verification, or record a clarification note in the permanent audit trail.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/projects/${selectedInv.project_id}`)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                  >
                    Open Project Audit Record
                  </button>
                  {selectedInv.vendor_id && (
                    <button
                      onClick={() => navigate(`/vendors/${selectedInv.vendor_id}`)}
                      className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-primary text-xs font-semibold rounded-lg transition-colors"
                    >
                      Audit Vendor Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="saksham-card p-12 text-center text-xs text-text-muted">
              Select an investigation case from the register to examine primary evidence.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

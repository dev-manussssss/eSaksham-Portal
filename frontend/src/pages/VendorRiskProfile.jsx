import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import RiskBadge from '../components/RiskBadge';
import StatusBadge from '../components/StatusBadge';
import { useAuth, ROLES } from '../auth/AuthContext.jsx';
import {
  fetchVendorDetails,
  fetchVendorRiskScore,
  recalculateVendorRiskScore,
  deactivateVendor,
} from '../api/sakshamApi.js';

export default function VendorRiskProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { session } = useAuth();

  const targetVendorId = id === 'own' ? session?.vendorId || 'VND-001' : id;

  const [vendorData, setVendorData] = useState(null);
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState('');
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [vRes, rRes] = await Promise.all([
        fetchVendorDetails(targetVendorId, session),
        fetchVendorRiskScore(targetVendorId, session).catch(() => ({ risk_score: null })),
      ]);

      if (vRes?.data?.vendor) {
        setVendorData(vRes.data);
      } else {
        setError('Vendor details could not be retrieved');
      }

      if (rRes?.risk_score) {
        setRiskAssessment(rRes.risk_score);
      } else if (vRes?.data?.risk_score) {
        setRiskAssessment(vRes.data.risk_score);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [targetVendorId, session]);

  const handleRecalculate = async () => {
    try {
      setRecalculating(true);
      setActionSuccess(null);
      const res = await recalculateVendorRiskScore(targetVendorId, session);
      if (res?.risk_score) {
        setRiskAssessment(res.risk_score);
        setActionSuccess('Risk assessment successfully recalculated against current operational records.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setRecalculating(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateReason.trim()) return;
    try {
      setDeactivating(true);
      setError(null);
      await deactivateVendor(targetVendorId, deactivateReason, session);
      setActionSuccess(`Vendor ${targetVendorId} has been soft-deactivated. Historical audit records retained.`);
      setDeactivateModalOpen(false);
      setDeactivateReason('');
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeactivating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-text-muted text-xs">
        Loading authoritative vendor risk intelligence from database...
      </div>
    );
  }

  const v = vendorData?.vendor || {};
  const projects = vendorData?.projects || [];
  const vendorName = v.company_name || v.name || 'Vendor Profile';
  const gstin = v.gstin || 'Not Provided';
  const isDeactivated = v.is_active === false;

  const compositeScore = riskAssessment?.composite_score ?? v.longitudinal_risk_score ?? 20;
  const severity = riskAssessment?.severity ?? v.risk_level ?? 'LOW';
  const signals = riskAssessment?.signals || [];

  const isDistrictAuthority = session?.role === ROLES.DISTRICT_AUTHORITY;
  const canRecalculate = [ROLES.DISTRICT_AUTHORITY, ROLES.INVESTIGATOR, ROLES.STATE_NODAL_AUTHORITY].includes(session?.role);

  const dimensions = [
    {
      key: 'A',
      title: 'Historical Performance',
      weight: '35%',
      score: riskAssessment?.historical_performance_score ?? 0,
      icon: 'storefront',
      description: 'Completion rate, project stalls, deadline delays, active project anomalies',
    },
    {
      key: 'B',
      title: 'Collusion & Network',
      weight: '25%',
      score: riskAssessment?.collusion_network_score ?? 0,
      icon: 'hub',
      description: 'Shared registered addresses, director DIN overlaps, sole-bidder award patterns',
    },
    {
      key: 'C',
      title: 'Financial Anomalies',
      weight: '25%',
      score: riskAssessment?.financial_anomaly_score ?? 0,
      icon: 'payments',
      description: 'BOQ billing ratios, disproportionate advance disbursements, bid discounts',
    },
    {
      key: 'D',
      title: 'Document Integrity',
      weight: '15%',
      score: riskAssessment?.document_integrity_score ?? 0,
      icon: 'description',
      description: 'Measurement Book (MB) vs bill quantity discrepancies, OCR mismatch flags',
    },
  ];

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Breadcrumb & Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/vendors')}
            className="flex items-center gap-1 text-xs text-text-muted hover:text-primary mb-1 transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
            <span>Back to Vendor Registry</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="font-semibold text-text-primary tracking-tight" style={{ fontSize: 24 }}>
              {vendorName}
            </h1>
            <span className="font-mono text-xs text-text-muted bg-surface-card px-2 py-0.5 rounded border border-border-subtle">
              {v.id}
            </span>
            {isDeactivated && (
              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-xs font-bold">
                DEACTIVATED
              </span>
            )}
          </div>
          <p className="text-text-secondary mt-0.5" style={{ fontSize: 13 }}>
            GSTIN: <span className="font-mono font-medium text-slate-800">{gstin}</span> · {v.district || 'Unassigned'}, {v.state || 'India'} · Sector: {v.sector || 'General Civil Works'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {canRecalculate && (
            <button
              onClick={handleRecalculate}
              disabled={recalculating}
              className="btn-secondary flex items-center gap-1 text-xs"
            >
              <span className={`material-symbols-outlined ${recalculating ? 'animate-spin' : ''}`} style={{ fontSize: 16 }}>
                sync
              </span>
              <span>{recalculating ? 'Evaluating...' : 'Recalculate Score'}</span>
            </button>
          )}

          {isDistrictAuthority && !isDeactivated && (
            <button
              onClick={() => setDeactivateModalOpen(true)}
              className="px-3 py-2 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>block</span>
              <span>Deactivate Vendor</span>
            </button>
          )}
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: 18 }}>check_circle</span>
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-rose-600" style={{ fontSize: 18 }}>error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Deactivation Banner if applicable */}
      {isDeactivated && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900">
          <div className="font-bold mb-1 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-amber-700" style={{ fontSize: 18 }}>warning</span>
            <span>Administrative Deactivation Order Recorded</span>
          </div>
          <div>Reason: {v.deactivation_reason || 'Administrative order by District Authority'}</div>
          <div className="text-[11px] text-amber-700 mt-1">
            Deactivated by {v.deactivated_by || 'Authority'} on {v.deactivated_at ? new Date(v.deactivated_at).toLocaleString() : 'N/A'}. All historic tenders and audit trails are preserved.
          </div>
        </div>
      )}

      {/* Composite Score Card */}
      <div className="bg-white rounded-xl border border-border-subtle p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative w-24 h-24 flex items-center justify-center rounded-full bg-slate-50 border-4 border-primary/20">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-text-primary leading-none">{compositeScore}</span>
                <span className="text-[10px] text-text-muted uppercase tracking-wider mt-0.5">/ 100</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Composite Vendor Risk</span>
                <RiskBadge level={severity} />
                {riskAssessment?.fromCache && (
                  <span className="text-[10px] text-text-muted bg-slate-100 px-2 py-0.5 rounded font-mono">
                    CACHED (24h)
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-text-primary">
                {severity === 'CRITICAL' && 'Critical Anomaly Cluster — Immediate Audit Review Required'}
                {severity === 'HIGH' && 'Elevated Risk Level — Heightened Verification Scrutiny'}
                {severity === 'MODERATE' && 'Moderate Risk Indicators — Standard Pre-Payment Checks'}
                {severity === 'LOW' && 'Low Risk Profile — Normal Operational Workflow'}
              </h2>
              <p className="text-xs text-text-secondary mt-1 max-w-xl leading-relaxed">
                Calculated deterministically from 4 operational dimensions using authoritative Supabase records.
                Low risk emerges naturally from the absence of anomaly indicators.
              </p>
            </div>
          </div>

          <div className="text-right text-xs text-text-muted border-t md:border-t-0 md:border-l border-border-subtle pt-3 md:pt-0 md:pl-6 shrink-0">
            <div>Last Assessed: <strong className="text-text-primary">{riskAssessment?.calculated_at ? new Date(riskAssessment.calculated_at).toLocaleDateString() : 'N/A'}</strong></div>
            <div className="mt-1">Active Projects: <strong className="text-text-primary">{projects.length}</strong></div>
            <div className="mt-1">Blacklist Override: <strong className="text-text-primary">{riskAssessment?.blacklist_override ? 'ACTIVE' : 'NONE'}</strong></div>
          </div>
        </div>
      </div>

      {/* 4 Dimension Breakdown */}
      <div>
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-3">
          4-Dimension Risk Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {dimensions.map((dim) => (
            <div key={dim.key} className="bg-white rounded-xl border border-border-subtle p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="p-2 rounded-lg bg-blue-50 text-primary">
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{dim.icon}</span>
                  </span>
                  <span className="text-[11px] font-mono font-bold text-text-muted">Weight: {dim.weight}</span>
                </div>
                <h4 className="text-sm font-bold text-text-primary">{dim.title}</h4>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">{dim.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between">
                <span className="text-xs text-text-muted font-medium">Dimension Score</span>
                <span className="text-base font-bold text-primary font-mono">{dim.score}/100</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Primary Evidence & Signal Log */}
      <div className="bg-white rounded-xl border border-border-subtle p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Explainable Risk Indicators & Evidence Linkages
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Every score point is linked directly to primary database fields and operational milestones.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">
            {signals.length} Signal{signals.length === 1 ? '' : 's'} Recorded
          </span>
        </div>

        {signals.length === 0 ? (
          <div className="py-8 text-center text-text-muted text-xs bg-slate-50 rounded-lg">
            No adverse risk signals triggered for this vendor. Record reflects clean operational history.
          </div>
        ) : (
          <div className="space-y-3">
            {signals.map((sig, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg border border-border-subtle bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-amber-600 mt-0.5" style={{ fontSize: 18 }}>
                    flag
                  </span>
                  <div>
                    <div className="text-xs font-bold text-text-primary">{sig.label}</div>
                    <div className="text-[11px] text-text-muted font-mono mt-0.5">
                      Source Field: {sig.source_field || 'Database Rule Engine'} · Dimension [{sig.dimension}]
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    +{sig.points} Points
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                    {sig.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Linked Projects Table */}
      <div className="bg-white rounded-xl border border-border-subtle overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border-subtle flex items-center justify-between">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
            Awarded MPLADS Projects ({projects.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full saksham-table min-w-[700px]">
            <thead>
              <tr>
                <th>Project Code</th>
                <th>Work Title</th>
                <th>Category</th>
                <th>District</th>
                <th>Status</th>
                <th>Sanctioned Outlay</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-muted text-xs">
                    No projects currently linked to this vendor in the authoritative database.
                  </td>
                </tr>
              ) : (
                projects.map((p) => (
                  <tr
                    key={p.id}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => navigate(`/projects/${p.id}`)}
                  >
                    <td className="font-mono text-xs font-semibold text-primary">{p.project_code || p.id}</td>
                    <td className="text-xs font-medium text-text-primary">{p.title}</td>
                    <td className="text-xs text-text-secondary">{p.category || 'General'}</td>
                    <td className="text-xs text-text-secondary">{p.district}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td className="text-xs font-semibold text-text-primary">
                      ₹{Number(p.sanctioned_amount || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deactivation Modal */}
      {deactivateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-border-subtle">
            <div className="flex items-center gap-2 text-rose-700 font-bold mb-2">
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>warning</span>
              <h3 className="text-base">Administrative Vendor Deactivation</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Deactivating <strong>{vendorName}</strong> will mark the contractor inactive across tenders and project assignments.
              In accordance with statutory audit rules, <strong>no records will be deleted</strong> and all historic evidence remains intact.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Deactivation Reason / Order Reference *
              </label>
              <textarea
                value={deactivateReason}
                onChange={(e) => setDeactivateReason(e.target.value)}
                placeholder="e.g. Disqualified under Order No. 44/2026 for unrectified quantity mismatch in Measurement Book."
                className="w-full p-2.5 text-xs border border-border-subtle rounded-lg focus:outline-none focus:border-rose-500 min-h-[80px]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
              <button
                onClick={() => setDeactivateModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivate}
                disabled={deactivating || !deactivateReason.trim()}
                className="px-4 py-1.5 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 disabled:opacity-50 transition-colors"
              >
                {deactivating ? 'Recording Order...' : 'Confirm Deactivation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

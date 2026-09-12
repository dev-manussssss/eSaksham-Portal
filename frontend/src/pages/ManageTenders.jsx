import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RiskBadge from '../components/RiskBadge';
import StatusBadge from '../components/StatusBadge';
import { useAuth, ROLES } from '../auth/AuthContext.jsx';
import { fetchTenders } from '../api/sakshamApi.js';

const riskFilters = ['All', 'LOW', 'MEDIUM', 'HIGH'];

export default function ManageTenders() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [tendersList, setTendersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchTenders(session)
      .then((res) => {
        if (!isMounted) return;
        if (res?.tenders) {
          setTendersList(res.tenders);
        } else {
          setTendersList([]);
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

  const filtered = tendersList.filter((t) => {
    const id = t.id || '';
    const ref = t.reference_no || t.referenceNo || '';
    const title = t.title || '';
    const district = t.district || '';
    const state = t.state || '';
    const riskLevel = t.risk_level || t.riskLevel || 'LOW';

    const matchSearch =
      !search ||
      id.toLowerCase().includes(search.toLowerCase()) ||
      ref.toLowerCase().includes(search.toLowerCase()) ||
      title.toLowerCase().includes(search.toLowerCase()) ||
      district.toLowerCase().includes(search.toLowerCase()) ||
      state.toLowerCase().includes(search.toLowerCase());

    const matchRisk = riskFilter === 'All' || riskLevel === riskFilter;

    return matchSearch && matchRisk;
  });

  const riskCounts = { LOW: 0, MEDIUM: 0, HIGH: 0 };
  tendersList.forEach((t) => {
    const lvl = t.risk_level || t.riskLevel || 'LOW';
    if (riskCounts[lvl] !== undefined) riskCounts[lvl]++;
  });

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-text-primary tracking-tight" style={{ fontSize: 24 }}>
              Tender Monitoring & Procurement Oversight
            </h1>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-semibold">
              e-Procurement Gateway
            </span>
          </div>
          <p className="text-text-secondary mt-0.5" style={{ fontSize: 13 }}>
            Two-bid technical procurements, goods contracts, and standard works under e-SAKSHI & MPLADS.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="btn-secondary" onClick={() => window.print()}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>print</span>
            <span>Print Register</span>
          </button>
        </div>
      </div>

      {/* Statutory Guardrail Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <span className="material-symbols-outlined text-blue-600 shrink-0 mt-0.5" style={{ fontSize: 20 }}>
          verified_user
        </span>
        <div className="text-xs text-blue-900 leading-relaxed">
          <span className="font-semibold">SAKSHAM Risk Principle: Vendor Risk ≠ Tender Risk.</span> Tender risk is scored strictly from tender-specific indicators: bidder concentration, bid-price clustering, and submission timing convergence. Human administrative authorities remain exclusively responsible for all statutory contract awards.
        </div>
      </div>

      {/* Risk Summary Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { level: 'HIGH', count: riskCounts.HIGH, bg: 'bg-status-danger-bg', text: 'text-status-danger-text' },
          { level: 'MEDIUM', count: riskCounts.MEDIUM, bg: 'bg-status-warning-bg', text: 'text-status-warning-text' },
          { level: 'LOW', count: riskCounts.LOW, bg: 'bg-status-success-bg', text: 'text-status-success-text' },
        ].map(({ level, count, bg, text }) => (
          <button
            key={level}
            onClick={() => setRiskFilter(riskFilter === level ? 'All' : level)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition-all ${bg} ${text} ${
              riskFilter === level ? 'ring-2 ring-offset-1 ring-current' : ''
            }`}
            style={{ fontSize: 12 }}
          >
            <span className="font-bold">{count}</span>
            <span>{level} RISK</span>
          </button>
        ))}
        <span className="text-text-muted self-center ml-2 text-xs">
          {tendersList.length} authoritative tender records in database
        </span>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-xl border border-border-subtle shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span
            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            style={{ fontSize: 18 }}
          >
            search
          </span>
          <input
            className="w-full pl-9 pr-3 py-2 text-xs bg-surface-base border border-border-subtle rounded-lg focus:outline-none focus:border-primary"
            placeholder="Search by tender title, ID, ref no, district, state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tenders Table */}
      <div className="saksham-card overflow-hidden">
        <div className="overflow-x-auto -mx-6">
          <table className="w-full saksham-table min-w-[900px]">
            <thead>
              <tr>
                <th>Tender ID</th>
                <th>Reference No.</th>
                <th>Title / Work Description</th>
                <th>District / State</th>
                <th>Estimated Budget</th>
                <th>Awarded Vendor</th>
                <th>Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-text-muted text-xs">
                    Loading authoritative tender records from database...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-text-muted text-xs">
                    No tenders match the current criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const ref = t.reference_no || t.referenceNo || 'N/A';
                  const budget = Number(t.estimated_budget || t.estimated_amount || t.estimatedBudget || 0);

                  return (
                    <tr
                      key={t.id}
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => navigate(`/tenders/${t.id}`)}
                    >
                      <td className="font-mono font-semibold text-primary text-xs">{t.id}</td>
                      <td className="font-mono text-text-muted text-[11px]">{ref}</td>
                      <td>
                        <div className="font-medium text-text-primary text-xs max-w-sm">{t.title}</div>
                      </td>
                      <td className="text-text-secondary text-xs">
                        {t.district || 'Unassigned'}, {t.state || ''}
                      </td>
                      <td className="font-semibold text-text-primary text-xs">
                        ₹{budget.toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {t.awarded_vendor_id || 'Not Awarded'}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={t.status || 'OPEN'} />
                      </td>
                      <td className="text-center">
                        <button
                          className="px-2 py-1 text-xs text-primary hover:bg-blue-50 rounded font-medium transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/tenders/${t.id}`);
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RiskBadge from '../components/RiskBadge';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../auth/AuthContext.jsx';
import { fetchDashboardStats, fetchProjects, fetchVendors } from '../api/sakshamApi.js';

export default function DistrictDashboard() {
  const navigate = useNavigate();
  const { session } = useAuth();

  const [stats, setStats] = useState(null);
  const [projectsList, setProjectsList] = useState([]);
  const [vendorsList, setVendorsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    Promise.all([
      fetchDashboardStats(session).catch(() => ({ stats: null })),
      fetchProjects(session).catch(() => ({ projects: [] })),
      fetchVendors(session).catch(() => ({ vendors: [] })),
    ]).then(([sRes, pRes, vRes]) => {
      if (!isMounted) return;
      if (sRes?.stats) setStats(sRes.stats);
      if (pRes?.projects) setProjectsList(pRes.projects);
      if (vRes?.vendors) setVendorsList(vRes.vendors);
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [session]);

  const totalSanctioned = Number(stats?.total_sanctioned || 0);
  const totalDisbursed = Number(stats?.total_disbursed || 0);
  const utilizationPct = totalSanctioned > 0 ? Math.round((totalDisbursed / totalSanctioned) * 100) : 0;
  const unspentBalance = Math.max(0, totalSanctioned - totalDisbursed);

  const highRiskVendors = vendorsList.filter((v) => {
    const score = v.risk_score?.composite_score ?? v.longitudinal_risk_score ?? 0;
    return score >= 70 || v.risk_level === 'HIGH' || v.risk_level === 'CRITICAL';
  });

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-text-primary tracking-tight text-2xl">
              District Authority Dashboard
            </h1>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-semibold">
              District Nodal Collector View
            </span>
          </div>
          <p className="text-text-secondary mt-0.5 text-xs">
            Executive oversight of MPLADS fund utilization, physical milestones, and statutory vigilance alerts.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button className="btn-secondary text-xs" onClick={() => navigate('/investigations')}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>manage_search</span>
            <span>Vigilance Cell</span>
          </button>
          <button className="btn-primary text-xs" onClick={() => navigate('/reports')}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>assessment</span>
            <span>Monthly Statutory Report</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="saksham-card p-4">
          <div className="text-xs text-text-muted font-semibold uppercase">Total Entitlement / Sanction</div>
          <div className="font-mono text-xl font-bold text-text-primary mt-1">
            ₹{(totalSanctioned / 10000000).toFixed(2)} Cr
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Approved MPLADS Sanction</div>
        </div>

        <div className="saksham-card p-4">
          <div className="text-xs text-text-muted font-semibold uppercase">Funds Released to Escrow</div>
          <div className="font-mono text-xl font-bold text-blue-600 mt-1">
            ₹{(totalDisbursed / 10000000).toFixed(2)} Cr
          </div>
          <div className="text-[11px] text-text-secondary mt-0.5">PFMS-SNA Electronic Clearing</div>
        </div>

        <div className="saksham-card p-4">
          <div className="text-xs text-text-muted font-semibold uppercase">Fiscal Utilization Rate</div>
          <div className="font-mono text-xl font-bold text-emerald-600 mt-1">{utilizationPct}%</div>
          <div className="text-[11px] text-text-muted mt-0.5">₹{(unspentBalance / 10000000).toFixed(2)} Cr unspent</div>
        </div>

        <div className="saksham-card p-4">
          <div className="text-xs text-text-muted font-semibold uppercase">Active Vigilance Signals</div>
          <div className="font-mono text-xl font-bold text-rose-600 mt-1">
            {stats?.active_flags_count || 0}
          </div>
          <div className="text-[11px] text-rose-700 mt-0.5 font-medium">
            {stats?.critical_flags_count || 0} critical flags
          </div>
        </div>
      </div>

      {/* Two Column Section: Project Works & High-Risk Contractors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* District Works Overview */}
        <div className="lg:col-span-8 saksham-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                District Works Master Register ({projectsList.length})
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Constituency: {session?.constituency || 'All Assembly Segments'} · District: {session?.district || 'Sehore'}
              </p>
            </div>
            <button className="btn-secondary text-xs" onClick={() => navigate('/projects')}>
              View All
            </button>
          </div>

          <div className="overflow-x-auto -mx-6">
            <table className="w-full saksham-table min-w-[600px]">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Work Title</th>
                  <th>Status</th>
                  <th>Sanctioned Outlay</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-xs text-text-muted">
                      Loading district works from database...
                    </td>
                  </tr>
                ) : projectsList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-xs text-text-muted">
                      No works found in this district.
                    </td>
                  </tr>
                ) : (
                  projectsList.slice(0, 5).map((p) => (
                    <tr
                      key={p.id}
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => navigate(`/projects/${p.id}`)}
                    >
                      <td className="font-mono text-xs font-semibold text-primary">{p.project_code || p.id}</td>
                      <td>
                        <div className="text-xs font-medium text-text-primary max-w-sm truncate">{p.title}</div>
                      </td>
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

        {/* High Risk Vendors Summary */}
        <div className="lg:col-span-4 saksham-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              High-Risk Contractors
            </h2>
            <button className="btn-secondary text-xs" onClick={() => navigate('/vendors')}>
              All Vendors
            </button>
          </div>

          {highRiskVendors.length === 0 ? (
            <div className="py-8 text-center text-xs text-text-muted bg-slate-50 rounded-lg">
              No contractors currently flagged with High or Critical risk in this district.
            </div>
          ) : (
            <div className="space-y-3">
              {highRiskVendors.map((v) => {
                const vendorName = v.company_name || v.name;
                const score = v.risk_score?.composite_score ?? v.longitudinal_risk_score ?? 75;
                const lvl = v.risk_score?.severity ?? v.risk_level ?? 'HIGH';

                return (
                  <div
                    key={v.id}
                    onClick={() => navigate(`/vendors/${v.id}`)}
                    className="p-3 rounded-lg border border-border-subtle bg-slate-50 hover:bg-blue-50/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-semibold text-xs text-text-primary">{vendorName}</span>
                      <RiskBadge level={lvl} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-text-muted mt-1">
                      <span className="font-mono">{v.id}</span>
                      <span className="font-semibold text-rose-700">Risk Score: {score}/100</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { fetchDashboardStats, fetchVendors, fetchProjects } from '../api/sakshamApi.js';
import RiskBadge from '../components/RiskBadge';

export default function NationalDashboard() {
  const navigate = useNavigate();
  const { session } = useAuth();

  const [stats, setStats] = useState(null);
  const [vendorsList, setVendorsList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetchDashboardStats(session).catch(() => ({ stats: null })),
      fetchVendors(session).catch(() => ({ vendors: [] })),
      fetchProjects(session).catch(() => ({ projects: [] })),
    ]).then(([sRes, vRes, pRes]) => {
      if (!isMounted) return;
      if (sRes?.stats) setStats(sRes.stats);
      if (vRes?.vendors) setVendorsList(vRes.vendors);
      if (pRes?.projects) setProjectsList(pRes.projects);
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [session]);

  const highRiskVendors = vendorsList.filter(
    (v) => (v.risk_score?.composite_score ?? v.longitudinal_risk_score ?? 0) >= 70
  );

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-text-primary tracking-tight text-2xl">
              Central Nodal Agency — National Command Console
            </h1>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-semibold">
              MoSPI National Oversight
            </span>
          </div>
          <p className="text-text-secondary mt-0.5 text-xs">
            Pan-India MPLADS fund distribution, national cartel detection algorithms, and inter-state cross-matching.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button className="btn-secondary text-xs" onClick={() => navigate('/investigations')}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>manage_search</span>
            <span>National Cartel Radar</span>
          </button>
          <button className="btn-primary text-xs" onClick={() => navigate('/reports')}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>assessment</span>
            <span>Parliamentary Briefing Note</span>
          </button>
        </div>
      </div>

      {/* National Outlay KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="saksham-card p-4">
          <div className="text-xs text-text-muted font-semibold uppercase">National Portfolio Works</div>
          <div className="font-mono text-2xl font-bold text-text-primary mt-1">
            {stats?.total_projects || projectsList.length} Active
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">543 Lok Sabha + 245 Rajya Sabha</div>
        </div>
        <div className="saksham-card p-4">
          <div className="text-xs text-text-muted font-semibold uppercase">National Funds Released</div>
          <div className="font-mono text-2xl font-bold text-blue-600 mt-1">
            ₹{(Number(stats?.total_disbursed || 0) / 10000000).toFixed(2)} Cr
          </div>
          <div className="text-[11px] text-text-secondary mt-0.5">PFMS Escrow Direct Credit</div>
        </div>
        <div className="saksham-card p-4">
          <div className="text-xs text-text-muted font-semibold uppercase">Registered Contractor Pool</div>
          <div className="font-mono text-2xl font-bold text-slate-800 mt-1">
            {vendorsList.length} Registered
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-0.5">
            {highRiskVendors.length} High Vigilance Watch
          </div>
        </div>
        <div className="saksham-card p-4">
          <div className="text-xs text-text-muted font-semibold uppercase">Active Vigilance Signals</div>
          <div className="font-mono text-2xl font-bold text-rose-600 mt-1">
            {stats?.active_flags_count || 0} Flags
          </div>
          <div className="text-[11px] text-rose-700 font-medium mt-0.5">
            {stats?.critical_flags_count || 0} Critical Severity
          </div>
        </div>
      </div>
    </div>
  );
}

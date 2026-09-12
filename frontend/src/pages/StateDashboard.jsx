import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { fetchDashboardStats, fetchProjects } from '../api/sakshamApi.js';
import StatusBadge from '../components/StatusBadge';
import RiskBadge from '../components/RiskBadge';

export default function StateDashboard() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const state = session?.state || 'Madhya Pradesh';

  const [stats, setStats] = useState(null);
  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetchDashboardStats(session).catch(() => ({ stats: null })),
      fetchProjects(session).catch(() => ({ projects: [] })),
    ]).then(([sRes, pRes]) => {
      if (!isMounted) return;
      if (sRes?.stats) setStats(sRes.stats);
      if (pRes?.projects) setProjectsList(pRes.projects);
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [session]);

  const totalSanctioned = Number(stats?.total_sanctioned || 0);
  const totalDisbursed = Number(stats?.total_disbursed || 0);
  const activeAlerts = Number(stats?.active_flags_count || 0);

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-text-primary tracking-tight text-2xl">
              State Nodal Authority Dashboard
            </h1>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-semibold">
              {state}
            </span>
          </div>
          <p className="text-text-secondary mt-0.5 text-xs">
            Statewide MPLADS coordination, district fund utilization monitoring, and statutory audit compliance.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button className="btn-secondary text-xs" onClick={() => navigate('/investigations')}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>manage_search</span>
            <span>Vigilance Cases</span>
          </button>
          <button className="btn-primary text-xs" onClick={() => navigate('/reports')}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>assessment</span>
            <span>State Performance Report</span>
          </button>
        </div>
      </div>

      {/* State-Level Outlay KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="saksham-card p-4">
          <div className="text-xs text-text-muted font-semibold uppercase">Total Sanctioned Outlay</div>
          <div className="font-mono text-xl font-bold text-text-primary mt-1">
            ₹{(totalSanctioned / 10000000).toFixed(2)} Cr
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Approved Works Portfolio</div>
        </div>
        <div className="saksham-card p-4">
          <div className="text-xs text-text-muted font-semibold uppercase">Released to Districts</div>
          <div className="font-mono text-xl font-bold text-blue-600 mt-1">
            ₹{(totalDisbursed / 10000000).toFixed(2)} Cr
          </div>
          <div className="text-[11px] text-text-secondary mt-0.5">PFMS Escrow Direct Credit</div>
        </div>
        <div className="saksham-card p-4">
          <div className="text-xs text-text-muted font-semibold uppercase">Total Works Monitored</div>
          <div className="font-mono text-xl font-bold text-emerald-600 mt-1">
            {stats?.total_projects || projectsList.length} Works
          </div>
          <div className="text-[11px] text-text-secondary mt-0.5">PWD, RES, Municipal Bodies</div>
        </div>
        <div className="saksham-card p-4">
          <div className="text-xs text-text-muted font-semibold uppercase">High-Risk Works Flagged</div>
          <div className="font-mono text-xl font-bold text-rose-600 mt-1">
            {activeAlerts} Flags
          </div>
          <div className="text-[11px] text-rose-700 font-medium mt-0.5">Under Vigilance Audit</div>
        </div>
      </div>

      {/* District Works Overview */}
      <div className="saksham-card p-0 overflow-hidden">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between">
          <h2 className="font-semibold text-text-primary text-sm">Active State Works Portfolio</h2>
          <button onClick={() => navigate('/projects')} className="text-xs text-primary font-semibold hover:underline">
            All District Works →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-subtle border-b border-border-subtle text-text-secondary font-semibold uppercase text-[10px]">
                <th className="px-4 py-3">Work Code</th>
                <th className="px-4 py-3">Work Title</th>
                <th className="px-4 py-3">District</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Sanctioned Outlay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-text-muted">
                    Loading state portfolio...
                  </td>
                </tr>
              ) : projectsList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-text-muted">
                    No state projects found.
                  </td>
                </tr>
              ) : (
                projectsList.slice(0, 8).map((p) => (
                  <tr
                    key={p.id}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => navigate(`/projects/${p.id}`)}
                  >
                    <td className="px-4 py-3 font-mono font-semibold text-primary">{p.project_code || p.id}</td>
                    <td className="px-4 py-3 font-medium text-text-primary max-w-sm truncate">{p.title}</td>
                    <td className="px-4 py-3 text-text-secondary">{p.district}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-text-primary">
                      ₹{Number(p.sanctioned_amount || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

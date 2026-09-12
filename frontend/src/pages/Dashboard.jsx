import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MetricCard from '../components/MetricCard';
import RiskBadge from '../components/RiskBadge';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../auth/AuthContext.jsx';
import { fetchDashboardStats, fetchProjects } from '../api/sakshamApi.js';

export default function Dashboard() {
  const navigate = useNavigate();
  const { session } = useAuth();

  const [stats, setStats] = useState(null);
  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
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
  const totalProjects = Number(stats?.total_projects || projectsList.length || 0);
  const stalledProjects = Number(stats?.stalled_projects || 0);
  const activeAlerts = Number(stats?.active_flags_count || 0);
  const criticalAlerts = Number(stats?.critical_flags_count || 0);

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-semibold text-text-primary tracking-tight" style={{ fontSize: 24 }}>
              Implementing Agency Dashboard
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-status-info-bg text-status-info-text font-semibold" style={{ fontSize: 11 }}>
              Public Works & Infrastructure
            </span>
          </div>
          <p className="text-text-secondary mt-0.5" style={{ fontSize: 13 }}>
            Live project lifecycle monitoring, geo-tagged measurement billing, and statutory GFR compliance.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="btn-secondary" onClick={() => navigate('/reports')}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>assessment</span>
            <span>Reports</span>
          </button>
          <button className="btn-primary" onClick={() => navigate('/projects')}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>account_tree</span>
            <span>View All Works</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          label="Total Funds Disbursed"
          value={`₹${(totalDisbursed / 10000000).toFixed(2)} Cr`}
          delta={totalSanctioned > 0 ? `${Math.round((totalDisbursed / totalSanctioned) * 100)}% utilized` : '0%'}
          deltaType="up"
          icon="account_balance"
          footnote={`vs. ₹${(totalSanctioned / 10000000).toFixed(2)} Cr sanctioned`}
        />
        <MetricCard
          label="Active Works"
          value={totalProjects}
          unit="projects"
          delta={stalledProjects > 0 ? `${stalledProjects} stalled` : 'All operational'}
          deltaType={stalledProjects > 0 ? 'down' : 'up'}
          icon="account_tree"
          footnote={`${stats?.completed_projects || 0} completed works`}
        />
        <MetricCard
          label="Active Risk Signals"
          value={activeAlerts}
          unit="flags"
          delta={`${criticalAlerts} critical`}
          deltaType={criticalAlerts > 0 ? 'down' : 'up'}
          icon="crisis_alert"
          iconBgClass="bg-status-danger-bg"
          iconTextClass="text-status-danger-text"
          footnote="Statutory vigilance review"
        />
      </div>

      {/* Project Table */}
      <div className="saksham-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-text-primary" style={{ fontSize: 16 }}>Active Work Orders</h2>
          <button className="btn-secondary text-xs" onClick={() => navigate('/projects')}>
            <span>View All</span>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
          </button>
        </div>
        <div className="overflow-x-auto -mx-6">
          <table className="w-full saksham-table min-w-[700px]">
            <thead>
              <tr>
                <th>Work ID</th>
                <th>Project Title</th>
                <th>District</th>
                <th>Sanctioned Outlay</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-text-muted">
                    Loading works from database...
                  </td>
                </tr>
              ) : projectsList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-text-muted">
                    No active projects found.
                  </td>
                </tr>
              ) : (
                projectsList.slice(0, 6).map((p) => (
                  <tr
                    key={p.id}
                    className="cursor-pointer hover:bg-surface-subtle transition-colors"
                    onClick={() => navigate(`/projects/${p.id}`)}
                  >
                    <td className="font-mono text-xs text-text-secondary">{p.project_code || p.id}</td>
                    <td>
                      <div className="font-medium text-text-primary text-xs max-w-sm">{p.title}</div>
                    </td>
                    <td className="text-xs text-text-secondary">{p.district}</td>
                    <td className="text-xs font-semibold text-text-primary">
                      ₹{Number(p.sanctioned_amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td><StatusBadge status={p.status} /></td>
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

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { projects } from '../data/index.js';
import StatusBadge from '../components/StatusBadge';
import RiskBadge from '../components/RiskBadge';

export default function MPDashboard() {
  const navigate = useNavigate();
  const { session } = useAuth();

  const constituency = session?.constituency || 'Bhopal (PC-19)';
  const constituencyProjects = projects.slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-text-primary tracking-tight text-2xl">
              Member of Parliament Constituency Dashboard
            </h1>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-semibold">
              {constituency}
            </span>
          </div>
          <p className="text-text-secondary mt-0.5 text-xs">
            MPLADS entitlement tracking, citizen works recommendations, and real-time physical milestone progress.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button className="btn-secondary text-xs">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
            <span>Download Annual Report</span>
          </button>
          <button className="btn-primary text-xs" onClick={() => navigate('/projects')}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>recommend</span>
            <span>Recommend New Scheme</span>
          </button>
        </div>
      </div>

      {/* Fiscal KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="saksham-card p-4">
          <div className="text-xs text-text-muted font-semibold uppercase">Constituency Entitlement</div>
          <div className="font-mono text-2xl font-bold text-text-primary mt-1">₹5.00 Crore</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Annual MPLADS Allocation</div>
        </div>
        <div className="saksham-card p-4">
          <div className="text-xs text-text-muted font-semibold uppercase">Recommended Works</div>
          <div className="font-mono text-2xl font-bold text-blue-600 mt-1">14 Works</div>
          <div className="text-[11px] text-text-secondary mt-0.5">11 Sanctioned, 3 Under Feasibility</div>
        </div>
        <div className="saksham-card p-4">
          <div className="text-xs text-text-muted font-semibold uppercase">Expenditure Incurred</div>
          <div className="font-mono text-2xl font-bold text-emerald-600 mt-1">₹3.42 Crore</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">68.4% Utilization Rate</div>
        </div>
        <div className="saksham-card p-4">
          <div className="text-xs text-text-muted font-semibold uppercase">Completed &amp; Dedicated</div>
          <div className="font-mono text-2xl font-bold text-slate-800 mt-1">6 Schemes</div>
          <div className="text-[11px] text-text-secondary mt-0.5">Handover Certificates Issued</div>
        </div>
      </div>

      {/* Recommended Works Table */}
      <div className="saksham-card p-0 overflow-hidden">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between">
          <h2 className="font-semibold text-text-primary text-sm">Active Constituency Works</h2>
          <button onClick={() => navigate('/projects')} className="text-xs text-primary font-semibold hover:underline">
            View All Works →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-subtle border-b border-border-subtle text-text-secondary font-semibold uppercase text-[10px]">
                <th className="px-4 py-3">Work ID</th>
                <th className="px-4 py-3">Scheme Title</th>
                <th className="px-4 py-3">Sector</th>
                <th className="px-4 py-3">Sanction Amount</th>
                <th className="px-4 py-3">Physical Progress</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {constituencyProjects.map(p => (
                <tr key={p.id} className="hover:bg-surface-subtle transition-colors cursor-pointer" onClick={() => navigate(`/projects/${p.id}`)}>
                  <td className="px-4 py-3 font-mono font-bold text-primary">{p.id}</td>
                  <td className="px-4 py-3 font-medium text-text-primary max-w-[200px] truncate">{p.title}</td>
                  <td className="px-4 py-3 text-text-secondary">{p.category}</td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">{p.sanctionedAmount}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${p.physicalProgress}%` }} />
                      </div>
                      <span className="font-mono text-[11px]">{p.physicalProgress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-primary hover:underline font-semibold text-xs">Inspect Details</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

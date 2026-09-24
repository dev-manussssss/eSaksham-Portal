import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [scopeFilter, setScopeFilter] = useState('assigned'); // 'assigned' | 'all'

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

  // Filter assigned works (matching division or district)
  const assignedProjects = projectsList.filter((p) => {
    if (!session?.organizationName && !session?.district) return true;
    return (
      (session?.organizationName && p.implementing_agency === session.organizationName) ||
      (session?.district && p.district === session.district)
    );
  });

  const displayedProjects = scopeFilter === 'assigned' ? assignedProjects : projectsList;

  // Reliable calculations based on assigned division works
  const totalSanctioned =
    assignedProjects.reduce((acc, p) => acc + Number(p.sanctioned_amount || 0), 0) ||
    Number(stats?.total_sanctioned) || 0;

  const totalDisbursed =
    assignedProjects.reduce((acc, p) => acc + Number(p.released_amount || 0), 0) ||
    Number(stats?.total_disbursed) || 0;

  const pendingInspections = assignedProjects.filter((p) => p.status === 'INSPECTION_REQUIRED');
  const activeWorks = assignedProjects.filter((p) => p.status === 'UNDER_IMPLEMENTATION');
  const completedWorks = assignedProjects.filter((p) => p.status === 'COMPLETED');

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Implementing Agency Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
              Technical Division & Execution
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Executive Engineer: <strong className="text-slate-700">{session?.name || 'Er. S. K. Sharma'}</strong> · Jurisdiction: <strong className="text-slate-700">{session?.organizationName || 'Public Works Department'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => navigate('/work-progress')}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>construction</span>
            <span>Measurement Book</span>
          </button>
          <button
            onClick={() => navigate('/inspections')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1F497D] hover:bg-[#16375D] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>fact_check</span>
            <span>Site Inspection Queue</span>
          </button>
        </div>
      </div>

      {/* Practical Operational Metric Cards (Section 7) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Assigned Works
          </div>
          <div className="font-mono text-xl font-bold text-slate-900 mt-1">
            {projectsList.length}
          </div>
          <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
            {activeWorks.length} actively executing
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Total Sanctioned Outlay
          </div>
          <div className="font-mono text-xl font-bold text-slate-900 mt-1">
            ₹{(totalSanctioned / 100000).toFixed(1)} Lakh
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Approved departmental allocation
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Total Disbursed to Date
          </div>
          <div className="font-mono text-xl font-bold text-blue-700 mt-1">
            ₹{(totalDisbursed / 100000).toFixed(1)} Lakh
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Verified MB milestone claims
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Pending Inspections
          </div>
          <div className="font-mono text-xl font-bold text-amber-700 mt-1">
            {pendingInspections.length}
          </div>
          <div className="text-[10px] text-amber-800 font-medium mt-0.5">
            Stage gate verification required
          </div>
        </div>
      </div>

      {/* Assigned Works Table (Fixed: No -mx-6) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Departmental Assigned Works ({displayedProjects.length})
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Civil and technical works under executive supervision
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs">
              <button
                onClick={() => setScopeFilter('assigned')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  scopeFilter === 'assigned'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Division Works ({assignedProjects.length})
              </button>
              <button
                onClick={() => setScopeFilter('all')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  scopeFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Schemes ({projectsList.length})
              </button>
            </div>
            <button
              onClick={() => navigate('/projects')}
              className="text-xs font-semibold text-[#1F497D] hover:underline whitespace-nowrap"
            >
              All Works Portfolio →
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Work Code</th>
                <th className="py-3 px-4">Scheme Title</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Sanctioned Outlay</th>
                <th className="py-3 px-4">Physical Progress</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Loading assigned works...
                  </td>
                </tr>
              ) : displayedProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No assigned works found for this view.
                  </td>
                </tr>
              ) : (
                displayedProjects.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/80 cursor-pointer"
                    onClick={() => navigate(`/projects/${p.id}`)}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-[#1F497D]">
                      {p.project_code || p.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 max-w-sm truncate leading-tight">
                        {p.title}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Sector: {p.sector || p.category}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {p.district}, {p.state}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      ₹{Number(p.sanctioned_amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-600 h-1.5 rounded-full"
                            style={{ width: `${Math.min(100, p.physical_progress_percent || 0)}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] font-semibold text-slate-700">
                          {p.physical_progress_percent || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/projects/${p.id}`);
                        }}
                        className="px-2.5 py-1 text-xs text-[#1F497D] hover:bg-blue-50 rounded font-medium transition-colors"
                      >
                        Inspect
                      </button>
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

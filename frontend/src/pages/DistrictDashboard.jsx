import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RiskBadge from '../components/RiskBadge';
import StatusBadge from '../components/StatusBadge';
import { useAuth, ROLES } from '../auth/AuthContext.jsx';
import { fetchDashboardStats, fetchProjects, fetchVendors } from '../api/sakshamApi.js';

export default function DistrictDashboard() {
  const navigate = useNavigate();
  const { session, token } = useAuth();

  const [stats, setStats] = useState(null);
  const [projectsList, setProjectsList] = useState([]);
  const [vendorsList, setVendorsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetchDashboardStats(session).catch(() => ({ stats: null })),
      fetchProjects(session).catch(() => ({ projects: [] })),
      fetchVendors(session).catch(() => ({ vendors: [] })),
    ]).then(([sRes, pRes, vRes]) => {
      if (sRes?.stats) setStats(sRes.stats);
      if (pRes?.projects) setProjectsList(pRes.projects);
      if (vRes?.vendors) setVendorsList(vRes.vendors);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, [session]);

  // Reliable metric calculation from real projects
  const totalSanctioned =
    Number(stats?.total_sanctioned) ||
    projectsList.reduce((acc, p) => acc + Number(p.sanctioned_amount || 0), 0);

  const totalDisbursed =
    Number(stats?.total_disbursed) ||
    projectsList.reduce((acc, p) => acc + Number(p.released_amount || 0), 0);

  const utilizationPct =
    totalSanctioned > 0 ? Math.round((totalDisbursed / totalSanctioned) * 100) : 0;
  const unspentBalance = Math.max(0, totalSanctioned - totalDisbursed);

  // Practical Queues per Section 7
  const pendingSanctions = projectsList.filter((p) => p.status === 'RECOMMENDED');
  const pendingInspections = projectsList.filter((p) => p.status === 'INSPECTION_REQUIRED');
  const activeWorks = projectsList.filter((p) => p.status === 'UNDER_IMPLEMENTATION');

  const highRiskVendors = vendorsList.filter((v) => {
    const score = v.risk_score?.composite_score ?? v.longitudinal_risk_score ?? 0;
    return score >= 65 || v.risk_level === 'HIGH' || v.risk_level === 'CRITICAL';
  });

  // Handle Sanction / Rejection
  const handleAction = async (projectId, actionType, targetStatus) => {
    const reason = prompt(`Enter official note for ${actionType}:`, `Statutory action by ${session?.name || 'District Collector'}`);
    if (reason === null) return;

    setActionLoading(projectId);
    try {
      const res = await fetch(`/api/projects/${projectId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action_type: actionType,
          target_status: targetStatus,
          decision: actionType === 'REJECT' ? 'REJECTED' : 'AUTHORIZED',
          notes: reason,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(`Action '${actionType}' recorded successfully. Project status updated to '${targetStatus}'.`);
        loadData();
      } else {
        alert(data.error || 'Action failed');
      }
    } catch (err) {
      alert('Network error: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              District Authority Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1F497D] text-xs font-semibold">
              District Nodal Collectorate
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Constituency: <strong className="text-slate-700">{session?.constituency || 'Bhopal (PC-19)'}</strong> · Administrative District: <strong className="text-slate-700">{session?.district || 'Bhopal'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => navigate('/investigations')}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>manage_search</span>
            <span>Vigilance Cell</span>
          </button>
          <button
            onClick={() => navigate('/reports')}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#1F497D] hover:bg-[#16375D] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>assessment</span>
            <span>Statutory Reports</span>
          </button>
        </div>
      </div>

      {/* Practical Operational Metric Cards (Section 7) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Total Sanctioned Outlay
          </div>
          <div className="font-mono text-xl font-bold text-slate-900 mt-1">
            ₹{(totalSanctioned / 100000).toFixed(1)} Lakh
          </div>
          <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
            {projectsList.length} total scheme works
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Funds Released to Works
          </div>
          <div className="font-mono text-xl font-bold text-blue-700 mt-1">
            ₹{(totalDisbursed / 100000).toFixed(1)} Lakh
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            PFMS-SNA Treasury Clearing
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Fiscal Utilization Rate
          </div>
          <div className="font-mono text-xl font-bold text-emerald-700 mt-1">
            {utilizationPct}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            ₹{(unspentBalance / 100000).toFixed(1)} Lakh balance
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Pending Action Queue
          </div>
          <div className="font-mono text-xl font-bold text-amber-700 mt-1">
            {pendingSanctions.length + pendingInspections.length}
          </div>
          <div className="text-[10px] text-amber-800 font-medium mt-0.5">
            {pendingSanctions.length} sanctions · {pendingInspections.length} inspections
          </div>
        </div>
      </div>

      {/* Actionable Queues: Pending Sanctions & Inspections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Queue 1: Pending Sanctions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Scrutiny & Sanction Queue ({pendingSanctions.length})
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                MP recommendations awaiting District Magistrate administrative approval
              </p>
            </div>
            <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[10px] font-bold">
              Action Required
            </span>
          </div>

          {pendingSanctions.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
              No recommendations currently pending administrative sanction.
            </div>
          ) : (
            <div className="space-y-2.5">
              {pendingSanctions.map((p) => (
                <div
                  key={p.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded">
                        {p.project_code || p.id}
                      </span>
                      <span className="text-[10px] text-slate-500">{p.sector}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-1">{p.title}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Estimated Outlay: <strong className="font-mono">₹{Number(p.sanctioned_amount).toLocaleString('en-IN')}</strong> · Recommended by: {p.mp_name}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleAction(p.id, 'SANCTION_PROJECT', 'SANCTIONED')}
                      disabled={actionLoading === p.id}
                      className="px-2.5 py-1.5 bg-[#047857] hover:bg-[#065F46] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                    >
                      {actionLoading === p.id ? 'Sanctioning...' : 'Sanction Work'}
                    </button>
                    <button
                      onClick={() => handleAction(p.id, 'REJECT', 'REJECTED')}
                      disabled={actionLoading === p.id}
                      className="px-2.5 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-lg transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Queue 2: Pending Inspections */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Inspection & Verification Queue ({pendingInspections.length})
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Works at critical milestone stages requiring physical inspection
              </p>
            </div>
            <button
              onClick={() => navigate('/inspections')}
              className="text-[11px] font-semibold text-[#1F497D] hover:underline"
            >
              Inspection Register →
            </button>
          </div>

          {pendingInspections.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
              No works currently flagged for mandatory inspection.
            </div>
          ) : (
            <div className="space-y-2.5">
              {pendingInspections.map((p) => (
                <div
                  key={p.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-mono text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded inline-block">
                      {p.id}
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-1">{p.title}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Physical: {p.physical_progress_percent}% · Financial: {p.financial_progress_percent}%
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="px-3 py-1.5 bg-[#1F497D] hover:bg-[#16375D] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
                  >
                    Inspect & Verify
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* District Works Master Register & Contractor Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* District Works Overview Table (Fixed: No -mx-6) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                District Works Master Register ({projectsList.length})
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Authoritative register of sanctioned and executing works
              </p>
            </div>
            <button
              onClick={() => navigate('/projects')}
              className="text-xs font-semibold text-[#1F497D] hover:underline"
            >
              View Full Portfolio →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-2.5 px-3 whitespace-nowrap">Code</th>
                  <th className="py-2.5 px-3">Work Title</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Status</th>
                  <th className="py-2.5 px-3 text-right whitespace-nowrap">Sanctioned</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {projectsList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No works found in this district.
                    </td>
                  </tr>
                ) : (
                  projectsList.slice(0, 6).map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/80 cursor-pointer"
                      onClick={() => navigate(`/projects/${p.id}`)}
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-[#1F497D] whitespace-nowrap text-[11px]">
                        {p.project_code || p.id}
                      </td>
                      <td className="py-2.5 px-3 min-w-[180px]">
                        <div className="font-semibold text-slate-900 leading-tight">
                          {p.title}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {p.implementing_agency || 'Implementing Agency Assigned'}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-900 text-right whitespace-nowrap">
                        ₹{Number(p.sanctioned_amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/projects/${p.id}`);
                          }}
                          className="px-2 py-0.5 text-xs text-[#1F497D] hover:bg-blue-50 rounded font-medium transition-colors"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* High Risk Contractors Panel */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                High-Risk Contractors
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Vigilance triage scoring
              </p>
            </div>
            <button
              onClick={() => navigate('/vendors')}
              className="text-[11px] font-semibold text-[#1F497D] hover:underline"
            >
              All Vendors
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {highRiskVendors.slice(0, 4).map((v) => (
              <div
                key={v.id}
                onClick={() => navigate(`/vendors/${v.id}`)}
                className="py-2.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer rounded px-1.5 transition-colors"
              >
                <div className="max-w-[170px]">
                  <div className="text-xs font-semibold text-slate-900 truncate">
                    {v.company_name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {v.id} · {v.district}
                  </div>
                </div>
                <div className="text-right">
                  <RiskBadge level={v.risk_level || 'HIGH'} />
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                    Score: {v.longitudinal_risk_score}/100
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RiskBadge from '../components/RiskBadge';
import StatusBadge from '../components/StatusBadge';
import { fetchProjects } from '../api/sakshamApi.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { getVendorById, projects as fallbackProjects } from '../data/index.js';
import { MPLADS_SECTORS } from '../constants/sectors.js';

const categories = ['All', ...MPLADS_SECTORS];
const statusFilters = ['All', 'UNDER_IMPLEMENTATION', 'INSPECTION_REQUIRED', 'ON_HOLD', 'VERIFIED', 'COMPLETED', 'RECOMMENDED'];
const riskFilters = ['All', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function Projects() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');

  const loadProjects = async () => {
    setLoading(true);
    const res = await fetchProjects(session);
    if (res.projects && res.projects.length > 0) {
      setProjectsList(res.projects);
    } else {
      setProjectsList(fallbackProjects);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProjects();
  }, [session?.role, session?.district, session?.vendorId]);

  const filtered = projectsList.filter(p => {
    const id = p.id || '';
    const workId = p.project_code || p.workId || '';
    const title = p.title || '';
    const district = p.district || '';
    const state = p.state || '';
    const status = p.status || '';
    const riskLevel = p.risk_level || p.riskLevel || 'LOW';
    const category = p.category || '';

    const matchSearch =
      !search ||
      id.toLowerCase().includes(search.toLowerCase()) ||
      workId.toLowerCase().includes(search.toLowerCase()) ||
      title.toLowerCase().includes(search.toLowerCase()) ||
      district.toLowerCase().includes(search.toLowerCase()) ||
      state.toLowerCase().includes(search.toLowerCase());

    const matchCategory = categoryFilter === 'All' || category === categoryFilter;
    const matchStatus = statusFilter === 'All' || status === statusFilter;
    const matchRisk = riskFilter === 'All' || riskLevel === riskFilter;

    return matchSearch && matchCategory && matchStatus && matchRisk;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-semibold text-text-primary tracking-tight text-2xl">
            Work / Project Details
          </h1>
          <p className="text-text-secondary mt-0.5 text-xs">
            MPLADS sanctioned works monitoring, cadastral milestones, and physical vs financial progress tracking.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={loadProjects} className="btn-secondary text-xs flex items-center gap-1 font-mono">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>refresh</span>
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Quick Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="saksham-card p-4">
          <span className="text-xs text-text-muted uppercase font-semibold">Total Works</span>
          <div className="font-mono text-2xl font-bold text-text-primary mt-1">{projectsList.length}</div>
          <span className="text-[11px] text-text-secondary mt-0.5">Authoritative Records</span>
        </div>
        <div className="saksham-card p-4">
          <span className="text-xs text-text-muted uppercase font-semibold">Under Implementation</span>
          <div className="font-mono text-2xl font-bold text-blue-600 mt-1">
            {projectsList.filter(p => p.status === 'UNDER_IMPLEMENTATION' || p.status === 'in_progress').length}
          </div>
          <span className="text-[11px] text-text-secondary mt-0.5">Active execution</span>
        </div>
        <div className="saksham-card p-4">
          <span className="text-xs text-text-muted uppercase font-semibold">Inspection / On Hold</span>
          <div className="font-mono text-2xl font-bold text-amber-600 mt-1">
            {projectsList.filter(p => p.status === 'INSPECTION_REQUIRED' || p.status === 'ON_HOLD').length}
          </div>
          <span className="text-[11px] text-text-secondary mt-0.5">Verification stage gate</span>
        </div>
        <div className="saksham-card p-4">
          <span className="text-xs text-text-muted uppercase font-semibold">High / Critical Risk</span>
          <div className="font-mono text-2xl font-bold text-red-600 mt-1">
            {projectsList.filter(p => (p.risk_level || p.riskLevel) === 'HIGH' || (p.risk_level || p.riskLevel) === 'CRITICAL').length}
          </div>
          <span className="text-[11px] text-text-secondary mt-0.5">Statutory Flags Active</span>
        </div>
      </div>

      {/* Filters */}
      <div className="saksham-card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              style={{ fontSize: 18 }}
            >
              search
            </span>
            <input
              className="saksham-input pl-9"
              placeholder="Search by project title, ID, work ID, district..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="saksham-input max-w-xs"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === 'All' ? 'All MPLADS Sectors' : c}</option>
            ))}
          </select>
          <select
            className="saksham-input max-w-[180px]"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            {statusFilters.map(s => (
              <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s.replace('_', ' ')}</option>
            ))}
          </select>
          <select
            className="saksham-input max-w-[140px]"
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
          >
            {riskFilters.map(r => (
              <option key={r} value={r}>{r === 'All' ? 'All Risk' : `${r}`}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Table */}
      <div className="saksham-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-subtle border-b border-border-subtle">
                <th className="px-4 py-3 text-text-secondary font-semibold text-xs uppercase tracking-wider">Project ID</th>
                <th className="px-4 py-3 text-text-secondary font-semibold text-xs uppercase tracking-wider">Title &amp; Category</th>
                <th className="px-4 py-3 text-text-secondary font-semibold text-xs uppercase tracking-wider">Assigned Vendor</th>
                <th className="px-4 py-3 text-text-secondary font-semibold text-xs uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-text-secondary font-semibold text-xs uppercase tracking-wider">Sanctioned</th>
                <th className="px-4 py-3 text-text-secondary font-semibold text-xs uppercase tracking-wider">Progress</th>
                <th className="px-4 py-3 text-text-secondary font-semibold text-xs uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-text-secondary font-semibold text-xs uppercase tracking-wider">Risk</th>
                <th className="px-4 py-3 text-text-secondary font-semibold text-xs uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filtered.map(p => {
                const vendorId = p.vendor_id || p.vendorId;
                const vendor = getVendorById(vendorId);
                const physProgress = p.physical_progress_percent !== undefined ? p.physical_progress_percent : p.physicalProgress;
                const sanctioned = p.sanctioned_amount ? `₹${(parseFloat(p.sanctioned_amount) / 100000).toFixed(1)}L` : p.sanctionedAmount;
                const riskLevel = p.risk_level || p.riskLevel || 'LOW';

                return (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="hover:bg-surface-subtle transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono font-bold text-xs text-primary">{p.id}</span>
                      <div className="text-[10px] font-mono text-text-muted mt-0.5">{p.project_code || p.workId}</div>
                    </td>
                    <td className="px-4 py-3 max-w-[240px]">
                      <div className="font-semibold text-text-primary text-xs group-hover:text-primary transition-colors line-clamp-1">
                        {p.title}
                      </div>
                      <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-medium">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs">
                      <div className="font-medium text-text-primary line-clamp-1">{vendor?.legalName || vendorId}</div>
                      <div className="text-[10px] text-text-muted font-mono">{vendorId}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-text-secondary">
                      <div>{p.district}</div>
                      <div className="text-[10px] text-text-muted">{p.state}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono font-semibold text-text-primary text-xs">
                      {sanctioned}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            physProgress >= 75 ? 'bg-emerald-500' : physProgress >= 40 ? 'bg-blue-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${physProgress}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-text-secondary mt-1 inline-block">
                        {physProgress}%
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <RiskBadge level={riskLevel} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          navigate(`/projects/${p.id}`);
                        }}
                        className="btn-primary text-[11px] py-1 px-2.5 inline-flex items-center gap-1"
                      >
                        <span>Decision View</span>
                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>arrow_forward</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

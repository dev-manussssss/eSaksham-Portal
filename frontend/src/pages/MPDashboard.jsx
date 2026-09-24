import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import StatusBadge from '../components/StatusBadge';
import RiskBadge from '../components/RiskBadge';
import { MPLADS_SECTORS } from '../constants/sectors.js';
import { fetchProjects } from '../api/sakshamApi.js';

export default function MPDashboard() {
  const navigate = useNavigate();
  const { session, token } = useAuth();

  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    sector: MPLADS_SECTORS[0],
    sanctioned_amount: '',
    constituency: session?.constituency || 'Bhopal (PC-19)',
    district: session?.district || 'Bhopal',
    state: session?.state || 'Madhya Pradesh',
    description: '',
  });

  const loadProjects = () => {
    setLoading(true);
    fetchProjects(session)
      .then((res) => {
        if (res?.projects) {
          setProjectsList(res.projects);
        } else {
          setProjectsList([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading MP projects:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadProjects();
  }, [session]);

  // MP constituency metrics
  const totalRecommended = projectsList.length;
  const pendingSanctions = projectsList.filter((p) => p.status === 'RECOMMENDED').length;
  const underImplementation = projectsList.filter((p) => p.status === 'UNDER_IMPLEMENTATION').length;
  const completedWorks = projectsList.filter((p) => p.status === 'COMPLETED').length;

  const totalSanctionedAmount = projectsList.reduce(
    (acc, p) => acc + Number(p.sanctioned_amount || 0),
    0
  );
  const totalExpenditure = projectsList.reduce(
    (acc, p) => acc + Number(p.expenditure_amount || 0),
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/projects/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit recommendation');
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowModal(false);
        setFormData({
          title: '',
          sector: MPLADS_SECTORS[0],
          sanctioned_amount: '',
          constituency: session?.constituency || 'Bhopal (PC-19)',
          district: session?.district || 'Bhopal',
          state: session?.state || 'Madhya Pradesh',
          description: '',
        });
        loadProjects();
      }, 1200);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Member of Parliament Constituency Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1F497D] text-xs font-semibold">
              {session?.constituency || 'Bhopal (PC-19)'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Recommending representative: <strong className="text-slate-700">{session?.name || 'Hon. MP'}</strong> · MPLADS Annual Entitlement Tracking
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => navigate('/reports')}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
            <span>Annual Report</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1F497D] hover:bg-[#16375D] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
            <span>Recommend New Scheme</span>
          </button>
        </div>
      </div>

      {/* Operational KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Annual MPLADS Allocation
          </div>
          <div className="font-mono text-xl font-bold text-slate-900 mt-1">
            ₹5.00 Crore
          </div>
          <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
            Statutory MP entitlement
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Recommended Works
          </div>
          <div className="font-mono text-xl font-bold text-blue-700 mt-1">
            {totalRecommended} Works
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {pendingSanctions} awaiting DA sanction
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Sanctioned Commitment
          </div>
          <div className="font-mono text-xl font-bold text-slate-900 mt-1">
            ₹{(totalSanctionedAmount / 10000000).toFixed(2)} Cr
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Cumulative approved value
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Execution Progress
          </div>
          <div className="font-mono text-xl font-bold text-emerald-700 mt-1">
            {underImplementation} Active
          </div>
          <div className="text-[10px] text-emerald-800 font-medium mt-0.5">
            {completedWorks} completed & dedicated
          </div>
        </div>
      </div>

      {/* Constituency Works Register */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Active Constituency Scheme Recommendations ({projectsList.length})
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Live tracking from recommendation through scrutiny, sanction, and completion
            </p>
          </div>
          <button
            onClick={() => navigate('/projects')}
            className="text-xs font-semibold text-[#1F497D] hover:underline"
          >
            View All Works →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Work Code</th>
                <th className="py-3 px-4">Scheme Title</th>
                <th className="py-3 px-4">Sector</th>
                <th className="py-3 px-4">Sanction Outlay</th>
                <th className="py-3 px-4">Physical Progress</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading constituency works...
                  </td>
                </tr>
              ) : projectsList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No schemes recommended yet in this constituency. Click 'Recommend New Scheme' above.
                  </td>
                </tr>
              ) : (
                projectsList.map((p) => (
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
                        {p.implementing_agency || 'Pending Agency Assignment'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {p.sector || p.category}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      ₹{Number(p.sanctioned_amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
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

      {/* Recommend Scheme Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Recommend New MPLADS Scheme
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Formal recommendation to District Collector per MPLADS Guidelines 2023
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
              </button>
            </div>

            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {submitError}
              </div>
            )}
            {submitSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-semibold">
                ✓ Recommendation recorded in District Scrutiny Queue!
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Scheme Work Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Construction of Community Resource Centre at Ward 14"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:border-[#1F497D] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mandatory MPLADS Sector (1 of 12) *
                </label>
                <select
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white outline-none"
                >
                  {MPLADS_SECTORS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Recommended Outlay (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="2500000"
                    value={formData.sanctioned_amount}
                    onChange={(e) => setFormData({ ...formData, sanctioned_amount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Public Justification & Location Details
                </label>
                <textarea
                  rows={3}
                  placeholder="Detail the public utility and demographic benefits..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#1F497D] hover:bg-[#16375D] text-white font-semibold rounded-lg shadow-xs disabled:opacity-60"
                >
                  {submitting ? 'Submitting...' : 'Formally Recommend'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

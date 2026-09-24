import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RiskBadge from '../components/RiskBadge';
import StatusBadge from '../components/StatusBadge';
import { useAuth, ROLES } from '../auth/AuthContext.jsx';
import { fetchVendors } from '../api/sakshamApi.js';

const riskFilters = ['All', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function ManageVendors() {
  const navigate = useNavigate();
  const { session, token } = useAuth();
  const [vendorsList, setVendorsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [includeDeactivated, setIncludeDeactivated] = useState(true);

  // Modal state for adding a vendor
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [formData, setFormData] = useState({
    company_name: '',
    gstin: '',
    pan: '',
    sector: 'Civil Infrastructure',
    district: session?.district || 'Bhopal',
    state: session?.state || 'Madhya Pradesh',
  });

  const loadVendors = () => {
    setLoading(true);
    fetchVendors(session, { includeDeactivated })
      .then((res) => {
        if (res?.vendors) {
          setVendorsList(res.vendors);
        } else {
          setVendorsList([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadVendors();
  }, [session, includeDeactivated]);

  // Derived sectors
  const availableSectors = ['All', ...new Set(vendorsList.map((v) => v.sector).filter(Boolean))];

  const filtered = vendorsList.filter((v) => {
    const name = v.legalName || v.company_name || v.name || '';
    const id = v.id || '';
    const gstin = v.syntheticGSTIN || v.gstin || '';
    const district = v.primaryDistrict || v.district || '';
    const sector = v.sector || 'General Civil Works';
    const riskLevel = v.risk_level || v.riskLevel || 'LOW';

    const matchSearch =
      !search ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      id.toLowerCase().includes(search.toLowerCase()) ||
      gstin.toLowerCase().includes(search.toLowerCase()) ||
      district.toLowerCase().includes(search.toLowerCase());

    const matchSector = sectorFilter === 'All' || sector === sectorFilter;
    const matchRisk = riskFilter === 'All' || riskLevel === riskFilter;

    return matchSearch && matchSector && matchRisk;
  });

  const riskCounts = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
  vendorsList.forEach((v) => {
    const lvl = v.risk_level || v.riskLevel || 'LOW';
    if (riskCounts[lvl] !== undefined) riskCounts[lvl]++;
  });

  const canManageVendors = [
    ROLES.DISTRICT_AUTHORITY,
    ROLES.IMPLEMENTING_AGENCY,
    ROLES.STATE_NODAL_AUTHORITY,
    ROLES.CENTRAL_NODAL_AGENCY,
  ].includes(session?.role);

  const isDA = session?.role === ROLES.DISTRICT_AUTHORITY;

  // Handle Create Vendor
  const handleCreateVendor = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formData.company_name || !formData.gstin || !formData.pan) {
      setModalError('Company Name, GSTIN, and PAN are mandatory.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create vendor');
      }

      setShowAddModal(false);
      setFormData({
        company_name: '',
        gstin: '',
        pan: '',
        sector: 'Civil Infrastructure',
        district: session?.district || 'Bhopal',
        state: session?.state || 'Madhya Pradesh',
      });
      loadVendors();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Suspend / Reactivate
  const handleToggleSuspend = async (vendorId, currentActive) => {
    const nextState = !currentActive;
    const promptMsg = nextState
      ? `Reactivate contractor ${vendorId}?`
      : `Suspend contractor ${vendorId}? They will be ineligible for new tenders.`;
    if (!window.confirm(promptMsg)) return;

    try {
      const res = await fetch(`/api/vendors/${vendorId}/suspend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          is_active: nextState,
          reason: nextState ? 'Reactivated by District Authority' : 'Suspended by District Authority',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        loadVendors();
      } else {
        alert(data.error || 'Action failed');
      }
    } catch (err) {
      alert('Network error: ' + err.message);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Contractor & Vendor Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
              Registry
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official implementing contractor registry with 4-dimension risk profiling & statutory compliance tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {canManageVendors && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1F497D] hover:bg-[#16375D] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
              <span>Register Vendor</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>print</span>
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* Risk Summary Badges */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { level: 'CRITICAL', count: riskCounts.CRITICAL, bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
          { level: 'HIGH', count: riskCounts.HIGH, bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
          { level: 'MEDIUM', count: riskCounts.MEDIUM, bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
          { level: 'LOW', count: riskCounts.LOW, bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
        ].map((p) => (
          <button
            key={p.level}
            onClick={() => setRiskFilter(riskFilter === p.level ? 'All' : p.level)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all ${
              riskFilter === p.level
                ? 'ring-2 ring-[#1F497D] border-transparent font-bold'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${p.bg} ${p.text}`}>
              {p.level}
            </span>
            <span className="font-semibold text-slate-800">{p.count}</span>
          </button>
        ))}
        <span className="text-slate-400 text-xs ml-2">
          {vendorsList.length} registered contractors
        </span>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3 top-2 text-slate-400" style={{ fontSize: 16 }}>
            search
          </span>
          <input
            type="text"
            placeholder="Search contractor name, GSTIN, PAN, district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#1F497D] focus:ring-1 focus:ring-[#1F497D] outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">Sector:</span>
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 outline-none focus:border-[#1F497D]"
          >
            {availableSectors.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Container (Fixed: No negative margin) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Vendor ID</th>
                <th className="py-3 px-4">Contractor Name</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Sector</th>
                <th className="py-3 px-4 text-center">Risk Score</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading registered contractors...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No contractors match current criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((v) => {
                  const vendorName = v.legalName || v.company_name || v.name || 'Unnamed Contractor';
                  const gstin = v.syntheticGSTIN || v.gstin || 'N/A';
                  const state = v.registeredState || v.state || '';
                  const district = v.primaryDistrict || v.district || '';
                  const sector = v.sector || 'Civil Infrastructure';
                  const riskScore = v.longitudinal_risk_score ?? 25;
                  const riskLevel = v.risk_level || 'LOW';
                  const isActive = v.is_active !== false;

                  return (
                    <tr
                      key={v.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => navigate(`/vendors/${v.id}`)}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-[#1F497D]">
                        {v.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 leading-tight">
                          {vendorName}
                        </div>
                        <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                          GSTIN: {gstin}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div>{district}</div>
                        <div className="text-[10px] text-slate-400">{state}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {sector}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-slate-900">
                          {riskScore}
                        </span>
                        <span className="text-[10px] text-slate-400">/100</span>
                      </td>
                      <td className="py-3 px-4">
                        <RiskBadge level={riskLevel} />
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {isActive ? 'ACTIVE' : 'SUSPENDED'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => navigate(`/vendors/${v.id}`)}
                            className="px-2 py-1 text-xs text-[#1F497D] hover:bg-blue-50 rounded font-medium transition-colors"
                            title="View Profile & Risk Assessment"
                          >
                            Profile
                          </button>

                          {isDA && (
                            <button
                              onClick={() => handleToggleSuspend(v.id, isActive)}
                              className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
                                isActive
                                  ? 'text-amber-700 hover:bg-amber-50'
                                  : 'text-emerald-700 hover:bg-emerald-50'
                              }`}
                              title={isActive ? 'Suspend Contractor' : 'Reactivate Contractor'}
                            >
                              {isActive ? 'Suspend' : 'Reactivate'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard Vendor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Onboard Implementing Contractor
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Register new commercial vendor into SAKSHAM e-Procurement directory
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateVendor} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Company / Contractor Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Narmada Infra Engineering Works Ltd."
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:border-[#1F497D] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Synthetic GSTIN *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="23TEST1234A1Z5"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:border-[#1F497D] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Synthetic PAN *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="AAAPT1234A"
                    value={formData.pan}
                    onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:border-[#1F497D] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Sector
                  </label>
                  <select
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  >
                    <option value="Civil Infrastructure">Civil Infrastructure</option>
                    <option value="Road Construction">Road Construction</option>
                    <option value="Water Supply">Water Supply</option>
                    <option value="IT Hardware & Telecom">IT Hardware & Telecom</option>
                    <option value="Renewable Power">Renewable Power</option>
                    <option value="Educational Tech">Educational Tech</option>
                    <option value="Bridges & Highways">Bridges & Highways</option>
                  </select>
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

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#1F497D] hover:bg-[#16375D] text-white font-semibold rounded-lg shadow-xs disabled:opacity-60"
                >
                  {submitting ? 'Registering...' : 'Register Contractor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

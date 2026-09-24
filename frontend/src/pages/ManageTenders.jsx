import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RiskBadge from '../components/RiskBadge';
import StatusBadge from '../components/StatusBadge';
import { useAuth, ROLES } from '../auth/AuthContext.jsx';
import { fetchTenders } from '../api/sakshamApi.js';

export default function ManageTenders() {
  const navigate = useNavigate();
  const { session, token } = useAuth();
  const [tendersList, setTendersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedTenderForBid, setSelectedTenderForBid] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Create Tender Form
  const [formData, setFormData] = useState({
    title: '',
    reference_no: '',
    estimated_budget: '',
    district: session?.district || 'Bhopal',
    state: session?.state || 'Madhya Pradesh',
    status: 'PUBLISHED',
  });

  // Bid Form
  const [bidData, setBidData] = useState({
    financial_quote: '',
    technical_score: 88,
  });

  const loadTenders = () => {
    setLoading(true);
    fetchTenders(session)
      .then((res) => {
        if (res?.tenders) {
          setTendersList(res.tenders);
        } else {
          setTendersList([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadTenders();
  }, [session]);

  const isDA = session?.role === ROLES.DISTRICT_AUTHORITY;
  const isIA = session?.role === ROLES.IMPLEMENTING_AGENCY;
  const isVendor = session?.role === ROLES.VENDOR;
  const canCreateTender = isDA || isIA;

  // Filtered tenders
  const filtered = tendersList.filter((t) => {
    const id = t.id || '';
    const ref = t.reference_no || '';
    const title = t.title || '';
    const district = t.district || '';
    const state = t.state || '';
    const status = t.status || 'OPEN';

    const matchSearch =
      !search ||
      id.toLowerCase().includes(search.toLowerCase()) ||
      ref.toLowerCase().includes(search.toLowerCase()) ||
      title.toLowerCase().includes(search.toLowerCase()) ||
      district.toLowerCase().includes(search.toLowerCase()) ||
      state.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PUBLISHED' && ['PUBLISHED', 'OPEN', 'CLOSING_SOON'].includes(status)) ||
      (statusFilter === 'EVALUATION' && ['EVALUATION_PENDING', 'TECHNICAL_EVALUATION', 'COMMERCIAL_EVALUATION', 'AWARD_PENDING'].includes(status)) ||
      (statusFilter === 'AWARDED' && status === 'AWARDED');

    return matchSearch && matchStatus;
  });

  // Handle Create Tender
  const handleCreateTender = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formData.title || !formData.reference_no || !formData.estimated_budget) {
      setModalError('Title, Reference Number, and Budget are required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/tenders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create tender');
      }

      setShowCreateModal(false);
      setFormData({
        title: '',
        reference_no: '',
        estimated_budget: '',
        district: session?.district || 'Bhopal',
        state: session?.state || 'Madhya Pradesh',
        status: 'PUBLISHED',
      });
      loadTenders();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Submit Bid
  const handleSubmitBid = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!bidData.financial_quote) {
      setModalError('Financial quote is required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/tenders/${selectedTenderForBid.id}/bids`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          financial_quote: bidData.financial_quote,
          technical_score: bidData.technical_score,
          vendor_id: session?.vendorId,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit bid');
      }

      setShowBidModal(false);
      setSelectedTenderForBid(null);
      setBidData({ financial_quote: '', technical_score: 88 });
      alert('Bid submitted successfully and recorded on immutable audit trail!');
      loadTenders();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Tender Management & Procurement Lifecycle
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
              e-Procurement Portal
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Two-bid technical procurements, bidder submissions, comparative statements, and statutory award workflows.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {canCreateTender && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#047857] hover:bg-[#065F46] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
              <span>Create Tender</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>print</span>
            <span className="hidden sm:inline">Print Register</span>
          </button>
        </div>
      </div>

      {/* Tender Lifecycle Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        {[
          { key: 'ALL', label: 'All Procurements', count: tendersList.length },
          { key: 'PUBLISHED', label: 'Active & Open Bids', count: tendersList.filter((t) => ['PUBLISHED', 'OPEN', 'CLOSING_SOON'].includes(t.status)).length },
          { key: 'EVALUATION', label: 'Under Technical / Commercial Eval', count: tendersList.filter((t) => ['EVALUATION_PENDING', 'TECHNICAL_EVALUATION', 'COMMERCIAL_EVALUATION', 'AWARD_PENDING'].includes(t.status)).length },
          { key: 'AWARDED', label: 'Awarded Contracts', count: tendersList.filter((t) => t.status === 'AWARDED').length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 ${
              statusFilter === tab.key
                ? 'bg-[#047857] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] ${
                statusFilter === tab.key ? 'bg-emerald-800 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-96">
          <span className="material-symbols-outlined absolute left-3 top-2 text-slate-400" style={{ fontSize: 16 }}>
            search
          </span>
          <input
            type="text"
            placeholder="Search tender by title, reference no, district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#047857] focus:ring-1 focus:ring-[#047857] outline-none transition-colors"
          />
        </div>
        <div className="text-xs text-slate-400 hidden sm:block">
          Showing {filtered.length} tenders
        </div>
      </div>

      {/* Tenders Table Container (Fixed: No -mx-6) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Tender ID</th>
                <th className="py-3 px-4">Reference No.</th>
                <th className="py-3 px-4">Title / Scope</th>
                <th className="py-3 px-4">District / State</th>
                <th className="py-3 px-4">Estimated Outlay</th>
                <th className="py-3 px-4">Awarded Contractor</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading authoritative procurement records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No tenders match the current criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const ref = t.reference_no || 'N/A';
                  const budget = Number(t.estimated_budget || 0);
                  const isPublished = ['PUBLISHED', 'OPEN', 'CLOSING_SOON'].includes(t.status);

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => navigate(`/tenders/${t.id}`)}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-[#047857]">
                        {t.id}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {ref}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 max-w-sm leading-tight">
                          {t.title}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div>{t.district || 'All Districts'}</div>
                        <div className="text-[10px] text-slate-400">{t.state || ''}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        ₹{budget.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        {t.awarded_vendor_id ? (
                          <span className="font-mono text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            {t.awarded_vendor_id}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            Open for Bids
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={t.status || 'PUBLISHED'} />
                      </td>
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => navigate(`/tenders/${t.id}`)}
                            className="px-2 py-1 text-xs text-[#1F497D] hover:bg-blue-50 rounded font-medium transition-colors"
                          >
                            Details
                          </button>

                          {/* Vendor Submit Bid Shortcut */}
                          {isVendor && isPublished && (
                            <button
                              onClick={() => {
                                setSelectedTenderForBid(t);
                                setShowBidModal(true);
                              }}
                              className="px-2 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium transition-colors shadow-xs"
                            >
                              Bid Now
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

      {/* Create Tender Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Create New Tender Notice
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Prepare technical and commercial bid specification for MPLADS execution
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
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

            <form onSubmit={handleCreateTender} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tender Title / Scope of Work *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Construction of Community Resource Centre - Package III"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:border-[#047857] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Reference Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="MP/BPL/PWD/2026/04"
                    value={formData.reference_no}
                    onChange={(e) => setFormData({ ...formData, reference_no: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:border-[#047857] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Estimated Outlay (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="3500000"
                    value={formData.estimated_budget}
                    onChange={(e) => setFormData({ ...formData, estimated_budget: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:border-[#047857] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white outline-none"
                  >
                    <option value="PUBLISHED">Publish Notice (Open for Bids)</option>
                    <option value="DRAFT">Save as Draft</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#047857] hover:bg-[#065F46] text-white font-semibold rounded-lg shadow-xs disabled:opacity-60"
                >
                  {submitting ? 'Creating...' : 'Create & Publish Tender'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Bid Modal (for Vendors) */}
      {showBidModal && selectedTenderForBid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Submit Bid Participation
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                  {selectedTenderForBid.reference_no}
                </p>
              </div>
              <button
                onClick={() => setShowBidModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <div className="font-semibold text-slate-900">{selectedTenderForBid.title}</div>
              <div className="text-slate-500 mt-1">
                Estimated Outlay: ₹{Number(selectedTenderForBid.estimated_budget || 0).toLocaleString('en-IN')}
              </div>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSubmitBid} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Financial Quote (₹) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 3350000"
                  value={bidData.financial_quote}
                  onChange={(e) => setBidData({ ...bidData, financial_quote: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:border-emerald-600 outline-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Self-Declared Technical Compliance Score (0–100)
                </label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={bidData.technical_score}
                  onChange={(e) => setBidData({ ...bidData, technical_score: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white outline-none font-mono"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
                <strong>Statutory Declaration:</strong> By submitting, contractor certifies compliance with GFR Rule 144(xi) and non-debarment under Section 151 of GFR 2017.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBidModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#047857] hover:bg-[#065F46] text-white font-semibold rounded-lg shadow-xs disabled:opacity-60"
                >
                  {submitting ? 'Submitting...' : 'Submit Sealed Bid'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

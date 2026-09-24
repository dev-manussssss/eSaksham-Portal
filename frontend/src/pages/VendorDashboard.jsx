import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { fetchVendorById, fetchProjects, fetchTenders } from '../api/sakshamApi.js';
import StatusBadge from '../components/StatusBadge';
import RiskBadge from '../components/RiskBadge';

export default function VendorDashboard() {
  const navigate = useNavigate();
  const { session, token } = useAuth();

  const targetVendorId = session?.vendorId || 'VND-001';
  const [vendor, setVendor] = useState(null);
  const [myProjects, setMyProjects] = useState([]);
  const [openTenders, setOpenTenders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bid submission modal state
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedTender, setSelectedTender] = useState(null);
  const [bidQuote, setBidQuote] = useState('');
  const [submittingBid, setSubmittingBid] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetchVendorById(targetVendorId, session).catch(() => ({ vendor: null })),
      fetchProjects(session).catch(() => ({ projects: [] })),
      fetchTenders(session).catch(() => ({ tenders: [] })),
    ]).then(([vRes, pRes, tRes]) => {
      if (vRes?.vendor) setVendor(vRes.vendor);
      if (pRes?.projects) {
        // Filter projects assigned to this vendor
        const assigned = pRes.projects.filter(
          (p) => p.vendor_id === targetVendorId || !session?.vendorId
        );
        setMyProjects(assigned);
      }
      if (tRes?.tenders) {
        // Open tenders available for bidding
        const open = tRes.tenders.filter((t) =>
          ['PUBLISHED', 'OPEN', 'CLOSING_SOON'].includes(t.status)
        );
        setOpenTenders(open);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, [targetVendorId, session]);

  const handleOpenBid = (tender) => {
    setSelectedTender(tender);
    setBidQuote('');
    setShowBidModal(true);
  };

  const handleSubmitBid = async (e) => {
    e.preventDefault();
    if (!bidQuote || !selectedTender) return;

    setSubmittingBid(true);
    try {
      const res = await fetch(`/api/tenders/${selectedTender.id}/bids`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          financial_quote: bidQuote,
          technical_score: 90,
          vendor_id: targetVendorId,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowBidModal(false);
        alert('Bid submitted successfully and registered on the immutable audit trail!');
        loadData();
      } else {
        alert(data.error || 'Bid submission failed');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSubmittingBid(false);
    }
  };

  const vendorName = vendor?.company_name || vendor?.name || 'Aarya Infraworks Private Limited';
  const gstin = vendor?.gstin || '23TEST0001A1Z5';
  const pan = vendor?.pan || 'AAAPT0001A';
  const riskScore = vendor?.longitudinal_risk_score ?? 34;
  const riskLevel = vendor?.risk_level || 'LOW';

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Contractor &amp; Vendor Console
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1F497D] text-xs font-mono font-bold">
              {targetVendorId}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {vendorName} · Sector: <strong className="text-slate-700">{vendor?.sector || 'Civil Infrastructure'}</strong> · State: <strong className="text-slate-700">{vendor?.state || 'Madhya Pradesh'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => navigate(`/vendors/${targetVendorId}`)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1F497D] hover:bg-[#16375D] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>badge</span>
            <span>Corporate Risk Profile</span>
          </button>
        </div>
      </div>

      {/* Compliance & Risk Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
            Vendor SAKSHAM Compliance Status
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg sm:text-xl font-bold text-slate-900">{vendorName}</span>
            <RiskBadge level={riskLevel} />
          </div>
          <div className="text-xs text-slate-500 font-mono">
            GSTIN: <span className="font-semibold text-slate-700">{gstin}</span> · PAN:{' '}
            <span className="font-semibold text-slate-700">{pan}</span> · Turnover Band:{' '}
            <span className="font-semibold text-slate-700">₹25–50 Crore</span>
          </div>
        </div>

        <div className="flex items-center gap-8 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-8 shrink-0">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SAKSHAM Risk Score</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5 font-mono">
              {riskScore}<span className="text-xs text-slate-400 font-normal">/100</span>
            </div>
            <div className="text-[10px] text-emerald-700 font-medium">Eligible for public tenders</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Contracts</div>
            <div className="text-2xl font-bold text-blue-700 mt-0.5 font-mono">
              {myProjects.length}
            </div>
            <div className="text-[10px] text-slate-500">Under implementation</div>
          </div>
        </div>
      </div>

      {/* Contracted Schemes & Physical Progress */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Contracted Schemes &amp; Physical Progress ({myProjects.length})
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Awarded work orders linked to e-SAKSHI execution and Measurement Books
            </p>
          </div>
          <button
            onClick={() => navigate('/work-progress')}
            className="text-xs font-semibold text-[#1F497D] hover:underline"
          >
            Measurement Book →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Work Code</th>
                <th className="py-3 px-4">Scheme Title</th>
                <th className="py-3 px-4">Contract Amount</th>
                <th className="py-3 px-4">Disbursed</th>
                <th className="py-3 px-4">Physical Progress</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {myProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No active works currently contracted to this vendor.
                  </td>
                </tr>
              ) : (
                myProjects.map((p) => (
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
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      ₹{Number(p.sanctioned_amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-700 font-semibold">
                      ₹{Number(p.released_amount || 0).toLocaleString('en-IN')}
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
                        Inspect Work
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Open Tender Opportunities for Bidding */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Open Tender Notices &amp; Bidding Opportunities ({openTenders.length})
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Active two-bid technical tenders open for qualified contractor participation
            </p>
          </div>
          <button
            onClick={() => navigate('/tenders')}
            className="text-xs font-semibold text-[#047857] hover:underline"
          >
            All Opportunities →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Reference No.</th>
                <th className="py-3 px-4">Tender Title / Scope</th>
                <th className="py-3 px-4">District / State</th>
                <th className="py-3 px-4">Estimated Outlay</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {openTenders.slice(0, 5).map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-mono font-bold text-[#047857]">
                    {t.reference_no}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 max-w-sm truncate">
                      {t.title}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {t.district}, {t.state}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    ₹{Number(t.estimated_budget || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={t.status || 'PUBLISHED'} />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleOpenBid(t)}
                      className="px-3 py-1 bg-[#047857] hover:bg-[#065F46] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                    >
                      Bid Now
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bid Modal */}
      {showBidModal && selectedTender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Submit Bid Participation</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedTender.reference_no}</p>
              </div>
              <button onClick={() => setShowBidModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <div className="font-semibold text-slate-900">{selectedTender.title}</div>
              <div className="text-slate-500 mt-1 font-mono">
                Estimated Outlay: ₹{Number(selectedTender.estimated_budget || 0).toLocaleString('en-IN')}
              </div>
            </div>

            <form onSubmit={handleSubmitBid} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Financial Quote (₹) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 4850000"
                  value={bidQuote}
                  onChange={(e) => setBidQuote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:border-[#047857] outline-none font-mono text-sm"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900">
                <strong>Statutory Compliance:</strong> Bidding as authorized contractor <strong>{vendorName}</strong> ({targetVendorId}). Sealed financial quote will be evaluated in comparative statement.
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
                  disabled={submittingBid}
                  className="px-4 py-2 bg-[#047857] hover:bg-[#065F46] text-white font-semibold rounded-lg shadow-xs disabled:opacity-60"
                >
                  {submittingBid ? 'Submitting...' : 'Submit Sealed Bid'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

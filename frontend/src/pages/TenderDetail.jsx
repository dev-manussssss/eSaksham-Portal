import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import RiskBadge from '../components/RiskBadge';
import StatusBadge from '../components/StatusBadge';
import { useAuth, ROLES } from '../auth/AuthContext.jsx';
import { fetchTenderDetails } from '../api/sakshamApi.js';

export default function TenderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session, token } = useAuth();

  const [tender, setTender] = useState(null);
  const [bids, setBids] = useState([]);
  const [awardedVendor, setAwardedVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [awarding, setAwarding] = useState(false);

  // Vendor bid submission modal on detail page
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidQuote, setBidQuote] = useState('');
  const [techScore, setTechScore] = useState(88);
  const [submittingBid, setSubmittingBid] = useState(false);

  const loadData = () => {
    setLoading(true);
    fetchTenderDetails(id, session)
      .then((res) => {
        if (res?.tender) {
          setTender(res.tender);
          setBids(res.tender.bids || []);
          setAwardedVendor(res.tender.vendors || null);
        } else {
          setError('Tender details not found');
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [id, session]);

  const isDA = session?.role === ROLES.DISTRICT_AUTHORITY;
  const isIA = session?.role === ROLES.IMPLEMENTING_AGENCY;
  const isVendor = session?.role === ROLES.VENDOR;
  const canAward = isDA || isIA;

  // Handle Award
  const handleAward = async (bid) => {
    const vendorId = bid.bid_participants?.[0]?.vendor_id || bid.vendor_id;
    if (!vendorId) {
      alert('Cannot award: contractor identifier missing on bid.');
      return;
    }

    if (!window.confirm(`Award tender ${tender.reference_no} to contractor ${vendorId} for ₹${Number(bid.financial_quote).toLocaleString('en-IN')}?`)) {
      return;
    }

    setAwarding(true);
    try {
      const res = await fetch(`/api/tenders/${id}/award`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bid_id: bid.id,
          vendor_id: vendorId,
          award_notes: `Statutory contract awarded under Rule 173 of GFR 2017 to lowest qualified bidder ${vendorId}`,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('Tender successfully awarded! Audit event recorded.');
        loadData();
      } else {
        alert(data.error || 'Failed to award tender');
      }
    } catch (err) {
      alert('Network error: ' + err.message);
    } finally {
      setAwarding(false);
    }
  };

  // Handle Submit Bid
  const handleVendorBid = async (e) => {
    e.preventDefault();
    if (!bidQuote) return;

    setSubmittingBid(true);
    try {
      const res = await fetch(`/api/tenders/${id}/bids`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          financial_quote: bidQuote,
          technical_score: techScore,
          vendor_id: session?.vendorId,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowBidModal(false);
        setBidQuote('');
        alert('Bid submitted successfully!');
        loadData();
      } else {
        alert(data.error || 'Bid submission failed');
      }
    } catch (err) {
      alert('Error submitting bid: ' + err.message);
    } finally {
      setSubmittingBid(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-xs">
        Loading authoritative procurement specifications...
      </div>
    );
  }

  if (error || !tender) {
    return (
      <div className="py-12 text-center text-red-600 text-xs">
        {error || 'Tender record not found.'}
        <div className="mt-2">
          <Link to="/tenders" className="text-[#1F497D] underline">Return to Tenders</Link>
        </div>
      </div>
    );
  }

  const budget = Number(tender.estimated_budget || 0);
  const isPublished = ['PUBLISHED', 'OPEN', 'CLOSING_SOON'].includes(tender.status);

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/tenders" className="hover:text-[#1F497D] transition-colors">e-Procurement</Link>
        <span>/</span>
        <span className="font-mono text-slate-600">{tender.id}</span>
      </div>

      {/* Tender Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 font-bold">
              {tender.id}
            </span>
            <span className="text-xs text-slate-500 font-mono">{tender.reference_no}</span>
            <StatusBadge status={tender.status || 'PUBLISHED'} />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {tender.title}
          </h1>
          <p className="text-xs text-slate-500">
            Jurisdiction: <span className="font-medium text-slate-700">{tender.district || 'All Districts'}, {tender.state}</span> · Scheme: <span className="font-medium text-slate-700">MPLADS Works</span>
          </p>
        </div>

        <div className="flex items-center gap-6 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6 shrink-0">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimated Outlay</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5 font-mono">
              ₹{budget.toLocaleString('en-IN')}
            </div>
          </div>

          {isVendor && isPublished && (
            <button
              onClick={() => setShowBidModal(true)}
              className="px-4 py-2 bg-[#047857] hover:bg-[#065F46] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>how_to_reg</span>
              <span>Submit Sealed Bid</span>
            </button>
          )}
        </div>
      </div>

      {/* Comparative Statement Table (AUD-011) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Comparative Statement & Submitted Bids ({bids.length})
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Two-bid commercial quotes evaluated against approved administrative estimate
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            GFR Rule 173 Compliant
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Bid Ref</th>
                <th className="py-3 px-4">Contractor / Participant</th>
                <th className="py-3 px-4 text-center">Tech Score</th>
                <th className="py-3 px-4">Financial Quote</th>
                <th className="py-3 px-4">Variance from Estimate</th>
                <th className="py-3 px-4">Status</th>
                {canAward && <th className="py-3 px-4 text-center">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {bids.length === 0 ? (
                <tr>
                  <td colSpan={canAward ? 7 : 6} className="py-10 text-center text-slate-400">
                    No bids submitted yet for this tender notice.
                  </td>
                </tr>
              ) : (
                bids.map((b) => {
                  const quote = Number(b.financial_quote || 0);
                  const diff = quote - budget;
                  const diffPct = budget > 0 ? ((diff / budget) * 100).toFixed(1) : 0;
                  const isSelected = b.status === 'SELECTED' || tender.awarded_vendor_id === (b.bid_participants?.[0]?.vendor_id || b.vendor_id);
                  const leadVendor = b.bid_participants?.[0]?.vendors;
                  const vendorId = b.bid_participants?.[0]?.vendor_id || b.vendor_id || 'N/A';

                  return (
                    <tr key={b.id} className={isSelected ? 'bg-emerald-50/60 font-semibold' : 'hover:bg-slate-50/80'}>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {b.bid_reference}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {leadVendor?.company_name || vendorId}
                        </div>
                        <div className="font-mono text-[10px] text-slate-400">
                          ID: {vendorId} {leadVendor?.gstin ? `· ${leadVendor.gstin}` : ''}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800">
                        {b.technical_score || 85}/100
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        ₹{quote.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">
                        <span className={diff <= 0 ? 'text-emerald-700' : 'text-amber-700'}>
                          {diff <= 0 ? `${diffPct}% (Below)` : `+${diffPct}% (Above)`}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            isSelected
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {isSelected ? 'L1 AWARDED' : b.status || 'QUALIFIED'}
                        </span>
                      </td>
                      {canAward && (
                        <td className="py-3 px-4 text-center">
                          {tender.status !== 'AWARDED' ? (
                            <button
                              onClick={() => handleAward(b)}
                              disabled={awarding}
                              className="px-2.5 py-1 bg-[#047857] hover:bg-[#065F46] text-white text-xs font-semibold rounded shadow-xs transition-colors disabled:opacity-60"
                            >
                              Award Contract
                            </button>
                          ) : isSelected ? (
                            <span className="text-[11px] text-emerald-700 font-semibold">Award Finalized</span>
                          ) : (
                            <span className="text-[11px] text-slate-400">Not Awarded</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Awarded Contract Summary */}
      {tender.awarded_vendor_id && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: 24 }}>verified</span>
            <div>
              <div className="text-xs font-bold text-emerald-900">
                Statutory Contract Finalized: {tender.awarded_vendor_id}
              </div>
              <div className="text-[11px] text-emerald-700 mt-0.5">
                Work execution initiated under e-SAKSHI project linkage. Measurement book and milestone tracking active.
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/projects')}
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
          >
            View in Works Register →
          </button>
        </div>
      )}

      {/* Submit Bid Modal */}
      {showBidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Submit Bid Participation
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{tender.reference_no}</p>
              </div>
              <button onClick={() => setShowBidModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
              </button>
            </div>

            <form onSubmit={handleVendorBid} className="space-y-3.5 text-xs">
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:border-emerald-600 outline-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Technical Compliance Self-Score (50–100)
                </label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={techScore}
                  onChange={(e) => setTechScore(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white outline-none font-mono"
                />
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

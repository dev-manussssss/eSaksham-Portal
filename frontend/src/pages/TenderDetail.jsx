import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import RiskBadge from '../components/RiskBadge';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../auth/AuthContext.jsx';
import { fetchTenderDetails } from '../api/sakshamApi.js';

export default function TenderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();

  const [tender, setTender] = useState(null);
  const [awardedVendor, setAwardedVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchTenderDetails(id, session)
      .then((res) => {
        if (!isMounted) return;
        if (res?.tender) {
          setTender(res.tender);
          setAwardedVendor(res.awarded_vendor || null);
        } else {
          setError('Tender details not found');
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, session]);

  if (loading) {
    return (
      <div className="py-20 text-center text-text-muted text-xs">
        Loading authoritative tender details from database...
      </div>
    );
  }

  if (error || !tender) {
    return (
      <div className="py-12 text-center text-rose-600 text-xs">
        {error || 'Tender record not found.'}
        <div className="mt-2">
          <Link to="/tenders" className="text-primary underline">Return to Tenders</Link>
        </div>
      </div>
    );
  }

  const budget = Number(tender.estimated_budget || tender.estimated_amount || 0);

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-2 text-xs text-text-muted">
        <Link to="/tenders" className="hover:text-primary transition-colors">Manage Tenders</Link>
        <span>/</span>
        <span className="font-mono text-text-secondary">{tender.id}</span>
      </div>

      {/* Header Profile Card */}
      <div className="saksham-card flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
              {tender.id}
            </span>
            <span className="text-xs text-text-muted font-mono">{tender.reference_no}</span>
            <StatusBadge status={tender.status || 'OPEN'} />
          </div>
          <h1 className="font-semibold text-text-primary tracking-tight text-xl md:text-2xl">
            {tender.title}
          </h1>
          <p className="text-text-secondary text-xs">
            Location: <span className="font-medium text-text-primary">{tender.district || 'District'}, {tender.state || 'India'}</span>
          </p>
        </div>

        <div className="flex items-center gap-6 border-t lg:border-t-0 lg:border-l border-border-subtle pt-4 lg:pt-0 lg:pl-6 shrink-0">
          <div className="flex flex-col">
            <span className="text-xs text-text-muted uppercase font-semibold">Tender Risk Level</span>
            <div className="mt-1">
              <RiskBadge level={tender.risk_level || 'LOW'} />
            </div>
          </div>
          <div className="flex flex-col border-l border-border-subtle pl-4">
            <span className="text-xs text-text-muted uppercase font-semibold">Estimated Budget</span>
            <span className="font-mono text-xl font-bold text-text-primary mt-1">
              ₹{budget.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Guardrail Callout */}
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed">
        <span className="font-bold">Authoritative Procurement Notice:</span> This tender operates under Central Vigilance Commission (CVC) guidelines for public procurement. SAKSHAM monitors cartel risks, bid-timing clustering, and single-bidder repetition across connected agencies.
      </div>

      {/* Awarded Vendor Card */}
      <div className="saksham-card">
        <h2 className="font-semibold text-text-primary text-sm uppercase tracking-wider mb-4">
          Contractor & Award Status
        </h2>

        {awardedVendor ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border-subtle bg-slate-50">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-text-primary">
                  {awardedVendor.company_name || awardedVendor.name}
                </span>
                <span className="font-mono text-xs text-text-muted bg-white px-2 py-0.5 rounded border border-border-subtle">
                  {awardedVendor.id}
                </span>
              </div>
              <div className="text-xs text-text-muted mt-1">
                GSTIN: <span className="font-mono">{awardedVendor.gstin}</span> · {awardedVendor.district}, {awardedVendor.state}
              </div>
            </div>

            <button
              className="btn-secondary text-xs"
              onClick={() => navigate(`/vendors/${awardedVendor.id}`)}
            >
              View Contractor Profile & Risk
            </button>
          </div>
        ) : (
          <div className="py-6 text-center text-text-muted text-xs bg-slate-50 rounded-lg">
            No contractor has been awarded this tender yet. Evaluation or bidding in progress.
          </div>
        )}
      </div>
    </div>
  );
}

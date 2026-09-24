import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../auth/AuthContext.jsx';
import { fetchTenders, fetchVendors } from '../api/sakshamApi.js';
import StatusBadge from '../components/StatusBadge';
import RiskBadge from '../components/RiskBadge';

export default function ProcurementDashboard() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [tenders, setTenders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchTenders(session), fetchVendors(session)])
      .then(([tRes, vRes]) => {
        setTenders(tRes?.tenders || []);
        setVendors(vRes?.vendors || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Procurement dashboard load error:', err);
        setLoading(false);
      });
  }, [session]);

  const publishedCount = tenders.filter((t) => ['PUBLISHED', 'OPEN'].includes(t.status)).length;
  const closingSoonCount = tenders.filter((t) => t.status === 'CLOSING_SOON').length;
  const evaluationCount = tenders.filter((t) =>
    ['EVALUATION_PENDING', 'TECHNICAL_EVALUATION', 'COMMERCIAL_EVALUATION'].includes(t.status)
  ).length;
  const awardedCount = tenders.filter((t) => t.status === 'AWARDED').length;

  const totalEstimatedOutlay = tenders.reduce(
    (acc, t) => acc + Number(t.estimated_budget || 0),
    0
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              e-Procurement Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
              Tender & Contract Authority
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Executive oversight of two-bid technical tenders, bidder discovery, evaluation stages, and contract awards.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => navigate('/tenders')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#047857] hover:bg-[#065F46] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
            <span>New Tender Notice</span>
          </button>
        </div>
      </div>

      {/* Practical Operational Summary Cards (Section 7) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Active Tenders (Bidding)
            </span>
            <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: 18 }}>
              campaign
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1.5 font-mono">
            {publishedCount + closingSoonCount}
          </div>
          <div className="text-[10px] text-emerald-700 mt-1 font-medium">
            {closingSoonCount > 0 ? `${closingSoonCount} closing soon` : 'Accepting sealed bids'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Evaluations Pending
            </span>
            <span className="material-symbols-outlined text-amber-600" style={{ fontSize: 18 }}>
              rule
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1.5 font-mono">
            {evaluationCount}
          </div>
          <div className="text-[10px] text-amber-700 mt-1 font-medium">
            Technical & commercial scrutiny
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Awarded Contracts
            </span>
            <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 18 }}>
              handshake
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1.5 font-mono">
            {awardedCount}
          </div>
          <div className="text-[10px] text-blue-700 mt-1 font-medium">
            Linked to e-SAKSHI execution
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Tender Outlay
            </span>
            <span className="material-symbols-outlined text-slate-500" style={{ fontSize: 18 }}>
              payments
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1.5 font-mono">
            ₹{(totalEstimatedOutlay / 10000000).toFixed(2)} Cr
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Across {tenders.length} notices
          </div>
        </div>
      </div>

      {/* Main Grid: Tenders Requiring Action + High-Risk Bidders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Tenders Master Register */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Procurements in Progress & Recent Notices
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Two-bid technical and commercial tenders across districts
              </p>
            </div>
            <button
              onClick={() => navigate('/tenders')}
              className="text-xs font-semibold text-[#047857] hover:underline"
            >
              View All Tenders →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Tender Ref</th>
                  <th className="py-3 px-4">Work Scope</th>
                  <th className="py-3 px-4">Outlay</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {tenders.slice(0, 6).map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-50/80 cursor-pointer"
                    onClick={() => navigate(`/tenders/${t.id}`)}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-[#047857]">
                      <div>{t.reference_no}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{t.district}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 max-w-xs truncate">
                        {t.title}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      ₹{Number(t.estimated_budget || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={t.status || 'PUBLISHED'} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/tenders/${t.id}`);
                        }}
                        className="px-2.5 py-1 text-xs text-[#047857] hover:bg-emerald-50 rounded font-medium transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Contractor Directory & Risk Triage */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Contractor Risk Triage
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  SAKSHAM multi-factor contractor scoring
                </p>
              </div>
              <button
                onClick={() => navigate('/vendors')}
                className="text-[11px] font-semibold text-[#1F497D] hover:underline"
              >
                All ({vendors.length})
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {vendors.slice(0, 4).map((v) => (
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
                    <RiskBadge level={v.risk_level || 'LOW'} />
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                      Score: {v.longitudinal_risk_score}/100
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>gavel</span>
              <span>GeM & GFR 2017 Compatibility</span>
            </div>
            <p className="text-emerald-800 text-[11px] mt-1 leading-relaxed">
              Standardized two-bid evaluation criteria conforming to Rule 163 (Goods) & Rule 173 (Works). AI detects cartelization patterns and bid-clustering without automated blocking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Reports() {
  const { session } = useAuth();
  const [selectedYear, setSelectedYear] = useState('2025-26');
  const [filterType, setFilterType] = useState('ALL');

  const reportCards = [
    {
      id: 'REP-01',
      title: 'MPLADS Annual Expenditure & Utilization Register',
      code: 'FORM-III / STATUTORY',
      description: 'Comprehensive account of funds sanctioned, expenditure incurred, and unspent balances under MPLADS guidelines.',
      category: 'FINANCIAL',
      period: 'FY 2025-26',
      generatedDate: '12-Sep-2026',
      frequency: 'Annual / Quarterly',
    },
    {
      id: 'REP-02',
      title: 'District Monthly Progress Report (MPR)',
      code: 'SCHEME-MPR-D19',
      description: 'Physical progress milestones, site inspection summaries, and completion certificates by Implementing Agency.',
      category: 'PHYSICAL',
      period: 'August 2026',
      generatedDate: '01-Sep-2026',
      frequency: 'Monthly',
    },
    {
      id: 'REP-03',
      title: 'Vendor Longitudinal Risk & Performance Audit',
      code: 'AUDIT-VND-EVAL',
      description: '4-dimension risk analysis, overbilling indicators, delay trends, and blacklist status across contractors.',
      category: 'AUDIT',
      period: 'Active Works',
      generatedDate: '12-Sep-2026',
      frequency: 'On-Demand',
    },
    {
      id: 'REP-04',
      title: 'Statutory Anomaly & Evidence Investigation Briefing',
      code: 'VIGILANCE-INTEL',
      description: 'Measurement Book (MB) vs Invoice quantity discrepancies, AI flag logs, and human-in-the-loop decision trails.',
      category: 'AUDIT',
      period: 'Active Investigations',
      generatedDate: '12-Sep-2026',
      frequency: 'Real-time',
    },
    {
      id: 'REP-05',
      title: 'Constituency Recommended Works Master Register',
      code: 'MP-RECOM-REG',
      description: 'Detailed list of MP recommendations, administrative sanctions, and pending technical approvals.',
      category: 'SCHEME',
      period: '18th Lok Sabha',
      generatedDate: '10-Sep-2026',
      frequency: 'Session-wise',
    },
  ];

  const filteredReports = reportCards.filter(r => {
    if (filterType === 'ALL') return true;
    return r.category === filterType;
  });

  const handleDownloadStub = (title) => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-border-subtle p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: 24 }}>assessment</span>
              <h1 className="text-xl font-bold text-text-primary">Statutory & Scheme Reports</h1>
            </div>
            <p className="text-xs text-text-secondary">
              Official MPLADS scheme audit summaries, expenditure registers, and district-level performance documentation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              aria-label="Filter by Financial Year"
              className="text-xs bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-medium text-text-primary focus:outline-none focus:border-primary"
            >
              <option value="2025-26">FY 2025-26</option>
              <option value="2024-25">FY 2024-25</option>
              <option value="2023-24">FY 2023-24</option>
            </select>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>print</span>
              <span>Print Register</span>
            </button>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-border-subtle">
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mr-2">Category:</span>
          {['ALL', 'FINANCIAL', 'PHYSICAL', 'AUDIT', 'SCHEME'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterType(cat)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                filterType === cat
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="bg-white rounded-xl border border-border-subtle p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {report.code}
                </span>
                <span className="text-[10px] text-text-muted">
                  Updated: {report.generatedDate}
                </span>
              </div>
              <h3 className="text-sm font-bold text-text-primary mb-1.5">{report.title}</h3>
              <p className="text-xs text-text-secondary leading-relaxed mb-4">
                {report.description}
              </p>
            </div>

            <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
              <div className="text-[11px] text-slate-500">
                <span>Period: <strong className="text-slate-700">{report.period}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadStub(report.title)}
                  className="px-2.5 py-1 text-xs font-medium text-primary hover:bg-blue-50 rounded transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>visibility</span>
                  <span>View</span>
                </button>
                <button
                  onClick={() => handleDownloadStub(report.title)}
                  className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>download</span>
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Authority Certification Note */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs text-slate-600 flex items-start gap-3">
        <span className="material-symbols-outlined text-slate-400 mt-0.5" style={{ fontSize: 18 }}>info</span>
        <div>
          <span className="font-semibold text-slate-700">Official Certification Notice:</span> All reports generated within the SAKSHAM Decision-Support System reflect authoritative data synchronized from the Ministry of Statistics and Programme Implementation (MoSPI) and designated District Authorities.
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../auth/AuthContext.jsx';
import { fetchProjects } from '../api/sakshamApi.js';

export default function FundDisbursement() {
  const navigate = useNavigate();
  const { session } = useAuth();

  const [projectsList, setProjectsList] = useState([]);
  const [selectedProjId, setSelectedProjId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchProjects(session)
      .then((res) => {
        if (!isMounted) return;
        if (res?.projects && res.projects.length > 0) {
          setProjectsList(res.projects);
          setSelectedProjId(res.projects[0].id);
        } else {
          setProjectsList([]);
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
  }, [session]);

  const selectedProj = projectsList.find((p) => p.id === selectedProjId) || projectsList[0];

  if (loading) {
    return (
      <div className="py-20 text-center text-text-muted text-xs">
        Loading authoritative disbursement ledgers from database...
      </div>
    );
  }

  const sanctioned = Number(selectedProj?.sanctioned_amount || 0);
  const disbursed = Number(selectedProj?.disbursed_amount || 0);
  const unspent = Math.max(0, sanctioned - disbursed);
  const disbursalPct = sanctioned > 0 ? Math.round((disbursed / sanctioned) * 100) : 0;

  // Statutory Deductions (Rule 144 GFR)
  const securityDeposit = Math.round(disbursed * 0.05);
  const itTds = Math.round(disbursed * 0.02);
  const gstTds = Math.round(disbursed * 0.02);
  const netLiquid = disbursed - (securityDeposit + itTds + gstTds);

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-text-primary tracking-tight text-2xl">
              Fund Disbursement &amp; Expenditure Gateway
            </h1>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-semibold">
              PFMS-SNA Electronic Settlement
            </span>
          </div>
          <p className="text-text-secondary mt-0.5 text-xs">
            Milestone-linked public fund releases, statutory GFR deductions, and PFMS Treasury reconciliation.
          </p>
        </div>

        {/* Quick Project Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-text-muted font-medium">Select Work:</label>
          <select
            className="saksham-input text-xs max-w-xs font-medium"
            value={selectedProjId || ''}
            onChange={(e) => setSelectedProjId(e.target.value)}
          >
            {projectsList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.project_code || p.id}: {p.title.slice(0, 30)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedProj && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-border-subtle p-5 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Total Sanctioned</span>
              <div className="text-xl font-bold font-mono text-text-primary mt-1">
                ₹{sanctioned.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-text-muted mt-1 block">Approved Administrative Sanction</span>
            </div>

            <div className="bg-white rounded-xl border border-border-subtle p-5 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Disbursed Outlay</span>
              <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
                ₹{disbursed.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-text-muted mt-1 block">{disbursalPct}% of total allocation</span>
            </div>

            <div className="bg-white rounded-xl border border-border-subtle p-5 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Unspent Balance</span>
              <div className="text-xl font-bold font-mono text-blue-700 mt-1">
                ₹{unspent.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-text-muted mt-1 block">Available in District SNA Account</span>
            </div>

            <div className="bg-white rounded-xl border border-border-subtle p-5 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">PFMS Status</span>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-sm font-bold text-text-primary">Direct Beneficiary Valid</span>
              </div>
              <span className="text-[10px] text-text-muted mt-1 block font-mono">Mapped: {selectedProj.vendor_id || 'Contractor'}</span>
            </div>
          </div>

          {/* Detailed Deductions Ledger */}
          <div className="saksham-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-text-primary text-sm">
                  Statutory Bill Deductions &amp; Liquid Disbursement
                </h3>
                <p className="text-[11px] text-text-muted">
                  GFR Rule 144(xi) Compliance Calculation for Work: <strong>{selectedProj.title}</strong>
                </p>
              </div>

              <button className="btn-secondary text-xs" onClick={() => window.print()}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>receipt_long</span>
                <span>Print Voucher</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-subtle border-b border-border-subtle text-text-secondary font-semibold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Component / Statutory Code</th>
                    <th className="py-2.5 px-3 text-right">Gross Disbursal</th>
                    <th className="py-2.5 px-3 text-center">Rate</th>
                    <th className="py-2.5 px-3 text-right">Deduction (₹)</th>
                    <th className="py-2.5 px-3 text-right">Net Payable (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  <tr>
                    <td className="py-3 px-3 font-medium">
                      <div>Cumulative Physical Progress Release</div>
                      <span className="text-text-muted text-[10px] font-mono">{selectedProj.project_code || selectedProj.id}</span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-medium">₹{disbursed.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-center text-text-muted font-mono">100%</td>
                    <td className="py-3 px-3 text-right font-mono text-text-muted">-</td>
                    <td className="py-3 px-3 text-right font-mono font-semibold">₹{disbursed.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3">
                      <div>Security Deposit Retention</div>
                      <span className="text-text-muted text-[10px]">Held until Defect Liability Period</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-text-muted">-</td>
                    <td className="py-2.5 px-3 text-center font-mono">5.0%</td>
                    <td className="py-2.5 px-3 text-right font-mono text-rose-600 font-medium">-₹{securityDeposit.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-text-muted">-</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3">
                      <div>Income Tax TDS (Section 194C)</div>
                      <span className="text-text-muted text-[10px]">Statutory Direct Tax Deduction</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-text-muted">-</td>
                    <td className="py-2.5 px-3 text-center font-mono">2.0%</td>
                    <td className="py-2.5 px-3 text-right font-mono text-rose-600 font-medium">-₹{itTds.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-text-muted">-</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3">
                      <div>GST TDS (Section 51 CGST Act)</div>
                      <span className="text-text-muted text-[10px]">Statutory Indirect Tax Withholding</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-text-muted">-</td>
                    <td className="py-2.5 px-3 text-center font-mono">2.0%</td>
                    <td className="py-2.5 px-3 text-right font-mono text-rose-600 font-medium">-₹{gstTds.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-text-muted">-</td>
                  </tr>
                  <tr className="bg-surface-subtle font-bold">
                    <td className="py-3 px-3 uppercase text-text-primary text-[11px]">Net Treasury Disbursal Payable</td>
                    <td className="py-3 px-3 text-right font-mono">₹{disbursed.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-center text-text-muted font-mono">-</td>
                    <td className="py-3 px-3 text-right font-mono text-rose-600 font-medium">
                      -₹{(securityDeposit + itTds + gstTds).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-700 font-bold text-sm">
                      ₹{netLiquid.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { getVendorById, getProjectsByVendor, vendors } from '../data/index.js';
import StatusBadge from '../components/StatusBadge';
import RiskBadge from '../components/RiskBadge';

export default function VendorDashboard() {
  const navigate = useNavigate();
  const { session } = useAuth();

  const targetVendorId = session?.vendorId || 'VND-007';
  const vendor = getVendorById(targetVendorId) || vendors[0];
  const myProjects = getProjectsByVendor(vendor.id);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-text-primary tracking-tight text-2xl">
              Contractor &amp; Vendor Console
            </h1>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-semibold font-mono">
              {vendor.id}
            </span>
          </div>
          <p className="text-text-secondary mt-0.5 text-xs">
            {vendor.legalName} • Registered Sector: {vendor.sector} • State: {vendor.state}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigate(`/vendors/${vendor.id}`)}
            className="btn-primary text-xs"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>badge</span>
            <span>View Full Risk Profile &amp; Audit</span>
          </button>
        </div>
      </div>

      {/* Vendor Profile Summary Card */}
      <div className="saksham-card flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
            Vendor SAKSHAM Compliance Status
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-slate-900">{vendor.legalName}</span>
            <RiskBadge level={vendor.riskLevel} />
          </div>
          <div className="text-xs text-slate-500">
            GSTIN: <span className="font-mono font-semibold text-slate-700">{vendor.syntheticGSTIN}</span> • PAN:{' '}
            <span className="font-mono font-semibold text-slate-700">{vendor.syntheticPAN}</span> • Turnover Band:{' '}
            <span className="font-semibold text-slate-700">{vendor.turnoverBand}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t lg:border-t-0 lg:border-l border-border-subtle pt-3 lg:pt-0 lg:pl-6 shrink-0">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">SAKSHAM Score</span>
            <div className="font-mono text-xl font-bold text-slate-900">{vendor.riskScore}/100</div>
          </div>
          <div className="text-right border-l border-border-subtle pl-3">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Works</span>
            <div className="font-mono text-xl font-bold text-blue-600">{myProjects.length}</div>
          </div>
        </div>
      </div>

      {/* My Active Works */}
      <div className="saksham-card p-0 overflow-hidden">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between">
          <h2 className="font-semibold text-text-primary text-sm">Contracted Schemes &amp; Physical Progress</h2>
          <span className="text-xs text-slate-500 font-mono">{myProjects.length} Schemes Contracted</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-subtle border-b border-border-subtle text-text-secondary font-semibold uppercase text-[10px]">
                <th className="px-4 py-3">Work ID</th>
                <th className="px-4 py-3">Project Title</th>
                <th className="px-4 py-3">Sanction Amount</th>
                <th className="px-4 py-3">Released</th>
                <th className="px-4 py-3">Physical Progress</th>
                <th className="px-4 py-3">Stage Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {myProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No active works assigned to this vendor profile.
                  </td>
                </tr>
              ) : (
                myProjects.map(p => (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="hover:bg-surface-subtle transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 font-mono font-bold text-primary">{p.id}</td>
                    <td className="px-4 py-3 max-w-[220px] truncate font-medium text-text-primary">{p.title}</td>
                    <td className="px-4 py-3 font-mono">{p.sanctionedAmount}</td>
                    <td className="px-4 py-3 font-mono text-emerald-600 font-semibold">{p.releasedAmount}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: `${p.physicalProgress}%` }} />
                        </div>
                        <span className="font-mono text-[11px]">{p.physicalProgress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-primary hover:underline font-semibold text-xs">Work Order</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Nav Shortcut Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/work-progress')}
          className="saksham-card p-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-3"
        >
          <span className="p-2.5 rounded-xl bg-blue-50 text-primary">
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>published_with_changes</span>
          </span>
          <div>
            <div className="font-semibold text-xs text-text-primary">Upload Milestone MB Record</div>
            <div className="text-[11px] text-text-muted">Digital geo-tagging &amp; inspection logs</div>
          </div>
        </div>

        <div
          onClick={() => navigate('/fund-disbursement')}
          className="saksham-card p-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-3"
        >
          <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>payments</span>
          </span>
          <div>
            <div className="font-semibold text-xs text-text-primary">PFMS Payment Tracking</div>
            <div className="text-[11px] text-text-muted">Electronic treasury vouchers &amp; TDS</div>
          </div>
        </div>

        <div
          onClick={() => navigate('/tenders')}
          className="saksham-card p-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-3"
        >
          <span className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>gavel</span>
          </span>
          <div>
            <div className="font-semibold text-xs text-text-primary">Participate in Tenders</div>
            <div className="text-[11px] text-text-muted">Active two-bid procurement notices</div>
          </div>
        </div>
      </div>
    </div>
  );
}

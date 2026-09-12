import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RiskBadge from '../components/RiskBadge';
import StatusBadge from '../components/StatusBadge';
import { useAuth, ROLES } from '../auth/AuthContext.jsx';
import { fetchVendors } from '../api/sakshamApi.js';

const riskFilters = ['All', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function ManageVendors() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [vendorsList, setVendorsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [includeDeactivated, setIncludeDeactivated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchVendors(session, { includeDeactivated })
      .then((res) => {
        if (!isMounted) return;
        if (res?.vendors) {
          setVendorsList(res.vendors);
        } else {
          setVendorsList([]);
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
  }, [session, includeDeactivated]);

  // Derive sectors from loaded vendors
  const availableSectors = ['All', ...new Set(vendorsList.map(v => v.sector).filter(Boolean))];

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

  const canAddVendor = [ROLES.DISTRICT_AUTHORITY, ROLES.IMPLEMENTING_AGENCY].includes(session?.role);
  const isDistrictAuthority = session?.role === ROLES.DISTRICT_AUTHORITY;

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-semibold text-text-primary tracking-tight" style={{ fontSize: 24 }}>
            Vendor Management & Intelligence
          </h1>
          <p className="text-text-secondary mt-0.5" style={{ fontSize: 13 }}>
            Authoritative registry of implementing contractors with SAKSHAM 4-dimension risk profiling.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isDistrictAuthority && (
            <label className="flex items-center gap-2 px-3 py-2 bg-slate-100 border border-border-subtle rounded-lg text-xs text-slate-700 cursor-pointer hover:bg-slate-200 transition-colors">
              <input
                type="checkbox"
                checked={includeDeactivated}
                onChange={(e) => setIncludeDeactivated(e.target.checked)}
                className="rounded text-primary focus:ring-0"
              />
              <span>Show Deactivated</span>
            </label>
          )}

          <button className="btn-secondary" onClick={() => window.print()}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>print</span>
            <span>Print</span>
          </button>

          {canAddVendor && (
            <button className="btn-primary" onClick={() => navigate('/vendors/new')}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person_add</span>
              <span>+ Add Vendor</span>
            </button>
          )}
        </div>
      </div>

      {/* Risk Summary Pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { level: 'CRITICAL', count: riskCounts.CRITICAL, bg: 'bg-[#450a0a]', text: 'text-[#fecaca]' },
          { level: 'HIGH', count: riskCounts.HIGH, bg: 'bg-[#431407]', text: 'text-[#fed7aa]' },
          { level: 'MEDIUM', count: riskCounts.MEDIUM, bg: 'bg-[#422006]', text: 'text-[#fef08a]' },
          { level: 'LOW', count: riskCounts.LOW, bg: 'bg-[#052e16]', text: 'text-[#bbf7d0]' },
        ].map((p) => (
          <div
            key={p.level}
            onClick={() => setRiskFilter(riskFilter === p.level ? 'All' : p.level)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border-subtle cursor-pointer transition-all ${
              riskFilter === p.level ? 'ring-2 ring-primary border-transparent' : 'bg-surface-card hover:border-slate-300'
            }`}
          >
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider ${p.bg} ${p.text}`}>
              {p.level}
            </span>
            <span className="text-xs font-semibold text-text-primary">{p.count}</span>
          </div>
        ))}
      </div>

      {/* Search & Sector Filters */}
      <div className="bg-white p-4 rounded-xl border border-border-subtle flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-text-muted" style={{ fontSize: 18 }}>
            search
          </span>
          <input
            type="text"
            placeholder="Search name, GSTIN, ID, district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-surface-base border border-border-subtle rounded-lg focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs text-text-muted shrink-0 font-medium">Sector:</span>
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            aria-label="Filter by Sector"
            className="text-xs bg-surface-base border border-border-subtle rounded-lg px-2.5 py-1.5 text-text-primary focus:outline-none focus:border-primary"
          >
            {availableSectors.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Vendor Table */}
      <div className="saksham-card overflow-hidden">
        <div className="overflow-x-auto -mx-6">
          <table className="w-full saksham-table min-w-[1000px]">
            <thead>
              <tr>
                <th>Vendor ID</th>
                <th>Vendor Name</th>
                <th>State</th>
                <th>District</th>
                <th>Sector</th>
                <th>Active Works</th>
                <th>Risk Score</th>
                <th>Risk Level</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-text-muted text-xs">
                    Loading authoritative vendor registry from database...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-text-muted text-xs">
                    No vendors match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((v) => {
                  const vendorName = v.legalName || v.company_name || v.name || 'Unnamed Contractor';
                  const gstin = v.syntheticGSTIN || v.gstin || 'N/A';
                  const state = v.registeredState || v.state || 'N/A';
                  const district = v.primaryDistrict || v.district || 'N/A';
                  const sector = v.sector || 'General Civil Works';
                  const riskScore = v.risk_score?.composite_score ?? v.longitudinal_risk_score ?? v.riskScore ?? 25;
                  const riskLevel = v.risk_score?.severity ?? v.risk_level ?? v.riskLevel ?? 'LOW';
                  const isDeactivated = v.is_active === false;

                  return (
                    <tr
                      key={v.id}
                      className={`cursor-pointer ${isDeactivated ? 'opacity-60 bg-slate-50' : ''}`}
                      onClick={() => navigate(`/vendors/${v.id}`)}
                    >
                      <td>
                        <span className="font-mono font-semibold text-primary text-xs">{v.id}</span>
                      </td>
                      <td>
                        <div className="font-medium text-text-primary text-xs flex items-center gap-1.5">
                          <span>{vendorName}</span>
                          {isDeactivated && (
                            <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 text-[9px] font-bold">
                              DEACTIVATED
                            </span>
                          )}
                        </div>
                        <div className="text-text-muted text-[10px] font-mono">{gstin}</div>
                      </td>
                      <td className="text-text-secondary text-xs">{state}</td>
                      <td className="text-text-secondary text-xs">{district}</td>
                      <td>
                        <span className="text-text-secondary line-clamp-1 text-xs max-w-[180px]">{sector}</span>
                      </td>
                      <td>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-semibold">
                          {v.active_projects_count || 0}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-12 bg-surface-subtle h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                riskLevel === 'LOW'
                                  ? 'bg-status-success-dot'
                                  : riskLevel === 'MEDIUM'
                                  ? 'bg-status-warning-dot'
                                  : 'bg-status-danger-dot'
                              }`}
                              style={{ width: `${Math.min(riskScore, 100)}%` }}
                            />
                          </div>
                          <span className="font-semibold text-text-primary text-xs">{riskScore}</span>
                        </div>
                      </td>
                      <td><RiskBadge level={riskLevel} /></td>
                      <td>
                        {isDeactivated ? (
                          <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-semibold">
                            Inactive
                          </span>
                        ) : (
                          <StatusBadge status={v.status || 'ACTIVE'} />
                        )}
                      </td>
                      <td>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            className="p-1.5 rounded-lg hover:bg-surface-subtle text-text-secondary hover:text-primary transition-colors"
                            title="View Risk Profile"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/vendors/${v.id}`);
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>shield_with_heart</span>
                          </button>
                          {canAddVendor && (
                            <button
                              className="p-1.5 rounded-lg hover:bg-surface-subtle text-text-secondary hover:text-text-primary transition-colors"
                              title="Edit Vendor"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/vendors/${v.id}/edit`);
                              }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
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
    </div>
  );
}

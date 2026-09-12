import { NavLink } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useAuth } from '../auth/AuthContext.jsx';
import { roleNavigation } from '../navigation/roleNavigation.js';

export default function Sidebar({ onClose = null }) {
  const { session, roles } = useAuth();
  const currentRole = session?.role || roles.IMPLEMENTING_AGENCY;
  const navItems = roleNavigation[currentRole] || roleNavigation[roles.IMPLEMENTING_AGENCY];

  return (
    <div className="flex flex-col h-full bg-surface-card">
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center gap-3 bg-surface-card border-b border-border-subtle shrink-0">
        <img
          src={logo}
          alt="SAKSHAM Portal"
          className="h-8 w-auto object-contain"
        />
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-text-primary tracking-tight truncate text-base">
              e-SAKSHAM
            </span>
            <span
              className="px-1.5 rounded bg-blue-50 text-primary font-semibold text-[10px]"
              style={{ paddingTop: 1, paddingBottom: 1 }}
            >
              MPLADS
            </span>
          </div>
          <span className="text-text-muted truncate text-[11px]">
            Fiscal Oversight &amp; Intelligence
          </span>
        </div>
        {/* Close button on mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto text-text-muted hover:text-text-primary lg:hidden p-1 rounded"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
          </button>
        )}
      </div>

      {/* Role Context Panel */}
      <div className="px-4 py-3 bg-slate-50/80 border-b border-border-subtle shrink-0">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          {session?.roleTitle || 'AUTHORIZED CONSOLE'}
        </div>
        <div className="font-semibold text-xs text-text-primary mt-0.5 truncate">
          {session?.organizationName || session?.agencyType || session?.roleTitle}
        </div>
        <div className="text-[11px] text-text-secondary truncate mt-0.5">
          {session?.subTitle || `${session?.district || ''}, ${session?.state || ''}`}
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        <p className="text-text-muted font-semibold uppercase tracking-wider px-2 mb-2 text-[10px]">
          Operational Navigation
        </p>
        <nav className="flex flex-col gap-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              end={item.path === '/dashboard' || item.path === '/district-dashboard' || item.path === '/vendor-dashboard' || item.path === '/state-dashboard' || item.path === '/national-dashboard' || item.path === '/mp-dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-primary font-semibold'
                    : 'text-text-secondary hover:bg-slate-50 hover:text-text-primary font-normal'
                }`
              }
            >
              <span className="material-symbols-outlined shrink-0 text-slate-500" style={{ fontSize: 18 }}>
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer Status */}
      <div className="p-3 border-t border-border-subtle shrink-0 bg-surface-card">
        <div className="bg-slate-50 rounded-xl px-3 py-2 flex items-center justify-between border border-border-subtle">
          <div className="flex items-center gap-2">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </div>
            <span className="text-text-primary font-medium text-[11px]">NIC Gateway Active</span>
          </div>
          <span className="material-symbols-outlined text-text-muted" style={{ fontSize: 16 }}>lock</span>
        </div>
      </div>
    </div>
  );
}

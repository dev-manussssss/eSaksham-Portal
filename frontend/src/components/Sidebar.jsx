import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../auth/AuthContext.jsx';
import { esakshiNavigation, eprocurementNavigation } from '../navigation/roleNavigation.js';

export default function Sidebar({ isProcurement, onClose }) {
  const navigate = useNavigate();
  const { session } = useAuth();
  const role = session?.role;

  // Use the distinct navigation list according to portal mode
  const navItems = (isProcurement ? eprocurementNavigation[role] : esakshiNavigation[role]) || [];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Brand & Portal Identity */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 shrink-0">
        <NavLink to="/" className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-xs ${
              isProcurement ? 'bg-[#047857]' : 'bg-[#1F497D]'
            }`}
          >
            S
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 tracking-tight leading-none">
              SAKSHAM AI
            </div>
            <div
              className={`text-[9px] font-bold tracking-wider uppercase mt-0.5 ${
                isProcurement ? 'text-[#047857]' : 'text-[#1F497D]'
              }`}
            >
              {isProcurement ? 'e-Procurement Portal' : 'e-SAKSHI Works'}
            </div>
          </div>
        </NavLink>

        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            aria-label="Close navigation"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
          </button>
        )}
      </div>

      {/* Authenticated Officer Context */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Authenticated Role</span>
          <span
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
              isProcurement
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}
          >
            {role || 'USER'}
          </span>
        </div>
        <div className="text-xs font-bold text-slate-800 truncate mt-1">
          {session?.name || 'Officer Name'}
        </div>
        <div className="text-[10px] text-slate-500 truncate">
          {session?.designation || session?.organizationName || ''}
        </div>
        {session?.district && (
          <div className="text-[10px] text-slate-400 truncate mt-0.5 flex items-center gap-1">
            <span className="material-symbols-outlined" style={{ fontSize: 11 }}>location_on</span>
            <span>{session.district}, {session?.state}</span>
          </div>
        )}
      </div>

      {/* Portal Mode Tag */}
      <div className="px-3 pt-3 pb-1">
        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-100/70 border border-slate-200/60">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isProcurement ? 'bg-emerald-600' : 'bg-blue-600'
              }`}
            />
            <span className="text-[10px] font-semibold text-slate-700 uppercase tracking-wide">
              {isProcurement ? 'Procurement Workspace' : 'Works Scrutiny & Execution'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Menu */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-1" role="navigation" aria-label="Portal Navigation">
        {navItems.map((item) => (
          <NavLink
            key={`${item.label}-${item.path}`}
            to={item.path}
            onClick={() => onClose?.()}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? isProcurement
                    ? 'bg-emerald-50 text-[#047857] font-semibold shadow-xs'
                    : 'bg-[#EEF4FA] text-[#1F497D] font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined shrink-0"
                  style={{
                    fontSize: 18,
                    color: isActive ? (isProcurement ? '#047857' : '#1F497D') : '#94A3B8',
                  }}
                >
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Clean Footer — Strictly removed v2.0 */}
      <div className="p-3 border-t border-slate-200 bg-white shrink-0">
        <div className="text-[10px] text-slate-400 text-center font-medium">
          SAKSHAM AI · Workflow Prototype
        </div>
      </div>
    </div>
  );
}

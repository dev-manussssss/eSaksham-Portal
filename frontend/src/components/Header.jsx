import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth, ROLES } from '../auth/AuthContext.jsx';

export default function Header({ isProcurement, onMenuClick }) {
  const navigate = useNavigate();
  const { session, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const role = session?.role;
  const isMP = role === ROLES.MP;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Determine home routes for each portal
  const esakshiHome =
    role === ROLES.MP ? '/mp-dashboard' :
    role === ROLES.DISTRICT_AUTHORITY ? '/district-dashboard' :
    role === ROLES.VENDOR ? '/vendor-dashboard' :
    role === ROLES.STATE_NODAL_AUTHORITY ? '/state-dashboard' :
    role === ROLES.CENTRAL_NODAL_AGENCY ? '/national-dashboard' :
    role === ROLES.INVESTIGATOR ? '/investigations' : '/dashboard';

  const procurementHome = isMP ? '/tenders' : '/procurement-dashboard';

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-30 lg:pl-64 flex items-center justify-between px-4 sm:px-6 shadow-xs">
      {/* Left: Mobile Toggle + Portal Switcher */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Open mobile navigation"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>menu</span>
        </button>

        {/* Portal Switcher — Distinct e-SAKSHI vs e-Procurement Navigation */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <NavLink
            to={esakshiHome}
            className={() =>
              `flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all ${
                !isProcurement
                  ? 'bg-white text-[#1F497D] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`
            }
          >
            <span className="material-symbols-outlined text-[#1F497D]" style={{ fontSize: 15 }}>domain</span>
            <span>e-SAKSHI</span>
            <span className="hidden sm:inline text-[10px] text-slate-400 font-normal">Works</span>
          </NavLink>

          {isMP ? (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 text-slate-400 cursor-not-allowed opacity-75"
              title="MP does not have administrative procurement powers per MPLADS §5"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>lock</span>
              <span className="line-through">e-Procurement</span>
            </div>
          ) : (
            <NavLink
              to={procurementHome}
              className={() =>
                `flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all ${
                  isProcurement
                    ? 'bg-white text-[#047857] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`
              }
            >
              <span className="material-symbols-outlined text-[#047857]" style={{ fontSize: 15 }}>gavel</span>
              <span>e-Procurement</span>
              <span className="hidden sm:inline text-[10px] text-slate-400 font-normal">Tenders</span>
            </NavLink>
          )}
        </div>
      </div>

      {/* Center: Search (Visible on large screens, perfectly positioned) */}
      <div className="hidden xl:flex items-center relative w-72">
        <span className="material-symbols-outlined absolute left-3 text-slate-400 pointer-events-none" style={{ fontSize: 16 }}>
          search
        </span>
        <input
          type="text"
          placeholder="Search Works, Tenders, Vendors..."
          className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#1F497D] focus:ring-1 focus:ring-[#1F497D] outline-none transition-colors"
        />
      </div>

      {/* Right: Handbook & Officer Profile */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => navigate('/reports')}
          className="hidden md:flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 border border-slate-200 transition-colors"
        >
          <span className="material-symbols-outlined text-slate-400" style={{ fontSize: 15 }}>help_outline</span>
          <span>Scheme Handbook</span>
        </button>

        {/* User Pill & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 border border-slate-200 transition-colors text-left"
            aria-expanded={profileOpen}
          >
            <div className="w-7 h-7 rounded-lg bg-[#1F497D] text-white flex items-center justify-center font-bold text-xs shrink-0">
              {session?.name ? session.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden sm:block text-left pr-1">
              <div className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[130px]">
                {session?.name || 'Officer'}
              </div>
              <div className="text-[10px] text-slate-400 leading-tight truncate max-w-[130px]">
                {session?.designation || session?.role || ''}
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400 shrink-0" style={{ fontSize: 16 }}>
              {profileOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 text-xs">
              <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/50">
                <div className="font-semibold text-slate-900">{session?.name}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{session?.email}</div>
                <div className="text-[10px] font-mono text-[#1F497D] mt-1 bg-blue-50 px-1.5 py-0.5 rounded inline-block">
                  Role: {session?.role}
                </div>
                {session?.district && (
                  <div className="text-[10px] text-slate-400 mt-1">
                    District: {session.district}, {session?.state}
                  </div>
                )}
              </div>

              <div className="px-2 py-1.5">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate(isProcurement ? esakshiHome : procurementHome);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-slate-400" style={{ fontSize: 16 }}>
                    {isProcurement ? 'domain' : 'gavel'}
                  </span>
                  <span>Switch to {isProcurement ? 'e-SAKSHI (Works)' : 'e-Procurement (Tenders)'}</span>
                </button>

                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate('/reports');
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-slate-400" style={{ fontSize: 16 }}>assessment</span>
                  <span>Statutory Reports</span>
                </button>
              </div>

              <div className="border-t border-slate-100 px-2 pt-1.5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left font-semibold"
                >
                  <span className="material-symbols-outlined text-red-500" style={{ fontSize: 16 }}>logout</span>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

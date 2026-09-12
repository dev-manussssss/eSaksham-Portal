import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../auth/AuthContext.jsx';
export default function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const { session, switchRole, logout, roles } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setRoleMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSwitch = (roleKey, overrides = {}) => {
    setRoleMenuOpen(false);
    const targetRoute = switchRole(roleKey, overrides);
    navigate(targetRoute);
  };

  return (
    <header className="fixed top-0 left-0 right-0 lg:left-72 h-16 bg-surface-card/95 backdrop-blur-md z-40 border-b border-border-subtle px-4">
      <div className="h-16 w-full flex items-center justify-between gap-4">
        {/* Left Section: Mobile Menu + Search */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <button
            onClick={onMenuClick}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-text-secondary hover:bg-surface-subtle"
            title="Open Navigation"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>menu</span>
          </button>

          {/* Search */}
          <div className="relative flex-1 hidden sm:flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-text-muted" style={{ fontSize: 18 }}>search</span>
            <input
              className="w-full h-9 pl-9 pr-12 rounded-lg bg-surface-base text-text-primary placeholder:text-text-muted focus:outline-none focus:bg-surface-card border border-border-subtle focus:border-primary text-xs"
              placeholder="Search Work ID, Vendor, Tender, MB Record..."
            />
            <span className="absolute right-2.5 text-text-muted bg-surface-card px-1.5 py-0.5 rounded border border-border-subtle text-[10px] font-mono">
              ⌘K
            </span>
          </div>
        </div>

        {/* Right Section: Role Context Badge, Role Switcher, Profile */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Active Role Indicator & Switcher Dropdown (Hidden for VENDOR) */}
          {session?.role !== ROLES.VENDOR ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border-subtle bg-slate-50 hover:bg-slate-100 transition-colors text-left"
              title="Switch Active Role"
            >
              <span className="w-2 h-2 rounded-full bg-primary" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none">
                  Role: {session?.roleTitle || 'Console'}
                </span>
                <span className="text-xs font-semibold text-text-primary mt-0.5 leading-tight truncate max-w-[140px] sm:max-w-[200px]">
                  {session?.organizationName || session?.agencyType || session?.district || 'Central'}
                </span>
              </div>
              <span className="material-symbols-outlined text-slate-400" style={{ fontSize: 16 }}>
                expand_more
              </span>
            </button>

            {/* Role Switcher Menu */}
            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-border-subtle py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-border-subtle">
                  Switch Active Role Persona
                </div>

                <div className="py-1 text-xs">
                  {/* District Authority */}
                  <button
                    onClick={() => handleRoleSwitch(ROLES.DISTRICT_AUTHORITY)}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 ${
                      session?.role === ROLES.DISTRICT_AUTHORITY ? 'bg-blue-50/70 font-semibold text-primary' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">District Authority</div>
                      <div className="text-[10px] text-slate-500">Bhopal, Madhya Pradesh</div>
                    </div>
                    {session?.role === ROLES.DISTRICT_AUTHORITY && (
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: 16 }}>check</span>
                    )}
                  </button>

                  {/* Implementing Agency PWD */}
                  <button
                    onClick={() => handleRoleSwitch(ROLES.IMPLEMENTING_AGENCY, {
                      agencyType: 'PWD (Public Works Department)',
                      subTitle: 'PWD • Bhopal, Madhya Pradesh',
                    })}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 ${
                      session?.role === ROLES.IMPLEMENTING_AGENCY ? 'bg-blue-50/70 font-semibold text-primary' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">Implementing Agency (PWD)</div>
                      <div className="text-[10px] text-slate-500">Bhopal Division-II</div>
                    </div>
                    {session?.role === ROLES.IMPLEMENTING_AGENCY && (
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: 16 }}>check</span>
                    )}
                  </button>

                  {/* Vendor VND-007 */}
                  <button
                    onClick={() => handleRoleSwitch(ROLES.VENDOR, {
                      vendorId: 'VND-007',
                      organizationName: 'Eastern Structural & Eng.',
                      subTitle: 'VND-007 • Nadia, West Bengal',
                    })}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 ${
                      session?.role === ROLES.VENDOR ? 'bg-blue-50/70 font-semibold text-primary' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">Vendor (VND-007)</div>
                      <div className="text-[10px] text-slate-500">Eastern Structural (High Risk Demo)</div>
                    </div>
                    {session?.role === ROLES.VENDOR && (
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: 16 }}>check</span>
                    )}
                  </button>

                  {/* State Nodal Authority */}
                  <button
                    onClick={() => handleRoleSwitch(ROLES.STATE_NODAL_AUTHORITY)}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 ${
                      session?.role === ROLES.STATE_NODAL_AUTHORITY ? 'bg-blue-50/70 font-semibold text-primary' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">State Nodal Authority</div>
                      <div className="text-[10px] text-slate-500">Madhya Pradesh State Directorate</div>
                    </div>
                    {session?.role === ROLES.STATE_NODAL_AUTHORITY && (
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: 16 }}>check</span>
                    )}
                  </button>

                  {/* Central Nodal Agency */}
                  <button
                    onClick={() => handleRoleSwitch(ROLES.CENTRAL_NODAL_AGENCY)}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 ${
                      session?.role === ROLES.CENTRAL_NODAL_AGENCY ? 'bg-blue-50/70 font-semibold text-primary' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">Central Nodal Agency</div>
                      <div className="text-[10px] text-slate-500">MoSPI National Oversight</div>
                    </div>
                    {session?.role === ROLES.CENTRAL_NODAL_AGENCY && (
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: 16 }}>check</span>
                    )}
                  </button>

                  {/* MP */}
                  <button
                    onClick={() => handleRoleSwitch(ROLES.MP)}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 ${
                      session?.role === ROLES.MP ? 'bg-blue-50/70 font-semibold text-primary' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">Member of Parliament (MP)</div>
                      <div className="text-[10px] text-slate-500">Bhopal Constituency</div>
                    </div>
                    {session?.role === ROLES.MP && (
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: 16 }}>check</span>
                    )}
                  </button>

                  {/* Investigator */}
                  <button
                    onClick={() => handleRoleSwitch(ROLES.INVESTIGATOR)}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 ${
                      session?.role === ROLES.INVESTIGATOR ? 'bg-blue-50/70 font-semibold text-primary' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">Inspector / Investigator</div>
                      <div className="text-[10px] text-slate-500">SAKSHAM Vigilance Cell</div>
                    </div>
                    {session?.role === ROLES.INVESTIGATOR && (
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: 16 }}>check</span>
                    )}
                  </button>
                </div>

                <div className="pt-1.5 border-t border-border-subtle px-3">
                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    className="w-full py-1.5 text-center text-xs text-red-600 hover:text-red-700 font-medium flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>logout</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border-subtle bg-slate-50 text-left">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none">Role: Vendor Portal</span>
                <span className="text-xs font-semibold text-text-primary mt-0.5 leading-tight truncate max-w-[140px] sm:max-w-[200px]">{session?.organizationName || 'Registered Contractor'}</span>
              </div>
            </div>
          )}

          {/* User Profile Info */}
          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-border-subtle">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {session?.userName?.charAt(0) || 'U'}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-text-primary font-semibold text-xs leading-tight">
                {session?.userName || 'NIC User'}
              </span>
              <span className="text-text-muted text-[10px] leading-tight">
                {session?.designation || session?.roleTitle}
              </span>
            </div>
          </div>

          {/* Logout Shortcut */}
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-secondary hover:bg-slate-100 hover:text-red-600 transition-colors"
            title="Sign Out"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

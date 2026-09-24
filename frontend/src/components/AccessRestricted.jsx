import { useNavigate } from 'react-router-dom';
import { useAuth, getRoleLandingRoute } from '../auth/AuthContext.jsx';
import { useState } from 'react';

export default function AccessRestricted({ attemptedPath = '' }) {
  const navigate = useNavigate();
  const { session, switchRole, roles, logout } = useAuth();
  const [switching, setSwitching] = useState(false);

  const homeDashboard = session?.landingRoute || getRoleLandingRoute(session?.role);

  const handleSwitchToDA = async () => {
    setSwitching(true);
    try {
      if (switchRole && roles?.DISTRICT_AUTHORITY) {
        await switchRole(roles.DISTRICT_AUTHORITY);
        navigate('/district-dashboard');
      } else {
        navigate('/login');
      }
    } catch (err) {
      console.error('Failed to switch role:', err);
      navigate('/login');
    } finally {
      setSwitching(false);
    }
  };

  const handleLogoutAndLogin = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="saksham-card max-w-lg text-center p-8 border border-red-200 shadow-sm flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
          <span className="material-symbols-outlined" style={{ fontSize: 32 }}>lock_person</span>
        </div>

        <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-semibold text-xs mb-2">
          Statutory Clearance Required
        </span>

        <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
          Access Restricted
        </h1>

        <p className="text-xs text-slate-600 leading-relaxed mb-6">
          Your current authenticated role <strong className="text-slate-900">{session?.roleTitle || session?.role || 'User'}</strong>{' '}
          does not possess statutory clearance to access the domain at{' '}
          <span className="font-mono text-red-700 bg-red-50 px-1.5 py-0.5 rounded text-[11px]">{attemptedPath || window.location.pathname}</span>.
          Administrative boundaries are strictly segregated by role under GFR Rule 144.
        </p>

        <div className="flex flex-col gap-2.5 w-full">
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
            <button
              onClick={() => navigate(homeDashboard)}
              className="btn-primary w-full justify-center text-xs py-2"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>dashboard</span>
              <span>Return to My Dashboard</span>
            </button>

            <button
              onClick={handleSwitchToDA}
              disabled={switching}
              className="btn-secondary w-full justify-center text-xs py-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>swap_horiz</span>
              <span>{switching ? 'Switching...' : 'Switch to District Authority'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 w-full text-xs">
            <button
              onClick={handleLogoutAndLogin}
              className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>logout</span>
              <span>Sign In with Different Account</span>
            </button>

            <button
              onClick={() => navigate('/')}
              className="text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>home</span>
              <span>Back to Portal Home</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

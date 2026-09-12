import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function AccessRestricted({ attemptedPath = '' }) {
  const navigate = useNavigate();
  const { session, switchRole, roles } = useAuth();

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
          Your current authenticated role <strong className="text-slate-900">{session?.roleTitle || session?.role}</strong>{' '}
          does not possess statutory clearance to access the domain at{' '}
          <span className="font-mono text-red-700 bg-red-50 px-1.5 py-0.5 rounded text-[11px]">{attemptedPath || window.location.pathname}</span>.
          Administrative boundaries are strictly segregated by role under GFR Rule 144.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <button
            onClick={() => navigate(session?.landingRoute || '/dashboard')}
            className="btn-primary w-full justify-center text-xs"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>dashboard</span>
            <span>Return to My Dashboard</span>
          </button>

          <button
            onClick={() => {
              // Switch to an authorized role like District Authority or Implementing Agency
              switchRole(roles.DISTRICT_AUTHORITY);
              navigate('/district-dashboard');
            }}
            className="btn-secondary w-full justify-center text-xs"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>swap_horiz</span>
            <span>Switch to District Authority</span>
          </button>
        </div>
      </div>
    </div>
  );
}

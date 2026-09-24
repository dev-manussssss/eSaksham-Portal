import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, ROLES, getRoleLandingRoute } from '../auth/AuthContext.jsx';

const SAMPLE_CAPTCHAS = [
  { code: '9K4T2M', display: '9 K 4 T 2 M' },
  { code: '7H8P3X', display: '7 H 8 P 3 X' },
  { code: '5W2R9Q', display: '5 W 2 R 9 Q' },
  { code: '4N7C1Z', display: '4 N 7 C 1 Z' },
];

const PRE_AUTH_ACCOUNTS = [
  {
    category: 'e-SAKSHI Works Access',
    roles: [
      {
        title: 'Member of Parliament',
        subtitle: 'Shri R. K. Singh, MP (Bhopal PC-19)',
        email: 'mp.bhopal@saksham.gov.in',
        icon: 'account_balance',
        tag: 'Lok Sabha Recommender',
        color: '#1F497D',
        bg: '#EFF6FF',
      },
      {
        title: 'District Authority',
        subtitle: 'R. Venkatraman, IAS (District Collector & DM)',
        email: 'da.bhopal@saksham.gov.in',
        icon: 'location_city',
        tag: 'Sanction & Nodal Authority',
        color: '#047857',
        bg: '#ECFDF5',
      },
      {
        title: 'Implementing Agency',
        subtitle: 'Er. S. K. Sharma (Executive Engineer, PWD)',
        email: 'ia.pwd.bhopal@saksham.gov.in',
        icon: 'engineering',
        tag: 'Technical Execution & MB',
        color: '#B45309',
        bg: '#FFFBEB',
      },
    ],
  },
  {
    category: 'e-Procurement & Oversight Access',
    roles: [
      {
        title: 'Registered Contractor',
        subtitle: 'Aarya Infraworks Pvt. Ltd. (VND-001)',
        email: 'contact@aaryainfra.test',
        icon: 'storefront',
        tag: 'Bidder & Contract Execution',
        color: '#2563EB',
        bg: '#EFF6FF',
      },
      {
        title: 'Statutory Vigilance / Audit',
        subtitle: 'K. S. Narayanan, IPS (Vigilance & Inspection)',
        email: 'vigilance.central@saksham.gov.in',
        icon: 'policy',
        tag: 'Independent Audit & Risk Triage',
        color: '#DC2626',
        bg: '#FEF2F2',
      },
      {
        title: 'State Nodal Authority',
        subtitle: 'Anita Deshmukh, IAS (State Planning)',
        email: 'sna.mp@saksham.gov.in',
        icon: 'map',
        tag: 'State-Level Planning & Allocation',
        color: '#7C3AED',
        bg: '#F5F3FF',
      },
    ],
  },
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout, session } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const portalParam = queryParams.get('portal');

  // Pre-select account based on portal query parameter if provided
  const initialRole = portalParam === 'eprocurement'
    ? { email: 'contact@aaryainfra.test', title: 'Registered Contractor' }
    : { email: 'da.bhopal@saksham.gov.in', title: 'District Authority' };

  const [email, setEmail] = useState(initialRole.email);
  const [password, setPassword] = useState('Demopass@2026');
  const [captchaInput, setCaptchaInput] = useState('9K4T2M');
  const [captchaIndex, setCaptchaIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedRoleTitle, setSelectedRoleTitle] = useState(initialRole.title);

  const activeCaptcha = SAMPLE_CAPTCHAS[captchaIndex];

  const handleRefreshCaptcha = () => {
    const nextIdx = (captchaIndex + 1) % SAMPLE_CAPTCHAS.length;
    setCaptchaIndex(nextIdx);
    setCaptchaInput(SAMPLE_CAPTCHAS[nextIdx].code);
  };

  const selectPreAuthAccount = (roleObj) => {
    setEmail(roleObj.email);
    setPassword('Demopass@2026');
    setCaptchaInput(activeCaptcha.code);
    setSelectedRoleTitle(roleObj.title);
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your official email and password.');
      return;
    }

    if (captchaInput.trim().toUpperCase() !== activeCaptcha.code) {
      setErrorMessage('Security challenge code does not match. Please verify characters.');
      handleRefreshCaptcha();
      return;
    }

    setLoading(true);
    try {
      const res = await login(email.trim(), password);
      if (res.success && res.user) {
        const landingRoute = res.user.landingRoute || getRoleLandingRoute(res.user.role);
        navigate(landingRoute);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <button onClick={() => navigate('/')} className="flex items-center gap-3 group text-left">
          <div className="w-8 h-8 rounded-lg bg-[#1F497D] text-white flex items-center justify-center font-bold text-sm shadow-xs">
            S
          </div>
          <div>
            <div className="text-sm font-bold text-[#1F497D] leading-none">SAKSHAM AI</div>
            <div className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5">
              MPLADS & e-Procurement Prototype
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/')}
          className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>arrow_back</span>
          <span>Back to Overview</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-4xl space-y-6">
          {session && (
            <div className="p-4 rounded-xl bg-blue-50/90 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#1F497D] text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>account_circle</span>
                </div>
                <div>
                  <div className="text-xs text-blue-900 font-bold">Currently Signed In</div>
                  <div className="text-xs text-slate-700">
                    {session.name} • <span className="font-semibold text-blue-800">{session.roleTitle || session.role}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate(session.landingRoute || getRoleLandingRoute(session.role))}
                  className="px-3.5 py-1.5 bg-[#1F497D] hover:bg-[#16375D] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>dashboard</span>
                  <span>Continue to Dashboard</span>
                </button>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="px-3 py-1.5 border border-slate-300 hover:border-slate-400 bg-white text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Select Access Before Login (Section 5) */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#1F497D] text-xs font-semibold mb-2">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>vpn_key</span>
                Select Your Access Role
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Authorised Portal Sign In
              </h1>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Click any role entry below to load pre-seeded credentials. Role authority is strictly resolved by the server after authentication — no post-login role switching.
              </p>
            </div>

            {PRE_AUTH_ACCOUNTS.map((group, gi) => (
              <div key={gi} className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  {group.category}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {group.roles.map((r) => {
                    const isSelected = email === r.email;
                    return (
                      <button
                        key={r.email}
                        type="button"
                        onClick={() => selectPreAuthAccount(r)}
                        className={`text-left p-3 rounded-lg border transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#1F497D] bg-[#EEF4FA] shadow-xs ring-1 ring-[#1F497D]'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <div
                              className="w-7 h-7 rounded-md flex items-center justify-center"
                              style={{ backgroundColor: r.bg }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 16, color: r.color }}>
                                {r.icon}
                              </span>
                            </div>
                            {isSelected && (
                              <span className="w-2 h-2 rounded-full bg-[#1F497D]" />
                            )}
                          </div>
                          <div className="text-xs font-bold text-slate-900 leading-tight">
                            {r.title}
                          </div>
                          <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                            {r.subtitle}
                          </div>
                        </div>
                        <div className="text-[9px] font-medium text-slate-400 mt-2 border-t border-slate-100 pt-1.5">
                          {r.tag}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Credentials Form */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div>
              <div className="text-xs font-bold text-[#1F497D] uppercase tracking-wider">
                Active Selection
              </div>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {selectedRoleTitle}
              </div>
              <div className="text-[11px] text-slate-500">
                Synthetic test account with fixed administrative permissions
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700">
                  <span className="material-symbols-outlined text-red-500 shrink-0 mt-0.5" style={{ fontSize: 16 }}>
                    error
                  </span>
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Email / ID
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:border-[#1F497D] focus:ring-1 focus:ring-[#1F497D] outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:border-[#1F497D] focus:ring-1 focus:ring-[#1F497D] outline-none transition-colors font-mono"
                />
              </div>

              {/* CAPTCHA Challenge */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Security Code <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 bg-slate-100 border border-slate-300 rounded-lg py-2 text-center select-none">
                    <span className="font-mono font-bold tracking-[0.3em] text-slate-800 text-sm">
                      {activeCaptcha.display}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRefreshCaptcha}
                    className="p-2 bg-white border border-slate-300 hover:border-slate-400 rounded-lg text-slate-600 hover:text-slate-900 transition-colors flex items-center justify-center shrink-0"
                    title="Refresh Code"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>sync</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="Enter characters shown above"
                  maxLength={6}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:border-[#1F497D] focus:ring-1 focus:ring-[#1F497D] outline-none font-mono tracking-widest text-center"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#1F497D] hover:bg-[#16375D] disabled:opacity-60 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to {selectedRoleTitle}</span>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 border-t border-slate-100 text-center">
              <span className="text-[10px] text-slate-400">
                Shared test password: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-600">Demopass@2026</code>
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>

      {/* Footer */}
      <footer className="py-3 px-6 text-center border-t border-slate-200 bg-white">
        <p className="text-[11px] text-slate-400">
          SAKSHAM AI Workflow Demonstration — Synthetic data only. Not an official government portal.
        </p>
      </footer>
    </div>
  );
}

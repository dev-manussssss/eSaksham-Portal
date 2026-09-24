import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLES, getRoleLandingRoute } from '../auth/AuthContext.jsx';

const ECOSYSTEMS = [
  {
    id: 'esakshi',
    title: 'e-SAKSHI',
    subtitle: 'MPLADS Works Lifecycle',
    description: 'Replica of the e-SAKSHI portal covering MPLADS recommendation, sanction, implementation, inspection and completion workflows.',
    icon: 'account_tree',
    color: '#1F497D',
    bgColor: '#EEF4FA',
    path: '/login?portal=esakshi',
    steps: ['MP Recommendation', 'DA Scrutiny & Sanction', 'IA Assignment', 'Implementation', 'Inspection', 'Completion'],
  },
  {
    id: 'eprocurement',
    title: 'e-Procurement',
    subtitle: 'Tender & Bid Lifecycle',
    description: 'Replica of the e-Procurement portal covering tender creation, publication, bid submission, evaluation, and contract award workflows.',
    icon: 'gavel',
    color: '#047857',
    bgColor: '#ECFDF5',
    path: '/login?portal=eprocurement',
    steps: ['Tender Preparation', 'Publication', 'Bid Submission', 'Technical Evaluation', 'Commercial Evaluation', 'Contract Award'],
  },
];

const ROLE_ENTRIES = [
  { role: 'Member of Parliament', icon: 'account_balance', description: 'Recommend MPLADS schemes, track constituency fund utilization' },
  { role: 'District Authority', icon: 'location_city', description: 'Scrutiny, sanction, fund release oversight, inspection approval' },
  { role: 'Implementing Agency', icon: 'engineering', description: 'Tender management, measurement books, progress reporting' },
  { role: 'Vendor / Contractor', icon: 'storefront', description: 'Bid submission, work execution, payment tracking' },
  { role: 'State Nodal Authority', icon: 'map', description: 'State-wide monitoring, inter-district analytics' },
  { role: 'Vigilance / Audit', icon: 'policy', description: 'Risk investigation, fraud pattern analysis, evidence review' },
];

const AI_FEATURES = [
  { icon: 'document_scanner', title: 'Document OCR & Extraction', desc: 'Extracts structured data from Measurement Books, invoices, sanction orders' },
  { icon: 'hub', title: 'Bidder Relationship Graph', desc: 'Detects shared directors, common PAN/GSTIN, cartel formation signals' },
  { icon: 'location_on', title: 'Geospatial Verification', desc: 'GPS spoofing detection, photo geo-tag validation against project coordinates' },
  { icon: 'trending_up', title: 'Risk Scoring', desc: 'Composite risk scoring across vendor, tender, project and payment dimensions' },
  { icon: 'fact_check', title: 'Inspection Intelligence', desc: 'Duplicate photo detection, stale imagery, template reuse anomalies' },
  { icon: 'psychology', title: 'Explainable AI Alerts', desc: 'Every flag links to primary evidence artifacts — no black-box risk numbers' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { session, logout } = useAuth();
  const [activeEco, setActiveEco] = useState(null);

  const handleAccess = (eco) => {
    if (session) {
      if (eco === 'eprocurement') {
        if (session.role === ROLES.MP || session.role === ROLES.VENDOR) {
          navigate('/tenders');
        } else {
          navigate('/procurement-dashboard');
        }
      } else {
        navigate(session.landingRoute || getRoleLandingRoute(session.role));
      }
    } else {
      navigate(`/login?portal=${eco}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1F497D] text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
              S
            </div>
            <div>
              <span className="text-sm font-bold text-[#1F497D] tracking-tight leading-none block">SAKSHAM AI</span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase block">MPLADS Monitoring Prototype</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-500">
            <a href="#portals" className="hover:text-[#1F497D] transition-colors">Portals</a>
            <a href="#ai-layer" className="hover:text-[#1F497D] transition-colors">AI Layer</a>
            <a href="#roles" className="hover:text-[#1F497D] transition-colors">Role Access</a>
          </nav>

          <div className="flex items-center gap-2">
            {session ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-800 leading-none">{session.name}</span>
                  <span className="text-[10px] text-blue-700 font-medium">{session.roleTitle || session.role}</span>
                </div>
                <button
                  onClick={() => navigate(session.landingRoute || getRoleLandingRoute(session.role))}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#1F497D] rounded-lg hover:bg-[#16375D] transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>dashboard</span>
                  <span>Dashboard →</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Sign Out / Switch User"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-3 py-1.5 text-xs font-semibold text-[#1F497D] border border-[#1F497D] rounded-lg hover:bg-[#EEF4FA] transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#1F497D] rounded-lg hover:bg-[#16375D] transition-colors shadow-sm"
                >
                  Enter Portal →
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16 text-center">
        {/* Prototype label */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>Workflow Prototype — Not an official government system</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight mb-5">
          MPLADS & e-Procurement{' '}
          <span className="text-[#1F497D]">Workflow Replica</span>
          <br />
          <span className="text-slate-500 text-2xl sm:text-3xl lg:text-4xl font-semibold">with SAKSHAM AI Intelligence Layer</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed mb-3">
          This is a <strong>prototype demonstration</strong> replicating e-SAKSHI and e-Procurement workflows,
          with <strong>SAKSHAM AI</strong> integrated for intelligent monitoring, document analysis and procurement risk insights.
        </p>
        <p className="text-xs text-slate-500 max-w-xl mx-auto mb-8">
          Authorized test accounts are pre-seeded. All data is synthetic. No live government system connectivity.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => handleAccess('esakshi')}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-[#1F497D] rounded-xl hover:bg-[#16375D] transition-all shadow-md shadow-blue-900/15 flex items-center gap-2"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>account_tree</span>
            Enter e-SAKSHI Portal →
          </button>
          <button
            onClick={() => handleAccess('eprocurement')}
            className="px-5 py-2.5 text-sm font-semibold text-[#047857] bg-white border-2 border-emerald-200 rounded-xl hover:bg-emerald-50 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>gavel</span>
            Enter e-Procurement Portal →
          </button>
        </div>
      </section>

      {/* ── Two Portal Cards ─────────────────────────────────── */}
      <section id="portals" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Two Workflow Portals</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {ECOSYSTEMS.map((eco) => (
            <div
              key={eco.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              <div className="p-6" style={{ borderTop: `4px solid ${eco.color}` }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: eco.bgColor }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 22, color: eco.color }}>{eco.icon}</span>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-base">{eco.title}</div>
                    <div className="text-xs text-slate-500 font-medium">{eco.subtitle}</div>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">{eco.description}</p>
                <div className="space-y-1.5 mb-5">
                  {eco.steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                        style={{ backgroundColor: eco.color }}
                      >
                        {i + 1}
                      </span>
                      <span className="text-xs text-slate-600 font-medium">{step}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleAccess(eco.id)}
                  className="w-full py-2 rounded-lg text-xs font-semibold transition-colors"
                  style={{ backgroundColor: eco.bgColor, color: eco.color }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = eco.color;
                    e.target.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = eco.bgColor;
                    e.target.style.color = eco.color;
                  }}
                >
                  Access {eco.title} →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SAKSHAM AI Section ───────────────────────────────── */}
      <section id="ai-layer" className="bg-[#1F497D] text-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-100 text-xs font-semibold mb-4">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>psychology</span>
              Intelligence & Risk Layer
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">What SAKSHAM AI Adds</h2>
            <p className="text-blue-200 text-sm max-w-xl mx-auto">
              SAKSHAM AI does <strong>not</strong> replace e-SAKSHI or e-Procurement. It is an intelligence, 
              monitoring and risk-analysis layer. It recommends and flags — human officers make all administrative decisions.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AI_FEATURES.map((feat) => (
              <div key={feat.icon} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-100" style={{ fontSize: 18 }}>{feat.icon}</span>
                  </div>
                  <span className="text-sm font-semibold text-white">{feat.title}</span>
                </div>
                <p className="text-xs text-blue-200 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-amber-400/20 border border-amber-400/30 rounded-xl text-center">
            <p className="text-amber-100 text-sm font-medium">
              ⚡ AI outputs are advisory signals — never autonomous administrative decisions.
              District Authorities, Nodal Officers and Engineers remain exclusively responsible for sanctions, payments and punitive actions.
            </p>
          </div>
        </div>
      </section>

      {/* ── Role Access ─────────────────────────────────────── */}
      <section id="roles" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Who Uses This System</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ROLE_ENTRIES.map((r) => (
            <div key={r.role} className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#EEF4FA] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#1F497D]" style={{ fontSize: 20 }}>{r.icon}</span>
              </div>
              <div>
                <div className="font-semibold text-slate-900 text-sm">{r.role}</div>
                <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{r.description}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Login CTA ──────────────────────────────────────── */}
      <section className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-xl font-bold mb-2">Ready to explore the prototype?</h3>
          <p className="text-slate-400 text-sm mb-6">
            Use pre-seeded test accounts for any of the 7 role archetypes. Password: <code className="bg-slate-700 px-1 rounded text-xs">Demopass@2026</code>
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 text-sm font-semibold text-[#1F497D] bg-white rounded-xl hover:bg-slate-100 transition-colors shadow-lg"
          >
            Access Test Portal →
          </button>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center">
        <p className="text-[11px] text-slate-400">
          SAKSHAM AI — Prototype demonstration system. Not affiliated with or endorsed by the Government of India, NIC, MoSPI, or any official entity.
          All data is synthetic. For evaluation/demonstration only.
        </p>
      </footer>
    </div>
  );
}

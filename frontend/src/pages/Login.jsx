import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useAuth, ROLES, AGENCY_TYPES, DEFAULT_PROFILES } from '../auth/AuthContext.jsx';
import { vendors } from '../data/index.js';

const ACCESS_TYPES = [
  { id: ROLES.DISTRICT_AUTHORITY, label: 'District Authority', icon: 'location_city' },
  { id: ROLES.IMPLEMENTING_AGENCY, label: 'Implementing Agency', icon: 'corporate_fare' },
  { id: ROLES.VENDOR, label: 'Vendor / Bidder', icon: 'business' },
  { id: ROLES.STATE_NODAL_AUTHORITY, label: 'State Nodal Authority', icon: 'map' },
  { id: ROLES.CENTRAL_NODAL_AGENCY, label: 'Central Nodal Agency', icon: 'account_balance' },
  { id: ROLES.MP, label: 'MP / Member of Parliament', icon: 'how_to_vote' },
  { id: ROLES.INVESTIGATOR, label: 'Inspector / Investigator', icon: 'policy' },
];

const STATES = ['Madhya Pradesh', 'Maharashtra', 'Karnataka', 'West Bengal', 'Rajasthan', 'Odisha', 'Haryana'];

const DISTRICTS_BY_STATE = {
  'Madhya Pradesh': ['Bhopal', 'Sehore', 'Indore', 'Jabalpur', 'Gwalior'],
  'Maharashtra': ['Nashik', 'Pune', 'Mumbai Suburban', 'Nagpur'],
  'Karnataka': ['Bengaluru Urban', 'Mysuru', 'Belagavi'],
  'West Bengal': ['Nadia', 'Kolkata', 'North 24 Parganas'],
  'Rajasthan': ['Ajmer', 'Jaipur', 'Jodhpur'],
  'Odisha': ['Ganjam', 'Khordha', 'Cuttack'],
  'Haryana': ['Ambala', 'Gurugram', 'Faridabad'],
};

const CONSTITUENCIES_BY_STATE = {
  'Madhya Pradesh': ['Bhopal (PC-19)', 'Indore (PC-26)', 'Vidisha (PC-18)'],
  'Maharashtra': ['Nashik (PC-20)', 'Dindori (PC-21)', 'Pune (PC-34)'],
  'Karnataka': ['Bengaluru Central (PC-25)', 'Bengaluru South (PC-26)'],
  'West Bengal': ['Ranaghat (PC-13)', 'Krishnanagar (PC-12)'],
  'Rajasthan': ['Ajmer (PC-13)', 'Jaipur (PC-07)'],
  'Odisha': ['Aska (PC-19)', 'Bhubaneswar (PC-18)'],
  'Haryana': ['Ambala (PC-01)', 'Kurukshetra (PC-02)'],
};

const CAPTCHAS = ['7K9M2', '4X8WP', 'A2N7R', '5M3TK'];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // STEP 1: Access Type Selection
  const [selectedRole, setSelectedRole] = useState(ROLES.IMPLEMENTING_AGENCY);

  // STEP 2: Progressive / Cascading Fields
  const [agencyType, setAgencyType] = useState('PWD (Public Works Department)');
  const [state, setState] = useState('Madhya Pradesh');
  const [district, setDistrict] = useState('Bhopal');
  const [constituency, setConstituency] = useState('Bhopal (PC-19)');
  const [vendorId, setVendorId] = useState('VND-007');
  const [centralDivision, setCentralDivision] = useState('MPLADS Division (MoSPI)');
  const [stateDept, setStateDept] = useState('Planning & Programme Monitoring Dept');
  const [vigilanceCell, setVigilanceCell] = useState('Central Zone Technical Inspection Unit');
  const [userId, setUserId] = useState('PWD-BPL-IA-001');
  const [password, setPassword] = useState('Demopass@2026');
  const [captchaInput, setCaptchaInput] = useState(CAPTCHAS[0]);
  const [captchaIdx, setCaptchaIdx] = useState(0);
  const [loading, setLoading] = useState(false);

  // When role changes, update default userId and geography
  const handleRoleChange = (role) => {
    setSelectedRole(role);
    if (role === ROLES.IMPLEMENTING_AGENCY) {
      setUserId('PWD-BPL-IA-001');
    } else if (role === ROLES.DISTRICT_AUTHORITY) {
      setUserId('DA-BPL-001');
    } else if (role === ROLES.VENDOR) {
      setUserId('VND-007-USER');
    } else if (role === ROLES.STATE_NODAL_AUTHORITY) {
      setUserId('SNA-MP-001');
    } else if (role === ROLES.CENTRAL_NODAL_AGENCY) {
      setUserId('CNA-MOSPI-001');
    } else if (role === ROLES.MP) {
      setUserId('MP-LS-BPL-19');
    } else if (role === ROLES.INVESTIGATOR) {
      setUserId('VIG-INSP-042');
    }
  };

  const handleStateChange = (newState) => {
    setState(newState);
    const availableDistricts = DISTRICTS_BY_STATE[newState] || ['District 1'];
    setDistrict(availableDistricts[0]);
    const availableConst = CONSTITUENCIES_BY_STATE[newState] || ['Constituency 1'];
    setConstituency(availableConst[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Build typed session context matching user's selections
    let profile = { ...DEFAULT_PROFILES[selectedRole] };

    if (selectedRole === ROLES.IMPLEMENTING_AGENCY) {
      profile = {
        role: ROLES.IMPLEMENTING_AGENCY,
        roleTitle: 'IMPLEMENTING AGENCY',
        agencyType: agencyType,
        organizationName: `${agencyType.split('(')[0].trim()} (${district})`,
        state: state,
        district: district,
        subTitle: `${agencyType.split('(')[0].trim()} • ${district}, ${state}`,
        userId: userId || 'PWD-BPL-IA-001',
        userName: 'Er. S. K. Sharma',
        designation: 'Executive Engineer',
        landingRoute: '/dashboard',
      };
    } else if (selectedRole === ROLES.DISTRICT_AUTHORITY) {
      profile = {
        role: ROLES.DISTRICT_AUTHORITY,
        roleTitle: 'DISTRICT AUTHORITY',
        organizationName: `District Collectorate (${district})`,
        state: state,
        district: district,
        subTitle: `${district}, ${state}`,
        userId: userId || 'DA-BPL-001',
        userName: 'R. Venkatraman, IAS',
        designation: 'District Collector & Nodal Officer',
        landingRoute: '/district-dashboard',
      };
    } else if (selectedRole === ROLES.VENDOR) {
      const selectedVendorObj = vendors.find(v => v.id === vendorId) || vendors[0];
      profile = {
        role: ROLES.VENDOR,
        roleTitle: 'VENDOR / CONTRACTOR',
        organizationName: selectedVendorObj.legalName,
        vendorId: selectedVendorObj.id,
        state: selectedVendorObj.state,
        district: selectedVendorObj.primaryDistrict,
        subTitle: `${selectedVendorObj.legalName} • ID: ${selectedVendorObj.id}`,
        userId: userId || `${selectedVendorObj.id}-USER`,
        userName: 'Authorized Signatory',
        designation: 'Vendor Representative',
        landingRoute: '/vendor-dashboard',
      };
    } else if (selectedRole === ROLES.STATE_NODAL_AUTHORITY) {
      profile = {
        role: ROLES.STATE_NODAL_AUTHORITY,
        roleTitle: 'STATE NODAL AUTHORITY',
        organizationName: `${state} State Directorate`,
        state: state,
        district: 'Statewide',
        subTitle: `${stateDept} • ${state}`,
        userId: userId || 'SNA-001',
        userName: 'Anita Deshmukh, IAS',
        designation: 'Principal Secretary (Planning)',
        landingRoute: '/state-dashboard',
      };
    } else if (selectedRole === ROLES.CENTRAL_NODAL_AGENCY) {
      profile = {
        role: ROLES.CENTRAL_NODAL_AGENCY,
        roleTitle: 'CENTRAL NODAL AGENCY',
        organizationName: 'Ministry of Statistics & Programme Implementation',
        state: 'National',
        district: 'All States & UTs',
        subTitle: `${centralDivision} • New Delhi`,
        userId: userId || 'CNA-MOSPI-001',
        userName: 'Dr. Alok Verma',
        designation: 'Joint Secretary (MPLADS Division)',
        landingRoute: '/national-dashboard',
      };
    } else if (selectedRole === ROLES.MP) {
      profile = {
        role: ROLES.MP,
        roleTitle: 'MEMBER OF PARLIAMENT',
        organizationName: `Parliamentary Office (${constituency})`,
        state: state,
        constituency: constituency,
        subTitle: `${constituency}, ${state}`,
        userId: userId || 'MP-USER-01',
        userName: 'Hon. Member of Parliament',
        designation: 'Lok Sabha Representative',
        landingRoute: '/mp-dashboard',
      };
    } else if (selectedRole === ROLES.INVESTIGATOR) {
      profile = {
        role: ROLES.INVESTIGATOR,
        roleTitle: 'INSPECTOR / INVESTIGATOR',
        organizationName: 'SAKSHAM Statutory Vigilance Cell',
        state: 'Multi-State',
        district: vigilanceCell,
        subTitle: `${vigilanceCell}`,
        userId: userId || 'VIG-INSP-042',
        userName: 'Vikramaditya Roy',
        designation: 'Senior Vigilance & Risk Auditor',
        landingRoute: '/investigations',
      };
    }

    setTimeout(() => {
      login(profile);
      setLoading(false);
      navigate(profile.landingRoute);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center p-4 py-8">
      <main className="w-full max-w-xl bg-surface-card rounded-2xl p-6 sm:p-8 shadow-md border border-border-subtle">
        {/* Security Header */}
        <div className="flex items-center justify-between mb-5 bg-slate-50 rounded-xl px-4 py-2 border border-border-subtle">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-text-secondary font-semibold uppercase tracking-wider text-[11px]">
              NIC SAKSHAM SECURE GATEWAY
            </span>
          </div>
          <div className="flex items-center gap-1 text-primary text-xs font-semibold">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>lock</span>
            <span className="text-[11px]">256-Bit TLS Guard</span>
          </div>
        </div>

        {/* Logo & Portal Identity */}
        <div className="flex flex-col items-center text-center mb-6">
          <img src={logo} alt="SAKSHAM Portal" className="h-12 w-auto object-contain mb-2" />
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Administrative Sign In
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-sm">
            e-SAKSHI &amp; MPLADS Fiscal Oversight and Automated Risk Intelligence
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* STEP 1: Select Access Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Step 1: Select Access Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ACCESS_TYPES.map((type) => {
                const isSelected = selectedRole === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleRoleChange(type.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'border-primary bg-blue-50 text-primary font-semibold shadow-xs ring-1 ring-primary'
                        : 'border-border-subtle bg-slate-50 text-slate-700 hover:bg-slate-100 font-normal'
                    }`}
                  >
                    <span className="material-symbols-outlined text-slate-500" style={{ fontSize: 18 }}>
                      {type.icon}
                    </span>
                    <span className="text-xs truncate">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Progressive Cascading Organization Fields */}
          <div className="p-4 rounded-xl bg-slate-50 border border-border-subtle space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Step 2: Organization &amp; Authority Details
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">
                {selectedRole.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Sub-fields for IMPLEMENTING AGENCY */}
            {selectedRole === ROLES.IMPLEMENTING_AGENCY && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-600 font-medium mb-1">Agency Type</label>
                  <select
                    className="saksham-input text-xs font-medium"
                    value={agencyType}
                    onChange={(e) => setAgencyType(e.target.value)}
                  >
                    {AGENCY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 font-medium mb-1">State</label>
                    <select
                      className="saksham-input text-xs"
                      value={state}
                      onChange={(e) => handleStateChange(e.target.value)}
                    >
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 font-medium mb-1">District</label>
                    <select
                      className="saksham-input text-xs"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                    >
                      {(DISTRICTS_BY_STATE[state] || ['Bhopal']).map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-600 font-medium mb-1">Authorized User ID</label>
                  <input
                    type="text"
                    required
                    className="saksham-input text-xs font-mono"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="e.g. PWD-BPL-IA-001"
                  />
                </div>
              </div>
            )}

            {/* Sub-fields for DISTRICT AUTHORITY */}
            {selectedRole === ROLES.DISTRICT_AUTHORITY && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 font-medium mb-1">State</label>
                    <select
                      className="saksham-input text-xs"
                      value={state}
                      onChange={(e) => handleStateChange(e.target.value)}
                    >
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 font-medium mb-1">District</label>
                    <select
                      className="saksham-input text-xs"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                    >
                      {(DISTRICTS_BY_STATE[state] || ['Bhopal']).map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-600 font-medium mb-1">Authorized User ID / Email</label>
                  <input
                    type="text"
                    required
                    className="saksham-input text-xs font-mono"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="e.g. DA-BPL-001"
                  />
                </div>
              </div>
            )}

            {/* Sub-fields for VENDOR */}
            {selectedRole === ROLES.VENDOR && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-600 font-medium mb-1">Select Vendor Organization</label>
                  <select
                    className="saksham-input text-xs font-medium"
                    value={vendorId}
                    onChange={(e) => {
                      setVendorId(e.target.value);
                      setUserId(`${e.target.value}-USER`);
                    }}
                  >
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.id}: {v.legalName} ({v.riskLevel} Risk • {v.state})
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Source: Authoritative synthetic mock dataset (Vendors.md)
                  </span>
                </div>

                <div>
                  <label className="block text-xs text-slate-600 font-medium mb-1">Vendor User ID</label>
                  <input
                    type="text"
                    required
                    className="saksham-input text-xs font-mono"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Sub-fields for STATE NODAL AUTHORITY */}
            {selectedRole === ROLES.STATE_NODAL_AUTHORITY && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 font-medium mb-1">State Administration</label>
                    <select
                      className="saksham-input text-xs"
                      value={state}
                      onChange={(e) => handleStateChange(e.target.value)}
                    >
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 font-medium mb-1">Department</label>
                    <input
                      type="text"
                      className="saksham-input text-xs"
                      value={stateDept}
                      onChange={(e) => setStateDept(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-600 font-medium mb-1">Authorized Official User ID</label>
                  <input
                    type="text"
                    required
                    className="saksham-input text-xs font-mono"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Sub-fields for CENTRAL NODAL AGENCY */}
            {selectedRole === ROLES.CENTRAL_NODAL_AGENCY && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-600 font-medium mb-1">Department / Division</label>
                  <input
                    type="text"
                    className="saksham-input text-xs"
                    value={centralDivision}
                    onChange={(e) => setCentralDivision(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 font-medium mb-1">Central User ID</label>
                  <input
                    type="text"
                    required
                    className="saksham-input text-xs font-mono"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Sub-fields for MP */}
            {selectedRole === ROLES.MP && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 font-medium mb-1">State</label>
                    <select
                      className="saksham-input text-xs"
                      value={state}
                      onChange={(e) => handleStateChange(e.target.value)}
                    >
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 font-medium mb-1">Parliamentary Constituency</label>
                    <select
                      className="saksham-input text-xs font-medium"
                      value={constituency}
                      onChange={(e) => setConstituency(e.target.value)}
                    >
                      {(CONSTITUENCIES_BY_STATE[state] || ['Bhopal (PC-19)']).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-600 font-medium mb-1">MP Credential ID</label>
                  <input
                    type="text"
                    required
                    className="saksham-input text-xs font-mono"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Sub-fields for INVESTIGATOR */}
            {selectedRole === ROLES.INVESTIGATOR && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-600 font-medium mb-1">Vigilance Cell / Inspection Division</label>
                  <input
                    type="text"
                    className="saksham-input text-xs font-medium"
                    value={vigilanceCell}
                    onChange={(e) => setVigilanceCell(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-600 font-medium mb-1">Auditor Badge ID</label>
                  <input
                    type="text"
                    required
                    className="saksham-input text-xs font-mono"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Password & Captcha (Always displayed at bottom of step 2) */}
            <div className="pt-2 border-t border-border-subtle grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-600 font-medium mb-1">Passkey / PIN</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="saksham-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 font-medium mb-1">Security Captcha</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white rounded-lg py-1.5 px-2.5 text-center font-mono font-bold tracking-widest text-slate-700 text-xs border border-border-subtle select-none">
                    {CAPTCHAS[captchaIdx]}
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    className="w-20 saksham-input text-xs font-mono text-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-primary hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: 16 }}>autorenew</span>
                <span>Authenticating Credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In as {selectedRole.replace(/_/g, ' ')}</span>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center text-[11px] text-slate-400">
          Complies with General Financial Rules (GFR Rule 144) • NIC MoSPI Infrastructure
        </div>
      </main>
    </div>
  );
}

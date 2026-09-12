import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth, ROLES } from '../auth/AuthContext.jsx';
import { createVendor, updateVendor, fetchVendorDetails } from '../api/sakshamApi.js';

const sectors = [
  'Civil Works / Rural Roads / Drainage',
  'Roads / Culverts / Rural Civil Works',
  'Drinking Water Systems / Pumps / Pipelines',
  'IT Hardware / Networking / E-Governance',
  'Bridges / RCC Works / Public Buildings',
  'Solar Street Lighting / Electrical Works',
  'Sanitation / Community Facilities',
  'Other Infrastructure',
];

const sections = [
  { id: 'basic', title: 'Basic Information', icon: 'badge' },
  { id: 'registration', title: 'Registration & Compliance', icon: 'verified' },
  { id: 'bank', title: 'Bank & Financial Identifiers', icon: 'account_balance' },
];

export default function AddEditVendor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { session } = useAuth();

  const isEdit = Boolean(id);
  const [activeSection, setActiveSection] = useState('basic');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const [formData, setFormData] = useState({
    company_name: '',
    sector: 'Civil Works / Rural Roads / Drainage',
    contact_person: '',
    contact_phone: '',
    district: session?.district || '',
    state: session?.state || '',
    registered_address: '',
    gstin: '',
    pan: '',
    bank_account_hash: '',
    director_dins: '',
  });

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      fetchVendorDetails(id, session)
        .then((res) => {
          if (res?.data?.vendor) {
            const v = res.data.vendor;
            setFormData({
              company_name: v.company_name || v.name || '',
              sector: v.sector || 'Civil Works / Rural Roads / Drainage',
              contact_person: v.contact_person || '',
              contact_phone: v.contact_phone || '',
              district: v.district || '',
              state: v.state || '',
              registered_address: v.registered_address || '',
              gstin: v.gstin || '',
              pan: v.pan || '',
              bank_account_hash: v.bank_account_hash || '',
              director_dins: Array.isArray(v.director_dins) ? v.director_dins.join(', ') : '',
            });
          }
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id, isEdit, session]);

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!formData.company_name.trim() || !formData.gstin.trim()) {
      setError('Company Name and GSTIN are statutory requirements.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload = {
        company_name: formData.company_name.trim(),
        name: formData.company_name.trim(),
        sector: formData.sector,
        district: formData.district.trim(),
        state: formData.state.trim(),
        registered_address: formData.registered_address.trim(),
        gstin: formData.gstin.trim().toUpperCase(),
        pan: formData.pan.trim().toUpperCase(),
        bank_account_hash: formData.bank_account_hash.trim() || null,
        director_dins: formData.director_dins
          ? formData.director_dins.split(',').map((d) => d.trim()).filter(Boolean)
          : [],
      };

      if (isEdit) {
        await updateVendor(id, payload, session);
      } else {
        await createVendor(payload, session);
      }

      setSaved(true);
      setTimeout(() => navigate('/vendors'), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-text-muted text-xs">
        Loading existing vendor record for editing...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <button className="text-text-secondary hover:text-text-primary" onClick={() => navigate('/vendors')}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
            </button>
            <h1 className="font-semibold text-text-primary tracking-tight" style={{ fontSize: 24 }}>
              {isEdit ? `Edit Vendor (${id})` : 'Register New Vendor'}
            </h1>
          </div>
          <p className="text-text-secondary mt-0.5" style={{ fontSize: 13 }}>
            {isEdit
              ? 'Update authoritative contractor registry and compliance identifiers.'
              : 'Register an implementing contractor into the SAKSHAM decision-support ecosystem.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button className="btn-secondary" onClick={() => navigate('/vendors')}>
            Cancel
          </button>
          <button
            className={`btn-primary ${saved ? '!bg-emerald-600' : ''}`}
            onClick={handleSave}
            disabled={saving}
          >
            {saved ? (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>done</span> Saved!
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>save</span>
                <span>{saving ? 'Persisting...' : isEdit ? 'Save Changes' : 'Register Vendor'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-rose-600" style={{ fontSize: 18 }}>error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Section Tabs */}
      <div className="flex gap-1 bg-surface-subtle p-1 rounded-xl overflow-x-auto">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-all font-medium ${
              activeSection === s.id
                ? 'bg-surface-card text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
            style={{ fontSize: 13 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{s.icon}</span>
            {s.title}
          </button>
        ))}
      </div>

      {/* Form Sections */}
      <div className="saksham-card">
        {activeSection === 'basic' && (
          <div>
            <h2 className="font-semibold text-text-primary mb-4" style={{ fontSize: 16 }}>Basic Entity Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-text-primary font-medium" style={{ fontSize: 12 }}>
                  Entity / Company Legal Name <span className="text-status-danger-text">*</span>
                </label>
                <input
                  className="saksham-input"
                  placeholder="e.g. Aarya Infraworks Private Limited"
                  value={formData.company_name}
                  onChange={(e) => handleChange('company_name', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-text-primary font-medium" style={{ fontSize: 12 }}>
                  Primary Sector <span className="text-status-danger-text">*</span>
                </label>
                <select
                  className="saksham-input"
                  value={formData.sector}
                  onChange={(e) => handleChange('sector', e.target.value)}
                >
                  {sectors.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-text-primary font-medium" style={{ fontSize: 12 }}>
                  District <span className="text-status-danger-text">*</span>
                </label>
                <input
                  className="saksham-input"
                  placeholder="e.g. Sehore"
                  value={formData.district}
                  onChange={(e) => handleChange('district', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-text-primary font-medium" style={{ fontSize: 12 }}>
                  State <span className="text-status-danger-text">*</span>
                </label>
                <input
                  className="saksham-input"
                  placeholder="e.g. Madhya Pradesh"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-text-primary font-medium" style={{ fontSize: 12 }}>
                  Authorised Signatory Contact Phone
                </label>
                <input
                  className="saksham-input"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={formData.contact_phone}
                  onChange={(e) => handleChange('contact_phone', e.target.value)}
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-text-primary font-medium" style={{ fontSize: 12 }}>
                  Registered Office Address
                </label>
                <textarea
                  className="saksham-input"
                  rows={3}
                  placeholder="Official registered address for statutory service of notices"
                  value={formData.registered_address}
                  onChange={(e) => handleChange('registered_address', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'registration' && (
          <div>
            <h2 className="font-semibold text-text-primary mb-4" style={{ fontSize: 16 }}>
              Statutory Tax & Company Identifiers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-text-primary font-medium" style={{ fontSize: 12 }}>
                  GSTIN (15 Digits) <span className="text-status-danger-text">*</span>
                </label>
                <input
                  className="saksham-input font-mono"
                  placeholder="23AAACA0001A1Z5"
                  maxLength={15}
                  value={formData.gstin}
                  onChange={(e) => handleChange('gstin', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-text-primary font-medium" style={{ fontSize: 12 }}>
                  Permanent Account Number (PAN)
                </label>
                <input
                  className="saksham-input font-mono"
                  placeholder="AAACA0001A"
                  maxLength={10}
                  value={formData.pan}
                  onChange={(e) => handleChange('pan', e.target.value)}
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-text-primary font-medium" style={{ fontSize: 12 }}>
                  Director Identification Numbers (DINs) — comma separated
                </label>
                <input
                  className="saksham-input font-mono"
                  placeholder="DIN00123456, DIN00987654"
                  value={formData.director_dins}
                  onChange={(e) => handleChange('director_dins', e.target.value)}
                />
                <p className="text-[11px] text-text-muted">
                  Used by SAKSHAM Collusion Risk Engine to detect shell overlaps and circular bidding rings.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'bank' && (
          <div>
            <h2 className="font-semibold text-text-primary mb-4" style={{ fontSize: 16 }}>
              PFMS & Bank Verification Hash
            </h2>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-text-primary font-medium" style={{ fontSize: 12 }}>
                  Bank Account Hash (SHA-256)
                </label>
                <input
                  className="saksham-input font-mono"
                  placeholder="e.g. 5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"
                  value={formData.bank_account_hash}
                  onChange={(e) => handleChange('bank_account_hash', e.target.value)}
                />
                <p className="text-[11px] text-text-muted">
                  In compliance with privacy guardrails, raw bank account numbers are never stored in plain text.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

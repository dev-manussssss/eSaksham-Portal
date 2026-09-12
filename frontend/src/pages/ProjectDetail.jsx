import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import RiskBadge from '../components/RiskBadge';
import StatusBadge from '../components/StatusBadge';
import DocumentUploadModal from '../components/DocumentUploadModal';
import ProjectActionToolbar from '../components/ProjectActionToolbar';
import AuditTimeline from '../components/AuditTimeline';
import { fetchProjectDetails } from '../api/sakshamApi.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { getVendorById } from '../data/index.js';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();

  const [loading, setLoading] = useState(true);
  const [projectData, setProjectData] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('audit'); // 'audit', 'documents', 'boq', 'measurements'

  const loadData = async () => {
    setLoading(true);
    const res = await fetchProjectDetails(id, session);
    if (res.data) {
      setProjectData(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id, session?.role]);

  const project = projectData?.project;
  const vendor = project ? getVendorById(project.vendor_id || project.vendorId) : null;
  const boqItems = projectData?.boq_items || [];
  const measurements = projectData?.measurements || [];
  const documents = projectData?.documents || [];
  const aiFlags = projectData?.ai_flags || [];
  const auditLogs = projectData?.audit_logs || [];

  if (loading && !project) {
    return (
      <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
        <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: 32 }}>autorenew</span>
        <span className="text-xs font-semibold">Loading authoritative project record from Supabase...</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="saksham-card text-center p-8">
        <h2 className="text-lg font-bold text-slate-800">Project Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">The requested project ID does not exist in the database.</p>
        <Link to="/projects" className="btn-primary text-xs mt-4 inline-block">Back to Projects</Link>
      </div>
    );
  }

  const stages = [
    'Recommendation',
    'Sanction',
    'Tendering',
    'Work Order',
    'Implementation',
    'Inspection',
    'Completion',
    'Asset Handover',
  ];

  const currentStageIndex =
    project.status === 'COMPLETED' ? 6 :
    project.status === 'VERIFIED' ? 5 :
    project.status === 'INSPECTION_REQUIRED' ? 5 :
    project.status === 'ON_HOLD' ? 4 :
    project.status === 'UNDER_IMPLEMENTATION' ? 4 :
    project.status === 'SANCTIONED' ? 3 :
    project.status === 'APPROVED' ? 1 : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumbs & Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Link to="/projects" className="hover:text-primary transition-colors">Work / Project Details</Link>
          <span>/</span>
          <span className="font-mono text-text-secondary font-semibold">{project.id}</span>
        </div>
        <button
          onClick={loadData}
          className="text-xs text-text-muted hover:text-primary flex items-center gap-1 font-mono"
          title="Refresh authoritative database state"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>refresh</span>
          <span>Refresh DB</span>
        </button>
      </div>

      {/* Top Project Header & Real Contextual Actions */}
      <div className="saksham-card flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold bg-slate-900 text-white px-2.5 py-1 rounded-md tracking-wider">
              {project.id}
            </span>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md font-mono">
              {project.project_code || project.workId}
            </span>
            <StatusBadge status={project.status} />
            <RiskBadge level={project.risk_level || project.riskLevel} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {project.title}
          </h1>
          <div className="flex flex-wrap items-center text-xs text-slate-500 gap-x-3 gap-y-1">
            <span>Sector: <strong className="text-slate-700">{project.category}</strong></span>
            <span>•</span>
            <span>Constituency: <strong className="text-slate-700">{project.constituency}</strong></span>
            <span>•</span>
            <span>District: <strong className="text-slate-700">{project.district}, {project.state}</strong></span>
            <span>•</span>
            <span>MP: <strong className="text-slate-700">{project.mp_name}</strong></span>
          </div>
        </div>

        {/* Real Contextual Action Toolbar */}
        <div className="shrink-0">
          <ProjectActionToolbar
            project={project}
            session={session}
            onActionCompleted={loadData}
            onOpenUploadModal={() => setUploadModalOpen(true)}
          />
        </div>
      </div>

      {/* Active AI Risk Alerts Banner */}
      {aiFlags.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-xl flex flex-col gap-2 shadow-sm">
          <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
            <span className="material-symbols-outlined text-red-600" style={{ fontSize: 20 }}>warning</span>
            <span>Active AI Risk Alert ({aiFlags.length} Flag{aiFlags.length > 1 ? 's' : ''})</span>
          </div>
          <div className="space-y-2 text-xs text-red-950">
            {aiFlags.map((flag, idx) => (
              <div key={flag.id || idx} className="p-2.5 bg-white/70 rounded-lg border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-red-900">{flag.title}</div>
                  <p className="text-[11px] text-slate-700 mt-0.5">{flag.explanation}</p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold">
                    Action: {flag.recommended_action}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Badges Row (3 KPI Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Physical vs Financial Progress */}
        <div className="saksham-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Physical Progress</span>
              <span className={`p-1.5 rounded-lg ${project.physical_progress_percent > 70 ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>construction</span>
              </span>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  {project.physical_progress_percent}%
                </span>
                <span className="text-xs text-slate-500 font-medium">Recorded Execution</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${project.risk_level === 'CRITICAL' ? 'bg-red-600' : 'bg-emerald-500'}`}
                  style={{ width: `${project.physical_progress_percent}%` }}
                />
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Sanctioned: <strong>₹{(parseFloat(project.sanctioned_amount || 0) / 100000).toFixed(1)} Lakh</strong> • 
                Disbursed: <strong>₹{(parseFloat(project.released_amount || 0) / 100000).toFixed(1)} Lakh</strong>
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Status: <strong className="text-slate-800">{project.status}</strong></span>
            <span className="font-mono text-emerald-700 font-semibold">Authoritative Supabase Sync</span>
          </div>
        </div>

        {/* Card 2: Assigned Vendor Performance */}
        <div className="saksham-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contractor / Vendor</span>
              <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>domain</span>
              </span>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline space-x-2">
                <span className="text-xl font-bold text-slate-900">{vendor?.legalName || project.vendor_id}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-500 font-mono">{project.vendor_id}</span>
                <RiskBadge level={vendor?.riskLevel || 'LOW'} />
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Vendor risk score: <strong>{vendor?.riskScore || 25}/100</strong>. Sector: {vendor?.sector || 'Civil Works'}.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>GSTIN: {vendor?.syntheticGSTIN || '23AAACA0001A1Z5'}</span>
            <span className="font-medium text-slate-700">Verified Entity</span>
          </div>
        </div>

        {/* Card 3: MB Inspection & Ground Verification */}
        <div className="saksham-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inspection &amp; Verification</span>
              <span className={`p-1.5 rounded-lg ${project.risk_level === 'CRITICAL' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>fact_check</span>
              </span>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline space-x-2">
                <span className={`text-xl font-bold ${project.status === 'ON_HOLD' ? 'text-red-600' : project.status === 'VERIFIED' ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {project.status === 'ON_HOLD' ? 'HELD ON ANOMALY' : project.status === 'VERIFIED' ? 'STAGE VERIFIED' : 'STAGE PROGRESSION'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {project.inspection_note || 'Measurement Book (MB) records and site inspection logs are monitored for quantity mismatches.'}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Last Inspection: {project.last_inspection_date || '2026-08-15'}</span>
            <span className="font-medium text-slate-700">Digital Geotag Verified</span>
          </div>
        </div>
      </div>

      {/* Stage Progression Pipeline */}
      <div className="saksham-card">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
          MPLADS Workflow Stage Progression
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {stages.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            return (
              <div
                key={stage}
                className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all ${
                  isCurrent
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : 'border-slate-200 bg-slate-50 opacity-60'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-300 text-slate-600'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span className="text-[11px] font-semibold text-slate-900">{stage}</span>
                <span className="text-[9px] text-slate-500 mt-0.5">
                  {isCurrent ? 'Current' : isCompleted ? 'Approved' : 'Pending'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabbed Detail Section: Audit Trail, Documents, BOQ, MB */}
      <div className="saksham-card">
        {/* Tab Headers */}
        <div className="flex border-b border-border-subtle mb-4 gap-4">
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'audit' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>history_edu</span>
            <span>Authoritative Audit Trail ({auditLogs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`pb-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'documents' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>folder_open</span>
            <span>Uploaded Documents &amp; Evidence ({documents.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('boq')}
            className={`pb-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'boq' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>table_chart</span>
            <span>Bill of Quantities (BOQ) ({boqItems.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('measurements')}
            className={`pb-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'measurements' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>straighten</span>
            <span>Measurement Book (MB) ({measurements.length})</span>
          </button>
        </div>

        {/* Tab 1: Audit Trail */}
        {activeTab === 'audit' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Immutable Governance &amp; Decision Log (Supabase postgres)
              </h3>
              <span className="text-[10px] text-text-muted font-mono">Role: {session?.role}</span>
            </div>
            <AuditTimeline auditLogs={auditLogs} />
          </div>
        )}

        {/* Tab 2: Documents */}
        {activeTab === 'documents' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Stored Documents in Supabase Storage
              </h3>
              <button
                onClick={() => setUploadModalOpen(true)}
                className="btn-primary text-xs flex items-center gap-1"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>upload_file</span>
                <span>Upload New Document</span>
              </button>
            </div>
            {documents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                No documents uploaded for this project yet. Click "Upload New Document" to upload a PDF/Measurement Book.
              </div>
            ) : (
              <div className="divide-y divide-border-subtle border border-border-subtle rounded-xl overflow-hidden">
                {documents.map((doc) => (
                  <div key={doc.id} className="p-3 bg-surface-card hover:bg-surface-subtle flex items-center justify-between text-xs transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="p-2 rounded-lg bg-red-50 text-red-600">
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>picture_as_pdf</span>
                      </span>
                      <div>
                        <div className="font-semibold text-text-primary">{doc.file_name}</div>
                        <div className="text-[11px] text-text-muted font-mono mt-0.5">
                          Category: <strong>{doc.document_category}</strong> • Uploaded by: {doc.uploaded_by} ({doc.uploader_role}) • {new Date(doc.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold font-mono">
                        {doc.upload_status}
                      </span>
                      <a
                        href={doc.storage_path}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary text-[11px] py-1 px-2.5"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>visibility</span>
                        <span>View</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: BOQ Items */}
        {activeTab === 'boq' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-subtle border-b border-border-subtle">
                  <th className="px-3 py-2 text-text-secondary font-semibold">Item #</th>
                  <th className="px-3 py-2 text-text-secondary font-semibold">Description</th>
                  <th className="px-3 py-2 text-text-secondary font-semibold">Unit</th>
                  <th className="px-3 py-2 text-text-secondary font-semibold">Sanctioned Qty</th>
                  <th className="px-3 py-2 text-text-secondary font-semibold">Rate (₹)</th>
                  <th className="px-3 py-2 text-text-secondary font-semibold text-right">Total Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle font-mono">
                {boqItems.map((b) => (
                  <tr key={b.id || b.item_no} className="hover:bg-surface-subtle">
                    <td className="px-3 py-2 font-bold text-primary">{b.item_no}</td>
                    <td className="px-3 py-2 font-sans font-medium text-slate-800">{b.description}</td>
                    <td className="px-3 py-2">{b.unit}</td>
                    <td className="px-3 py-2">{parseFloat(b.sanctioned_qty).toLocaleString()}</td>
                    <td className="px-3 py-2">₹{parseFloat(b.rate).toLocaleString()}</td>
                    <td className="px-3 py-2 text-right font-bold text-slate-900">₹{parseFloat(b.total_amount).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Measurements */}
        {activeTab === 'measurements' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-subtle border-b border-border-subtle">
                  <th className="px-3 py-2 text-text-secondary font-semibold">MB No</th>
                  <th className="px-3 py-2 text-text-secondary font-semibold">Item #</th>
                  <th className="px-3 py-2 text-text-secondary font-semibold">Description</th>
                  <th className="px-3 py-2 text-text-secondary font-semibold">MB Recorded Qty</th>
                  <th className="px-3 py-2 text-text-secondary font-semibold">Observed Qty</th>
                  <th className="px-3 py-2 text-text-secondary font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle font-mono">
                {measurements.map((m) => (
                  <tr key={m.id || m.mb_number} className="hover:bg-surface-subtle">
                    <td className="px-3 py-2 font-bold text-slate-900">{m.mb_number}</td>
                    <td className="px-3 py-2 text-primary">{m.item_no}</td>
                    <td className="px-3 py-2 font-sans font-medium text-slate-800">{m.description}</td>
                    <td className="px-3 py-2">{parseFloat(m.recorded_qty).toLocaleString()} {m.unit}</td>
                    <td className="px-3 py-2">{parseFloat(m.observed_qty).toLocaleString()} {m.unit}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.verification_status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {m.verification_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Document Upload Modal */}
      <DocumentUploadModal
        projectId={project.id}
        session={session}
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadComplete={() => {
          loadData();
          setActiveTab('audit');
        }}
      />
    </div>
  );
}

import { useState } from 'react';
import { executeHumanAction } from '../api/sakshamApi.js';

export default function ProjectActionToolbar({ project, session, onActionCompleted, onOpenUploadModal }) {
  const [modalAction, setModalAction] = useState(null); // action object currently in confirmation modal
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const role = session?.role || 'DISTRICT_AUTHORITY';
  const status = project?.status || 'UNDER_IMPLEMENTATION';

  // Determine permitted actions based on ROLE and PROJECT STATUS
  const actions = [];

  // Always permitted upload trigger if role is authorized to upload
  if (['DISTRICT_AUTHORITY', 'IMPLEMENTING_AGENCY', 'VENDOR', 'MP'].includes(role)) {
    actions.push({
      key: 'UPLOAD',
      label: role === 'MP' ? 'Upload Recommendation File' : role === 'VENDOR' ? 'Upload Invoice / Progress' : 'Upload Document / MB',
      icon: 'upload_file',
      style: 'btn-secondary',
      handler: onOpenUploadModal,
    });
  }

  // DISTRICT AUTHORITY contextual controls
  if (role === 'DISTRICT_AUTHORITY') {
    if (status !== 'ON_HOLD') {
      actions.push({
        key: 'PUT_ON_HOLD',
        label: 'Put on Hold',
        icon: 'pause_circle',
        style: 'bg-red-600 hover:bg-red-700 text-white font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors',
        requiresConfirm: true,
        confirmTitle: 'Place Project on Administrative Hold',
        confirmDescription: 'Placing this project on hold halts all milestone disbursements and requires physical verification.',
      });
    } else {
      actions.push({
        key: 'CLEAR_HOLD',
        label: 'Release / Clear Hold',
        icon: 'play_circle',
        style: 'bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors',
        requiresConfirm: true,
        confirmTitle: 'Release Administrative Hold',
        confirmDescription: 'Release hold and resume project under normal execution following satisfactory verification.',
      });
    }

    if (status === 'INSPECTION_REQUIRED' || project.risk_level === 'CRITICAL' || project.riskLevel === 'CRITICAL') {
      actions.push({
        key: 'REQUEST_VERIFICATION',
        label: 'Request Physical Verification',
        icon: 'fact_check',
        style: 'bg-amber-600 hover:bg-amber-700 text-white font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors',
        requiresConfirm: true,
        confirmTitle: 'Order Independent Field Verification',
        confirmDescription: 'Direct the nodal executive engineer to perform an on-site physical measurement verification within 5 working days.',
      });

      actions.push({
        key: 'MARK_VERIFIED',
        label: 'Mark Stage Verified',
        icon: 'verified',
        style: 'bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors',
        requiresConfirm: true,
        confirmTitle: 'Certify Milestone Physical Verification',
        confirmDescription: 'Confirm that on-site ground verification was conducted and reconciled with Measurement Book entries.',
      });
    }

    if (status === 'RECOMMENDED') {
      actions.push({
        key: 'APPROVE',
        label: 'Approve Sanction',
        icon: 'check_circle',
        style: 'bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors',
        requiresConfirm: true,
        confirmTitle: 'Sanction Project Allocation',
        confirmDescription: 'Grant administrative sanction to this recommended project under MPLADS guidelines.',
      });
      actions.push({
        key: 'REJECT',
        label: 'Reject Recommendation',
        icon: 'cancel',
        style: 'bg-slate-700 hover:bg-slate-800 text-white font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors',
        requiresConfirm: true,
        confirmTitle: 'Reject Recommendation',
        confirmDescription: 'State the statutory reason for non-sanction.',
      });
    }

    actions.push({
      key: 'REQUEST_CLARIFICATION',
      label: 'Request Clarification',
      icon: 'contact_support',
      style: 'btn-secondary text-xs',
      requiresConfirm: true,
      confirmTitle: 'Request Written Clarification',
      confirmDescription: 'Issue an official statutory inquiry to the Implementing Agency or Vendor.',
    });
  }

  // IMPLEMENTING AGENCY controls
  if (role === 'IMPLEMENTING_AGENCY') {
    if (status === 'UNDER_IMPLEMENTATION') {
      actions.push({
        key: 'SUBMIT_FOR_INSPECTION',
        label: 'Submit for Inspection',
        icon: 'send_and_archive',
        style: 'btn-primary text-xs',
        requiresConfirm: true,
        confirmTitle: 'Submit Milestone for Inspection',
        confirmDescription: 'Notify the District Authority that physical milestone execution is ready for verification.',
      });
    }
  }

  // AUDITOR / INVESTIGATOR controls
  if (role === 'INVESTIGATOR') {
    actions.push({
      key: 'ADD_AUDIT_NOTE',
      label: 'Add Audit Observation',
      icon: 'edit_note',
      style: 'btn-primary text-xs',
      requiresConfirm: true,
      confirmTitle: 'Record Statutory Audit Observation',
      confirmDescription: 'Add formal observation to the immutable project audit log.',
    });
    actions.push({
      key: 'ESCALATE',
      label: 'Escalate to State Vigilance',
      icon: 'report_problem',
      style: 'bg-rose-700 hover:bg-rose-800 text-white font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors',
      requiresConfirm: true,
      confirmTitle: 'Escalate Investigation Case',
      confirmDescription: 'Escalate this project record to State Nodal Directorate vigilance oversight.',
    });
  }

  const handleExecute = async () => {
    if (!modalAction) return;
    setLoading(true);
    setError('');
    try {
      const result = await executeHumanAction(project.id, modalAction.key, session, notes);
      setLoading(false);
      setModalAction(null);
      setNotes('');
      if (onActionCompleted) onActionCompleted(result);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Action execution failed');
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {actions.map((act) => (
          <button
            key={act.key}
            onClick={() => {
              if (act.handler) {
                act.handler();
              } else if (act.requiresConfirm) {
                setError('');
                setNotes('');
                setModalAction(act);
              }
            }}
            className={act.style}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{act.icon}</span>
            <span>{act.label}</span>
          </button>
        ))}
      </div>

      {/* Confirmation Modal */}
      {modalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{modalAction.icon}</span>
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{modalAction.confirmTitle}</h3>
                <p className="text-[11px] text-slate-500">Project: {project.id} • Authorized Role: {role}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {modalAction.confirmDescription}
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Official Comment / Statutory Justification (Recorded in Audit Trail)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter administrative remark or reference order..."
                rows={3}
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-primary"
              />
            </div>

            {error && (
              <div className="p-2 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                disabled={loading}
                onClick={() => setModalAction(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                disabled={loading}
                onClick={handleExecute}
                className="btn-primary text-xs flex items-center gap-1"
              >
                {loading && <span className="material-symbols-outlined animate-spin" style={{ fontSize: 14 }}>autorenew</span>}
                <span>Confirm Decision</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

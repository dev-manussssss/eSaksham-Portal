import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RiskBadge from '../components/RiskBadge';
import StatusBadge from '../components/StatusBadge';
import { projects, getVendorById } from '../data/index.js';

export default function WorkProgress() {
  const navigate = useNavigate();
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0].id);

  const project = projects.find(p => p.id === selectedProjectId) || projects[0];
  const vendor = getVendorById(project.vendorId);

  const milestones = [
    { title: 'Administrative Sanction', date: 'Passed • 15 Jan 2026', status: 'completed' },
    { title: 'Vendor Award', date: `Awarded to ${project.vendorId} • 28 Feb 2026`, status: 'completed' },
    { title: 'Plinth & Foundation', date: 'Verified • 12 May 2026', status: 'completed' },
    {
      title: 'Superstructure Works',
      date: project.riskLevel === 'CRITICAL' ? 'Flagged Discrepancy • Aug 2026' : 'In Progress • Aug 2026',
      status: project.riskLevel === 'CRITICAL' ? 'flagged' : 'active',
    },
    { title: 'Final Handover', date: `Target: ${project.targetCompletion || '30 Nov 2026'}`, status: 'pending' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-text-primary tracking-tight text-2xl">
              Assign &amp; Work Progress Monitoring
            </h1>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-semibold">
              Stage Gate Engine
            </span>
          </div>
          <p className="text-text-secondary mt-0.5 text-xs">
            MPLADS milestone tracking, geo-tagged site inspection verification, and delay monitoring.
          </p>
        </div>

        {/* Project Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-text-muted font-medium">Select Work:</label>
          <select
            className="saksham-input text-xs max-w-xs font-medium"
            value={selectedProjectId}
            onChange={e => setSelectedProjectId(e.target.value)}
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.id}: {p.title.slice(0, 32)}... ({p.district})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Work Banner Card */}
      <div className="saksham-card flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="font-mono text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
              {project.id}
            </span>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {project.workId}
            </span>
            <StatusBadge status={project.status} />
            <RiskBadge level={project.riskLevel} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">{project.title}</h2>
          <p className="text-xs text-slate-500 mt-1">
            Agency: <strong className="text-slate-700">District Implementing Agency</strong> • Vendor:{' '}
            <strong className="text-slate-700">{vendor?.legalName || project.vendorId}</strong> • Location:{' '}
            <strong className="text-slate-700">{project.district}, {project.state}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right px-3 py-2 bg-surface-subtle rounded-xl border border-border-subtle">
            <div className="text-[10px] text-text-muted uppercase font-semibold">Sanctioned</div>
            <div className="text-sm font-bold font-mono text-slate-900">{project.sanctionedAmount}</div>
          </div>
          <div className="text-right px-3 py-2 bg-surface-subtle rounded-xl border border-border-subtle">
            <div className="text-[10px] text-text-muted uppercase font-semibold">Released</div>
            <div className="text-sm font-bold font-mono text-emerald-600">{project.releasedAmount}</div>
          </div>
        </div>
      </div>

      {/* Statutory Lifecycle Milestones Step Bar */}
      <div className="saksham-card">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold tracking-wider uppercase text-slate-500">
            Statutory Lifecycle Milestones
          </span>
          <span className="text-xs text-slate-400">
            Target Handover: <strong className="text-slate-700">{project.targetCompletion}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {milestones.map((m, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex flex-col items-center text-center ${
                m.status === 'completed'
                  ? 'border-emerald-200 bg-emerald-50/60'
                  : m.status === 'flagged'
                  ? 'border-red-200 bg-red-50/80 ring-2 ring-red-400'
                  : m.status === 'active'
                  ? 'border-blue-200 bg-blue-50/80'
                  : 'border-slate-200 bg-slate-50 opacity-60'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 ${
                  m.status === 'completed'
                    ? 'bg-emerald-600 text-white'
                    : m.status === 'flagged'
                    ? 'bg-red-600 text-white animate-pulse'
                    : m.status === 'active'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-300 text-slate-600'
                }`}
              >
                {m.status === 'completed' ? '✓' : idx + 1}
              </div>
              <div className="text-xs font-bold text-slate-900">{m.title}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{m.date}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 2-Column Dashboard: Inspection & Physical Progress Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1 & 2: Inspection Timeline & Site Verification */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Site Inspection Verification Record */}
          <div className="saksham-card">
            <h3 className="font-semibold text-text-primary text-sm mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: 18 }}>verified</span>
              Site Inspection History &amp; Geo-Telemetry
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-surface-subtle rounded-xl border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-slate-900">Stage Inspection #2 — Superstructure</div>
                  <div className="text-slate-500 text-[11px]">Inspector: Assistant Engineer (Roads) • 20 Aug 2026</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium text-[11px]">
                    Geo-Validated
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-medium text-[11px]">
                    Video Attached
                  </span>
                </div>
              </div>

              <div className="p-3 bg-surface-subtle rounded-xl border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-slate-900">Stage Inspection #1 — Foundation &amp; Excavation</div>
                  <div className="text-slate-500 text-[11px]">Inspector: Junior Engineer (Panchayati Raj) • 14 May 2026</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium text-[11px]">
                    MB Entry #8 Passed
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Site Photographic Evidence Feed */}
          <div className="saksham-card">
            <h3 className="font-semibold text-text-primary text-sm mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: 18 }}>photo_library</span>
              Timestamped Site Photographs
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-border-subtle p-2 bg-surface-subtle flex flex-col items-center text-center">
                <div className="w-full aspect-video bg-slate-200 rounded-lg flex items-center justify-center text-slate-500">
                  <span className="material-symbols-outlined" style={{ fontSize: 28 }}>image</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-900 mt-2">Excavation Complete</span>
                <span className="text-[10px] text-slate-500">12 May 2026 • 22.986° N</span>
              </div>
              <div className="rounded-xl border border-border-subtle p-2 bg-surface-subtle flex flex-col items-center text-center">
                <div className="w-full aspect-video bg-slate-200 rounded-lg flex items-center justify-center text-slate-500">
                  <span className="material-symbols-outlined" style={{ fontSize: 28 }}>image</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-900 mt-2">RCC Pouring Stage</span>
                <span className="text-[10px] text-slate-500">18 Jul 2026 • 22.987° N</span>
              </div>
              <div className="rounded-xl border border-border-subtle p-2 bg-surface-subtle flex flex-col items-center text-center">
                <div className="w-full aspect-video bg-slate-200 rounded-lg flex items-center justify-center text-slate-500">
                  <span className="material-symbols-outlined" style={{ fontSize: 28 }}>image</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-900 mt-2">Current Approach Status</span>
                <span className="text-[10px] text-slate-500">20 Aug 2026 • 22.988° N</span>
              </div>
            </div>
          </div>
        </div>

        {/* Col 3: Actions & Progress Stats */}
        <div className="flex flex-col gap-6">
          {/* Progress Breakdown */}
          <div className="saksham-card">
            <h3 className="font-semibold text-text-primary text-xs uppercase tracking-wider mb-4">
              Physical vs Financial Delta
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Physical Milestone</span>
                  <span className="font-mono font-bold text-slate-900">{project.physicalProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${project.physicalProgress}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Financial Disbursal</span>
                  <span className="font-mono font-bold text-slate-900">{project.utilizationPct}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${project.utilizationPct}%` }} />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 leading-relaxed border border-slate-200/60">
                Discrepancy tolerance: <strong>±10%</strong>. Current variance is within statutory limits under Section 4.3 of MPLADS Operating Handbook.
              </div>
            </div>
          </div>

          {/* Administrative Triggers */}
          <div className="saksham-card flex flex-col gap-2">
            <h3 className="font-semibold text-text-primary text-xs uppercase tracking-wider mb-1">
              Field Directives
            </h3>
            <button
              onClick={() => navigate(`/projects/${project.id}`)}
              className="btn-primary w-full justify-center"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>visibility</span>
              <span>View Full Project Audit</span>
            </button>
            <button
              onClick={() => navigate('/investigations')}
              className="btn-secondary w-full justify-center"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>manage_search</span>
              <span>Open Investigation Triage</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

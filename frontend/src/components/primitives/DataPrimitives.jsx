import React, { useState } from 'react';
import { Badge, StatusBadge, Button } from './CorePrimitives.jsx';

/**
 * 11. Tabs Primitive
 */
export function Tabs({ tabs = [], activeTab, onChange, className = '' }) {
  return (
    <div className={`flex border-b border-slate-200 gap-6 select-none ${className}`}>
      {tabs.map((tab) => {
        const id = typeof tab === 'object' ? tab.id : tab;
        const label = typeof tab === 'object' ? tab.label : tab;
        const count = typeof tab === 'object' ? tab.count : null;
        const isActive = activeTab === id;

        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`flex items-center gap-2 pb-3 pt-1 text-sm font-medium border-b-2 transition-colors ${
              isActive
                ? 'border-[#1F497D] text-[#1F497D]'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <span>{label}</span>
            {count !== null && (
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-semibold ${
                isActive ? 'bg-[#EEF4FA] text-[#1F497D]' : 'bg-slate-100 text-slate-600'
              }`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * 13. DataTable Primitive (Density controlled, responsive overflow)
 */
export function DataTable({
  columns = [],
  data = [],
  keyField = 'id',
  emptyMessage = 'No records match the current criteria.',
  onRowClick,
  className = '',
}) {
  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-slate-200 bg-white ${className}`}>
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold text-[11px]">
            {columns.map((col, idx) => (
              <th key={col.key || idx} className={`px-4 py-3 ${col.headerClassName || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={row[keyField] || rowIdx}
                onClick={() => onRowClick?.(row)}
                className={`transition-colors ${
                  onRowClick ? 'cursor-pointer hover:bg-blue-50/40' : 'hover:bg-slate-50/50'
                }`}
              >
                {columns.map((col, cIdx) => (
                  <td key={col.key || cIdx} className={`px-4 py-3 text-slate-700 ${col.cellClassName || ''}`}>
                    {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/**
 * 15. Search Primitive
 */
export function Search({ value, onChange, placeholder = 'Search records...', className = '' }) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <span className="material-symbols-outlined absolute left-3 text-slate-400 pointer-events-none" style={{ fontSize: 18 }}>
        search
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#1F497D] focus:ring-1 focus:ring-[#1F497D]"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2.5 text-slate-400 hover:text-slate-600"
          aria-label="Clear search"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
        </button>
      )}
    </div>
  );
}

/**
 * 17. PageHeader Primitive
 */
export function PageHeader({ title, subtitle, breadcrumbs = [], actions }) {
  return (
    <div className="mb-6">
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span>/</span>}
              <span className={idx === breadcrumbs.length - 1 ? 'font-medium text-slate-800' : ''}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </nav>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          {subtitle && <p className="text-xs md:text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2.5">{actions}</div>}
      </div>
    </div>
  );
}

/**
 * 18. MetricCard Primitive
 */
export function MetricCard({ title, value, subtitle, icon, trend, alert = false, className = '' }) {
  return (
    <div className={`p-4 bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{title}</span>
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[#1F497D]">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{icon}</span>
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
      {(subtitle || trend) && (
        <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
          {trend && (
            <span className={`font-semibold ${alert ? 'text-red-600' : 'text-emerald-600'}`}>
              {trend}
            </span>
          )}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </div>
  );
}

/**
 * 19. Timeline / Stage Tracker Primitive
 */
export function Timeline({ steps = [], currentStep = 0 }) {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div key={idx} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  isCompleted
                    ? 'bg-[#1F497D] border-[#1F497D] text-white'
                    : isCurrent
                    ? 'bg-white border-[#1F497D] text-[#1F497D] ring-4 ring-blue-50'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                {isCompleted ? '✓' : idx + 1}
              </div>
              <span className={`mt-2 text-[11px] font-medium whitespace-nowrap ${
                isCurrent ? 'text-slate-900 font-bold' : 'text-slate-500'
              }`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * 20. RiskIndicator Primitive
 */
export function RiskIndicator({ score = 0, level = 'LOW', label }) {
  const levelConfigs = {
    LOW: { color: 'text-emerald-700 bg-emerald-50 border-emerald-200', text: 'Low Risk' },
    MEDIUM: { color: 'text-amber-700 bg-amber-50 border-amber-200', text: 'Moderate Risk' },
    HIGH: { color: 'text-rose-700 bg-rose-50 border-rose-200', text: 'High Risk' },
    CRITICAL: { color: 'text-red-900 bg-red-100 border-red-300 font-bold', text: 'Critical Risk' },
  };

  const config = levelConfigs[level] || levelConfigs.LOW;

  return (
    <div className="inline-flex items-center gap-2">
      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${config.color}`}>
        {score}/100 • {label || config.text}
      </span>
    </div>
  );
}

/**
 * 22. AuditTimeline Primitive
 */
export function AuditTimeline({ events = [] }) {
  if (events.length === 0) {
    return <p className="text-xs text-slate-400 italic py-3">No recorded audit events.</p>;
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {events.map((ev, idx) => (
        <div key={ev.id || idx} className="relative">
          <div className="absolute -left-[1.65rem] top-1 w-3 h-3 rounded-full bg-[#1F497D] ring-4 ring-white" />
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-800">{ev.action}</span>
            <span className="text-[11px] text-slate-400">
              {ev.created_at ? new Date(ev.created_at).toLocaleString('en-IN') : 'Recent'}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">{ev.comment || ev.notes || 'Status transition logged.'}</p>
          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
            <span>Actor: {ev.actor_id || 'System'}</span>
            <span>•</span>
            <span>Role: {ev.role || 'Officer'}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

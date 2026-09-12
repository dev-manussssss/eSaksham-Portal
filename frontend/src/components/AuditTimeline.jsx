export default function AuditTimeline({ auditLogs = [] }) {
  if (!auditLogs || auditLogs.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
        No administrative actions or audit records logged yet.
      </div>
    );
  }

  const getBadgeStyle = (action) => {
    if (action.includes('HOLD')) return 'bg-red-100 text-red-700 border-red-200';
    if (action.includes('VERIF') || action.includes('APPROVED')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (action.includes('FLAG') || action.includes('ANOMALY')) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (action.includes('UPLOAD')) return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getActionIcon = (action) => {
    if (action.includes('HOLD')) return 'pause_circle';
    if (action.includes('VERIF')) return 'verified';
    if (action.includes('FLAG') || action.includes('ANOMALY')) return 'warning';
    if (action.includes('UPLOAD')) return 'upload_file';
    if (action.includes('SANCTION')) return 'assignment_turned_in';
    return 'history';
  };

  return (
    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {auditLogs.map((log, index) => {
        const dateObj = new Date(log.created_at || Date.now());
        const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

        return (
          <div key={log.id || index} className="relative text-xs">
            {/* Dot icon */}
            <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-600 shadow-sm">
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                {getActionIcon(log.action)}
              </span>
            </div>

            <div className="bg-surface-subtle p-3 rounded-xl border border-border-subtle flex flex-col gap-1">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getBadgeStyle(log.action)}`}>
                    {log.action.replace(/_/g, ' ')}
                  </span>
                  <span className="text-text-muted text-[11px] font-mono">
                    by <strong>{log.actor_id || log.role}</strong> ({log.role})
                  </span>
                </div>
                <span className="text-text-muted font-mono text-[10px]">
                  {timeStr} • {dateStr}
                </span>
              </div>

              {log.comment && (
                <p className="text-text-primary text-[11px] mt-0.5 leading-relaxed">
                  {log.comment}
                </p>
              )}

              {(log.previous_status || log.new_status) && log.previous_status !== log.new_status && (
                <div className="flex items-center gap-1 text-[10px] font-mono text-text-secondary mt-1">
                  <span>Status Transition:</span>
                  <span className="line-through text-slate-400">{log.previous_status}</span>
                  <span>→</span>
                  <span className="font-bold text-primary">{log.new_status}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * MetricCard — KPI tile used across dashboards.
 * Matches the Stitch design specification for metric cards.
 */
export default function MetricCard({
  label,
  value,
  unit = null,
  delta = null,
  deltaType = 'neutral', // 'up' | 'down' | 'neutral'
  icon,
  footnote = null,
  iconBgClass = 'bg-status-info-bg',
  iconTextClass = 'text-status-info-text',
}) {
  const deltaColors = {
    up: 'bg-status-success-bg text-status-success-text',
    down: 'bg-status-danger-bg text-status-danger-text',
    neutral: 'bg-surface-subtle text-text-secondary',
  };
  const deltaIcons = {
    up: 'arrow_upward',
    down: 'arrow_downward',
    neutral: 'remove',
  };

  return (
    <div className="saksham-card flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <span
          className="text-text-muted font-semibold uppercase tracking-wider"
          style={{ fontSize: 11, lineHeight: '14px', letterSpacing: '0.025em' }}
        >
          {label}
        </span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBgClass} ${iconTextClass}`}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{icon}</span>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-baseline gap-2">
          <span className="text-text-primary font-semibold" style={{ fontSize: 30, lineHeight: '36px', letterSpacing: '-0.025em' }}>
            {value}
          </span>
          {unit && <span className="text-text-muted" style={{ fontSize: 14 }}>{unit}</span>}
          {delta && (
            <span
              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-semibold ml-auto ${deltaColors[deltaType]}`}
              style={{ fontSize: 11 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{deltaIcons[deltaType]}</span>
              {delta}
            </span>
          )}
        </div>
        {footnote && (
          <p className="text-text-muted mt-1.5" style={{ fontSize: 13 }}>{footnote}</p>
        )}
      </div>
    </div>
  );
}

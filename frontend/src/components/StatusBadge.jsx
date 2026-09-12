import { getStatusConfig } from '../data/mockData';

/**
 * StatusBadge — workflow and operational status pill.
 */
export default function StatusBadge({ status, label = null }) {
  const cfg = getStatusConfig(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold ${cfg.bgClass} ${cfg.textClass}`}
      style={{ fontSize: 11, lineHeight: '14px', letterSpacing: '0.025em' }}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dotClass}`} />
      {label || cfg.label}
    </span>
  );
}

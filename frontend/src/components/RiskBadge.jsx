import { getRiskConfig } from '../data/mockData';

/**
 * RiskBadge — displays LOW / MEDIUM / HIGH / CRITICAL severity.
 * Score is optional (shown if provided).
 */
export default function RiskBadge({ level = 'MEDIUM', score = null }) {
  const cfg = getRiskConfig(level);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold ${cfg.bgClass} ${cfg.textClass}`}
      style={{ fontSize: 11, lineHeight: '14px', letterSpacing: '0.025em' }}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dotClass}`} />
      {cfg.label}
      {score !== null && <span className="opacity-70 font-normal">· {score}</span>}
    </span>
  );
}

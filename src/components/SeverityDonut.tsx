import type { NormalizedSeverity } from "@/types";

const SEV_HEX: Record<NormalizedSeverity, string> = {
  CRITICAL: "#f43f5e",
  HIGH: "#f97316",
  MEDIUM: "#eab308",
  LOW: "#38bdf8",
  UNKNOWN: "#64748b",
};

interface Slice {
  severity: NormalizedSeverity;
  count: number;
  share: number;
}

/**
 * Inline-SVG donut of the severity mix. Decorative companion to the labeled
 * bars (which carry the accessible breakdown), so it's aria-hidden.
 */
export function SeverityDonut({ data, total }: { data: Slice[]; total: number }) {
  const size = 132;
  const stroke = 16;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  const visible = data.filter((s) => s.count > 0);
  const segments = visible.map((s, i) => {
    const len = s.share * c;
    // Offset = total length of all preceding segments (no mutable accumulator).
    const preceding = visible.slice(0, i).reduce((sum, p) => sum + p.share, 0) * c;
    return { severity: s.severity, dash: len, gap: c - len, dashoffset: -preceding };
  });

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} aria-hidden>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        {segments.map((seg) => (
          <circle
            key={seg.severity}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={SEV_HEX[seg.severity]}
            strokeWidth={stroke}
            strokeDasharray={`${seg.dash} ${seg.gap}`}
            strokeDashoffset={seg.dashoffset}
            strokeLinecap="butt"
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tabular-nums leading-none">{total}</span>
        <span className="text-[10px] uppercase tracking-wide text-ink-muted">events</span>
      </div>
    </div>
  );
}

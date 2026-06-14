import { cn } from "@/lib/utils";
import type { NormalizedSeverity } from "@/types";

/**
 * Severity styling. Color is never the only signal — the text label is always
 * shown, and sorting uses an explicit rank (see normalize.ts), not color.
 */
const STYLES: Record<NormalizedSeverity, { dot: string; text: string; ring: string }> = {
  CRITICAL: { dot: "bg-sev-critical", text: "text-sev-critical", ring: "ring-sev-critical/40" },
  HIGH: { dot: "bg-sev-high", text: "text-sev-high", ring: "ring-sev-high/40" },
  MEDIUM: { dot: "bg-sev-medium", text: "text-sev-medium", ring: "ring-sev-medium/40" },
  LOW: { dot: "bg-sev-low", text: "text-sev-low", ring: "ring-sev-low/40" },
  UNKNOWN: { dot: "bg-sev-unknown", text: "text-sev-unknown", ring: "ring-sev-unknown/40" },
};

export function SeverityBadge({
  severity,
  className,
}: {
  severity: NormalizedSeverity;
  className?: string;
}) {
  const s = STYLES[severity];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        "bg-white/5 ring-1 ring-inset",
        s.text,
        s.ring,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full shadow-[0_0_8px_currentColor]", s.dot)} aria-hidden />
      {severity}
    </span>
  );
}

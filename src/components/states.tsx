import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Sonar-sweep loader — communicates "scanning telemetry". */
export function WaveLoader({ label = "Scanning telemetry…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20 text-ink-muted">
      <div className="relative size-16">
        <span className="absolute inset-0 rounded-full bg-ice-bright/30 [animation:var(--animate-sonar)]" />
        <span className="absolute inset-0 rounded-full bg-ice-bright/20 [animation:var(--animate-sonar)] [animation-delay:0.6s]" />
        <span className="absolute inset-[38%] rounded-full bg-ice-bright shadow-[0_0_12px_var(--color-ice-bright)]" />
      </div>
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card className="mx-auto max-w-md p-8 text-center">
      <p className="text-lg font-semibold text-sev-high">Something went sideways</p>
      <p className="mt-2 text-sm text-ink-muted">{message}</p>
      {onRetry && (
        <Button className="mt-5" onClick={onRetry}>
          Retry
        </Button>
      )}
    </Card>
  );
}

export function EmptyState({
  title,
  hint,
  action,
  className,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("mx-auto max-w-md p-10 text-center", className)}>
      <div className="text-3xl" aria-hidden>🐧❄️</div>
      <p className="mt-3 text-lg font-semibold">{title}</p>
      {hint && <p className="mt-1 text-sm text-ink-muted">{hint}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </Card>
  );
}

/** Small badge noting how many messy records were repaired/de-duplicated. */
export function RepairedBadge({ repaired, duplicates }: { repaired: number; duplicates: number }) {
  if (repaired === 0 && duplicates === 0) return null;
  const parts: string[] = [];
  if (repaired) parts.push(`${repaired} repaired`);
  if (duplicates) parts.push(`${duplicates} duplicate${duplicates > 1 ? "s" : ""} dropped`);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full bg-amber-accent/10 px-2.5 py-0.5 text-xs font-medium text-amber-accent ring-1 ring-inset ring-amber-accent/30"
      title="Some records arrived malformed and were normalized before display."
    >
      <span aria-hidden>⚠</span>
      {parts.join(" · ")}
    </span>
  );
}

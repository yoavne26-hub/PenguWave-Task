import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useEvents } from "@/hooks/useEvents";
import { computeOverview } from "@/services/overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SeverityBadge } from "@/components/SeverityBadge";
import { EmptyState, ErrorState, RepairedBadge, WaveLoader } from "@/components/states";
import { orDash, relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { IconChevronRight } from "@/components/icons";
import type { FilterState } from "@/hooks/useEventFilters";
import type { NormalizedSeverity } from "@/types";

const SEV_BAR: Record<NormalizedSeverity, string> = {
  CRITICAL: "bg-sev-critical",
  HIGH: "bg-sev-high",
  MEDIUM: "bg-sev-medium",
  LOW: "bg-sev-low",
  UNKNOWN: "bg-sev-unknown",
};

function StatCard({
  label,
  value,
  hint,
  onClick,
}: {
  label: string;
  value: number;
  hint?: string;
  onClick?: () => void;
}) {
  const body = (
    <CardContent className="p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
      {onClick && (
        <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-ice-bright">
          View events <IconChevronRight />
        </span>
      )}
    </CardContent>
  );
  if (!onClick) return <Card>{body}</Card>;
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="cursor-pointer transition-all hover:-translate-y-0.5 hover:ring-1 hover:ring-ice-bright/40"
    >
      {body}
    </Card>
  );
}

export default function OverviewPage() {
  const { status, events, repairedCount, duplicateCount, error, reload } = useEvents();
  const metrics = useMemo(() => computeOverview(events), [events]);
  const navigate = useNavigate();

  // Drill down into the Events table, pre-filtered to a slice.
  const drillTo = (filter: Partial<FilterState>) => navigate("/events", { state: { filter } });

  if (status === "loading") {
    return (
      <div className="space-y-6">
        <PageTitle />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <WaveLoader />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="space-y-6">
        <PageTitle />
        <ErrorState message={error ?? "Could not load events."} onRetry={reload} />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="space-y-6">
        <PageTitle />
        <EmptyState title="All clear — no events in scope" hint="There is no telemetry to show right now." />
      </div>
    );
  }

  const maxHost = metrics.topHosts[0]?.count ?? 1;

  return (
    <div className="space-y-6">
      <PageTitle repaired={repairedCount} duplicates={duplicateCount} />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-tour="overview-stats">
        <StatCard label="Total Events" value={metrics.total} onClick={() => drillTo({})} />
        <StatCard
          label="Needs Attention"
          value={metrics.needsAttention}
          hint="Critical + High (only 1 critical exists)"
          onClick={() => drillTo({ severities: ["CRITICAL", "HIGH"] })}
        />
        <StatCard label="Affected Hosts" value={metrics.affectedHosts} />
        <StatCard label="Affected Identities" value={metrics.affectedIdentities} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card data-tour="severity">
          <CardHeader>
            <CardTitle>Severity Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {metrics.bySeverity.map((s) => (
              <button
                key={s.severity}
                onClick={() => drillTo({ severities: [s.severity] })}
                className="flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-white/5"
                title={`View ${s.severity} events`}
              >
                <div className="w-20 shrink-0">
                  <SeverityBadge severity={s.severity} />
                </div>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                  <div
                    className={cn("h-full rounded-full", SEV_BAR[s.severity])}
                    style={{ width: `${Math.max(s.share * 100, 2)}%` }}
                  />
                </div>
                <span className="w-16 shrink-0 text-right text-sm tabular-nums text-ink-muted">
                  {s.count} · {Math.round(s.share * 100)}%
                </span>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Affected Hosts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {metrics.topHosts.map((h) => (
              <button
                key={h.label}
                onClick={() => drillTo({ host: h.label })}
                className="flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-white/5"
                title={`View events on ${h.label}`}
              >
                <span className="flex-1 truncate font-mono text-sm" title={h.label}>
                  {h.label}
                </span>
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-ice"
                    style={{ width: `${(h.count / maxHost) * 100}%` }}
                  />
                </div>
                <span className="w-6 text-right text-sm tabular-nums text-ink-muted">{h.count}</span>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Tags</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {metrics.topTags.map((t) => (
              <button
                key={t.label}
                onClick={() => drillTo({ tag: t.label })}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-xs ring-1 ring-inset ring-hairline transition-colors hover:bg-ice/15 hover:text-ice-bright hover:ring-ice/40"
                title={`View events tagged ${t.label}`}
              >
                {t.label}
                <span className="text-ink-muted tabular-nums">{t.count}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Critical / High</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {metrics.recentCriticalHigh.map((e) => (
              <button
                key={e.id}
                onClick={() => navigate("/events", { state: { focusId: e.id } })}
                className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-white/5"
              >
                <SeverityBadge severity={e.severity} />
                <span className="flex-1 truncate text-sm" title={e.title}>
                  {e.title}
                </span>
                <span className="shrink-0 text-xs text-ink-muted" title={orDash(e.assetHostname)}>
                  {relativeTime(e.parsedDate)}
                </span>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PageTitle({ repaired = 0, duplicates = 0 }: { repaired?: number; duplicates?: number }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-sm text-ink-muted">The state of the seas — severity mix, hottest assets, and urgent activity.</p>
      </div>
      <RepairedBadge repaired={repaired} duplicates={duplicates} />
    </div>
  );
}

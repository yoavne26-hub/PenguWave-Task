import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useEvents } from "@/hooks/useEvents";
import { useEventFilters, type FilterState, type SortKey } from "@/hooks/useEventFilters";
import { useRole } from "@/auth/RoleContext";
import { EventModal } from "@/components/EventModal";
import { SeverityBadge } from "@/components/SeverityBadge";
import { EmptyState, ErrorState, RepairedBadge, WaveLoader } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { exportCsv, exportJson } from "@/services/exportEvents";
import { absoluteTime, orDash, relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { NormalizedSeverity, SecurityEvent } from "@/types";

const SEVERITIES: NormalizedSeverity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "UNKNOWN"];

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "severity", label: "Severity" },
  { key: "title", label: "Title" },
  { key: "host", label: "Asset" },
  { key: "time", label: "Time" },
];

export default function EventsPage() {
  const { status, events, repairedCount, duplicateCount, error, reload } = useEvents();
  const { permissions } = useRole();
  const location = useLocation();

  // Drill-down from the Overview arrives as navigation state. Seed the filter on
  // first mount, and re-apply when a *new* navigation occurs (same route reused).
  const navState = location.state as { focusId?: string; filter?: Partial<FilterState> } | null;
  const navFilter = navState?.filter;
  const filters = useEventFilters(events, navFilter);
  const { applyFilters } = filters;
  const lastNavKey = useRef(location.key);
  useEffect(() => {
    if (location.key !== lastNavKey.current) {
      lastNavKey.current = location.key;
      if (navFilter) applyFilters(navFilter);
    }
  }, [location.key, navFilter, applyFilters]);

  // Deep-link from the Overview "recent" list opens the modal for that event.
  // `manualSelection` is undefined until the user interacts, so the derived
  // selection defaults to the deep-linked event without needing an effect.
  const focusId = navState?.focusId;
  const [manualSelection, setManualSelection] = useState<SecurityEvent | null | undefined>(undefined);
  const autoSelected = focusId ? events.find((e) => e.id === focusId) ?? null : null;
  const selected = manualSelection === undefined ? autoSelected : manualSelection;
  const setSelected = (event: SecurityEvent | null) => setManualSelection(event);

  if (status === "error") {
    return (
      <div className="space-y-6">
        <Header />
        <ErrorState message={error ?? "Could not load events."} onRetry={reload} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Header repaired={repairedCount} duplicates={duplicateCount} />

      {/* Toolbar */}
      <div className="space-y-3" data-tour="filters">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            type="search"
            placeholder="Search events…"
            value={filters.filters.search}
            onChange={(e) => filters.setSearch(e.target.value)}
            className="max-w-xs"
            aria-label="Search events"
          />
          <select
            className="h-9 rounded-md border border-hairline bg-white/5 px-2 text-sm text-ink"
            value={filters.filters.tag ?? ""}
            onChange={(e) => filters.setTag(e.target.value || null)}
            aria-label="Filter by tag"
          >
            <option value="">All tags</option>
            {filters.facets.tags.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            className="h-9 rounded-md border border-hairline bg-white/5 px-2 text-sm text-ink"
            value={filters.filters.host ?? ""}
            onChange={(e) => filters.setHost(e.target.value || null)}
            aria-label="Filter by host"
          >
            <option value="">All hosts</option>
            {filters.facets.hosts.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>

          <div className="ml-auto flex items-center gap-2" data-tour="export">
            {permissions.canExport ? (
              <>
                <Button variant="outline" size="sm" onClick={() => exportCsv(filters.result)}>
                  Export CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportJson(filters.result)}>
                  Export JSON
                </Button>
              </>
            ) : (
              <span className="text-xs text-ink-muted" title="Export is disabled for the Viewer persona.">
                Export disabled (read-only)
              </span>
            )}
          </div>
        </div>

        {/* Severity pills */}
        <div className="flex flex-wrap items-center gap-2">
          {SEVERITIES.map((sev) => {
            const active = filters.filters.severities.includes(sev);
            return (
              <button
                key={sev}
                onClick={() => filters.toggleSeverity(sev)}
                aria-pressed={active}
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition-colors",
                  active
                    ? "bg-ice/15 text-ice-bright ring-ice/40"
                    : "bg-white/5 text-ink-muted ring-hairline hover:text-ink",
                )}
              >
                {sev}
              </button>
            );
          })}
        </div>

        {/* Active filter chips */}
        {filters.hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            {filters.chips.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-0.5 text-xs ring-1 ring-inset ring-hairline"
              >
                {chip.label}
                <button
                  onClick={chip.onRemove}
                  aria-label={`Remove filter ${chip.label}`}
                  className="text-ink-muted hover:text-ink"
                >
                  ✕
                </button>
              </span>
            ))}
            <button
              onClick={filters.clearAll}
              className="text-xs text-ice-bright hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {status === "loading" ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-11" />
          ))}
          <WaveLoader label="Loading events…" />
        </div>
      ) : events.length === 0 ? (
        <EmptyState title="All clear — no events in scope" hint="There is no telemetry to show." />
      ) : filters.result.length === 0 ? (
        <EmptyState
          title="No events match these filters"
          hint="Try removing a filter to widen the search."
          action={<Button variant="outline" size="sm" onClick={filters.clearAll}>Clear filters</Button>}
        />
      ) : (
        <>
          <p className="text-xs text-ink-muted">
            Showing {filters.result.length} of {events.length} events
          </p>
          <div className="overflow-x-auto rounded-xl border border-hairline">
            <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 bg-surface-2/80 backdrop-blur">
                <tr className="text-left text-xs uppercase tracking-wide text-ink-muted">
                  {COLUMNS.map((col) => {
                    const isSorted = filters.sortKey === col.key;
                    return (
                      <th key={col.key} scope="col" className="px-4 py-3 font-medium"
                        aria-sort={isSorted ? (filters.sortDir === "asc" ? "ascending" : "descending") : "none"}>
                        <button
                          onClick={() => filters.toggleSort(col.key)}
                          className="inline-flex items-center gap-1 hover:text-ink"
                        >
                          {col.label}
                          <span aria-hidden className="text-[10px]">
                            {isSorted ? (filters.sortDir === "asc" ? "▲" : "▼") : "↕"}
                          </span>
                        </button>
                      </th>
                    );
                  })}
                  <th scope="col" className="px-4 py-3 font-medium">Source IP</th>
                  <th scope="col" className="px-4 py-3 font-medium">Tags</th>
                </tr>
              </thead>
              <tbody>
                {filters.result.map((event, i) => (
                  <tr
                    key={event.id}
                    onClick={() => setSelected(event)}
                    className={cn(
                      "cursor-pointer border-t border-hairline transition-colors hover:bg-white/[0.04]",
                      i % 2 === 1 && "bg-white/[0.015]",
                    )}
                  >
                    <td className="px-4 py-2.5"><SeverityBadge severity={event.severity} /></td>
                    <td className="max-w-xs truncate px-4 py-2.5" title={event.title}>{event.title}</td>
                    <td className="px-4 py-2.5 font-mono text-xs" title={orDash(event.assetHostname)}>
                      <span className="block max-w-[12rem] truncate">{orDash(event.assetHostname)}</span>
                      <span className="text-ink-muted">{orDash(event.assetIp)}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-ink-muted"
                      title={absoluteTime(event.parsedDate, event.timestamp)}>
                      {event.isValidTime ? relativeTime(event.parsedDate) : "invalid"}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs">{orDash(event.sourceIp)}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex max-w-[14rem] flex-wrap gap-1">
                        {event.tags.slice(0, 3).map((t) => (
                          <span key={t} className="rounded bg-white/5 px-1.5 py-0.5 text-[11px] text-ink-muted">
                            {t}
                          </span>
                        ))}
                        {event.tags.length > 3 && (
                          <span className="text-[11px] text-ink-muted">+{event.tags.length - 3}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <EventModal
        event={selected}
        allEvents={events}
        onClose={() => setSelected(null)}
        onSelect={setSelected}
      />
    </div>
  );
}

function Header({ repaired = 0, duplicates = 0 }: { repaired?: number; duplicates?: number }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold">Security Events</h1>
        <p className="text-sm text-ink-muted">Search, filter, and investigate. Export reflects the current filters.</p>
      </div>
      <RepairedBadge repaired={repaired} duplicates={duplicates} />
    </div>
  );
}

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { SecurityEvent } from "@/types";
import { SeverityBadge } from "@/components/SeverityBadge";
import { relatedEvents } from "@/services/related";
import { absoluteTime, orDash, relativeTime } from "@/lib/format";
import { Button } from "@/components/ui/button";

interface EventDrawerProps {
  event: SecurityEvent | null;
  allEvents: SecurityEvent[];
  onClose: () => void;
  onSelect: (event: SecurityEvent) => void;
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4 py-1.5">
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className={mono ? "text-right font-mono text-sm" : "text-right text-sm"}>{value}</dd>
    </div>
  );
}

export function EventDrawer({ event, allEvents, onClose, onSelect }: EventDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const [showRaw, setShowRaw] = useState(false);

  const related = useMemo(
    () => (event ? relatedEvents(event, allEvents) : []),
    [event, allEvents],
  );

  useEffect(() => {
    if (!event) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'button, a[href], input, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused.current?.focus?.();
    };
  }, [event, onClose]);

  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="frost absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-y-auto rounded-none p-6 shadow-2xl focus-visible:outline-none"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <SeverityBadge severity={event.severity} />
            <h2 id={titleId} className="text-lg font-semibold leading-tight">
              {event.title}
            </h2>
            <p className="text-xs text-ink-muted" title={absoluteTime(event.parsedDate, event.timestamp)}>
              {event.isValidTime ? relativeTime(event.parsedDate) : "invalid timestamp"} ·{" "}
              {absoluteTime(event.parsedDate, event.timestamp)}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close details">
            ✕
          </Button>
        </div>

        <section className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Context</h3>
          <dl className="mt-2 divide-y divide-hairline">
            <Field label="Asset host" value={orDash(event.assetHostname)} mono />
            <Field label="Asset IP" value={orDash(event.assetIp)} mono />
            <Field label="Source IP" value={orDash(event.sourceIp)} mono />
            <Field label="Identity" value={orDash(event.userId)} mono />
            <Field label="Event ID" value={event.id} mono />
          </dl>
          {event.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {event.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-white/5 px-2 py-0.5 text-xs ring-1 ring-inset ring-hairline"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </section>

        <section className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Description</h3>
          {/* Plain text only — untrusted input is never rendered as HTML. */}
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink">
            {event.description || <span className="text-ink-muted">No description provided.</span>}
          </p>
        </section>

        {related.length > 0 && (
          <section className="mt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Related events
            </h3>
            <div className="mt-2 space-y-1">
              {related.map((r) => (
                <button
                  key={r.id}
                  onClick={() => onSelect(r)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-white/5"
                >
                  <SeverityBadge severity={r.severity} />
                  <span className="flex-1 truncate text-sm" title={r.title}>
                    {r.title}
                  </span>
                  <span className="shrink-0 text-xs text-ink-muted">
                    {relativeTime(r.parsedDate)}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="mt-6">
          <button
            onClick={() => setShowRaw((s) => !s)}
            aria-expanded={showRaw}
            className="text-xs font-semibold uppercase tracking-wide text-ink-muted hover:text-ink"
          >
            {showRaw ? "▾" : "▸"} Raw JSON
          </button>
          {showRaw && (
            <pre className="mt-2 overflow-x-auto rounded-md bg-black/30 p-3 text-xs text-ink-muted">
              {JSON.stringify(event, rawReplacer, 2)}
            </pre>
          )}
        </section>
      </div>
    </div>
  );
}

// Hide derived fields from the raw view — show the source-shaped record.
const DERIVED = new Set(["parsedDate", "isValidTime", "severityRank", "searchBlob", "wasRepaired"]);
function rawReplacer(key: string, value: unknown) {
  return DERIVED.has(key) ? undefined : value;
}

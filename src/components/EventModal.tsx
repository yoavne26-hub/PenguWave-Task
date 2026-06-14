import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { SecurityEvent } from "@/types";
import { SeverityBadge } from "@/components/SeverityBadge";
import { relatedEvents } from "@/services/related";
import { absoluteTime, orDash, relativeTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { IconChevronDown, IconChevronRight, IconClose } from "@/components/icons";

interface EventModalProps {
  event: SecurityEvent | null;
  allEvents: SecurityEvent[];
  onClose: () => void;
  onSelect: (event: SecurityEvent) => void;
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg border border-hairline bg-white/[0.03] px-3 py-2">
      <dt className="text-[11px] uppercase tracking-wide text-ink-muted">{label}</dt>
      <dd className={mono ? "mt-0.5 truncate font-mono text-sm" : "mt-0.5 truncate text-sm"} title={value}>
        {value}
      </dd>
    </div>
  );
}

/** Centered, readable event-detail dialog. Replaces the old side drawer. */
export function EventModal({ event, allEvents, onClose, onSelect }: EventModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center sm:p-6">
      <div
        className="overlay-in fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="modal-pop frost relative z-10 flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl shadow-2xl focus-visible:outline-none"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-hairline p-5">
          <div className="min-w-0 space-y-2">
            <SeverityBadge severity={event.severity} />
            <h2 id={titleId} className="text-xl font-semibold leading-tight">
              {event.title}
            </h2>
            <p className="text-xs text-ink-muted">
              {event.isValidTime ? relativeTime(event.parsedDate) : "invalid timestamp"} ·{" "}
              {absoluteTime(event.parsedDate, event.timestamp)}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close details">
            <IconClose style={{ fontSize: "1.05rem" }} />
          </Button>
        </div>

        {/* Scrollable body */}
        <div className="space-y-6 overflow-y-auto p-5">
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Context</h3>
            <dl className="mt-2 grid gap-2 sm:grid-cols-2">
              <Field label="Asset host" value={orDash(event.assetHostname)} mono />
              <Field label="Asset IP" value={orDash(event.assetIp)} mono />
              <Field label="Source IP" value={orDash(event.sourceIp)} mono />
              <Field label="Identity" value={orDash(event.userId)} mono />
              <Field label="Event ID" value={event.id} mono />
              <Field label="Severity" value={event.severity} />
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

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Description</h3>
            {/* Plain text only — untrusted input is never rendered as HTML. */}
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink">
              {event.description || <span className="text-ink-muted">No description provided.</span>}
            </p>
          </section>

          {related.length > 0 && (
            <section>
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
                    <span className="shrink-0 text-xs text-ink-muted">{relativeTime(r.parsedDate)}</span>
                    <IconChevronRight className="shrink-0 text-ink-muted" />
                  </button>
                ))}
              </div>
            </section>
          )}

          <section>
            <button
              onClick={() => setShowRaw((s) => !s)}
              aria-expanded={showRaw}
              className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-ink-muted hover:text-ink"
            >
              {showRaw ? <IconChevronDown /> : <IconChevronRight />} Raw JSON
            </button>
            {showRaw && (
              <pre className="mt-2 overflow-x-auto rounded-md bg-black/30 p-3 text-xs text-ink-muted">
                {JSON.stringify(event, rawReplacer, 2)}
              </pre>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

// Hide derived fields from the raw view — show the source-shaped record.
const DERIVED = new Set(["parsedDate", "isValidTime", "severityRank", "searchBlob", "wasRepaired"]);
function rawReplacer(key: string, value: unknown) {
  return DERIVED.has(key) ? undefined : value;
}

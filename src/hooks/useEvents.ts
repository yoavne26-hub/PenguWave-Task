import { useEffect, useState } from "react";
import type { SecurityEvent } from "@/types";
import { loadEvents } from "@/services/events";

type Status = "loading" | "ready" | "error";

export interface EventsState {
  status: Status;
  events: SecurityEvent[];
  repairedCount: number;
  duplicateCount: number;
  error: string | null;
  reload: () => void;
}

/**
 * Loads and normalizes events through the service seam. Surfaces loading /
 * error states and how many records were repaired or de-duplicated.
 */
export function useEvents(): EventsState {
  const [status, setStatus] = useState<Status>("loading");
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [repairedCount, setRepairedCount] = useState(0);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let active = true;

    // setState only happens asynchronously (in the promise callbacks), so the
    // effect body itself stays free of synchronous state updates.
    loadEvents()
      .then((result) => {
        if (!active) return;
        setEvents(result.events);
        setRepairedCount(result.repairedCount);
        setDuplicateCount(result.duplicateCount);
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load events");
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [nonce]);

  const reload = () => {
    setStatus("loading");
    setError(null);
    setNonce((n) => n + 1);
  };

  return { status, events, repairedCount, duplicateCount, error, reload };
}

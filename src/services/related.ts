import type { SecurityEvent } from "@/types";

/**
 * Find events related to the given one — sharing a host, identity, or tag —
 * sorted by time proximity. Caps the result so the drawer stays compact.
 */
export function relatedEvents(
  target: SecurityEvent,
  all: SecurityEvent[],
  limit = 6,
): SecurityEvent[] {
  const targetTags = new Set(target.tags);
  const targetTime = target.parsedDate?.getTime() ?? null;

  return all
    .filter((e) => e.id !== target.id)
    .filter(
      (e) =>
        (target.assetHostname && e.assetHostname === target.assetHostname) ||
        (target.userId && e.userId === target.userId) ||
        e.tags.some((t) => targetTags.has(t)),
    )
    .sort((a, b) => {
      if (targetTime == null) return 0;
      const da = Math.abs((a.parsedDate?.getTime() ?? targetTime) - targetTime);
      const db = Math.abs((b.parsedDate?.getTime() ?? targetTime) - targetTime);
      return da - db;
    })
    .slice(0, limit);
}

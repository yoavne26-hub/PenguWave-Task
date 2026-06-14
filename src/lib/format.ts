/** Display helpers. All tolerant of null/invalid input — never throw. */

export const EM_DASH = "—";

/** Human-readable relative time, e.g. "3h ago". Falls back for invalid dates. */
export function relativeTime(date: Date | null): string {
  if (!date || Number.isNaN(date.getTime())) return "invalid time";
  const diffMs = Date.now() - date.getTime();
  const sec = Math.round(diffMs / 1000);
  const abs = Math.abs(sec);
  const units: [number, string][] = [
    [60, "s"],
    [3600, "m"],
    [86400, "h"],
    [2592000, "d"],
    [31536000, "mo"],
    [Infinity, "y"],
  ];
  const divisors = [1, 60, 3600, 86400, 2592000, 31536000];
  for (let i = 0; i < units.length; i++) {
    if (abs < units[i][0]) {
      const value = Math.round(sec / divisors[i]);
      return value <= 0 ? "just now" : `${value}${units[i][1]} ago`;
    }
  }
  return "just now";
}

/** Full absolute timestamp for tooltips/title attributes. */
export function absoluteTime(date: Date | null, raw: string): string {
  if (!date || Number.isNaN(date.getTime())) return raw || "unknown";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

/** Render a possibly-null value, using an em dash for missing data. */
export function orDash(value: string | null | undefined): string {
  return value && value.trim() ? value : EM_DASH;
}

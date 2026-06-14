import type {
  NormalizedSeverity,
  RawSecurityEvent,
  SecurityEvent,
} from "@/types";

/** Explicit severity ordering — sorting uses this rank, never color. */
export const SEVERITY_RANK: Record<NormalizedSeverity, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
  UNKNOWN: 0,
};

const KNOWN_SEVERITIES = new Set(["CRITICAL", "HIGH", "MEDIUM", "LOW"]);

/** Values that, while present in the data, mean "no real value". */
const NULLISH_TOKENS = new Set(["", "unknown", "n/a", "na", "null", "none", "-"]);

function coerceString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Treat empty / "unknown" / "n/a" sentinels as a genuine null. */
function nullableField(value: unknown): string | null {
  const s = coerceString(value);
  return s && !NULLISH_TOKENS.has(s.toLowerCase()) ? s : null;
}

function normalizeSeverity(value: unknown): NormalizedSeverity {
  const s = coerceString(value).toUpperCase();
  return KNOWN_SEVERITIES.has(s) ? (s as NormalizedSeverity) : "UNKNOWN";
}

function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const cleaned = value
    .filter((t): t is string => typeof t === "string")
    .map((t) => t.trim())
    .filter(Boolean);
  return Array.from(new Set(cleaned)); // dedupe
}

/**
 * Turn one untrusted raw record into a trusted, typed event. Never throws:
 * a malformed field is repaired or nulled, and `wasRepaired` flags records
 * that needed fixing so the UI can surface "N records repaired".
 */
export function normalizeEvent(raw: RawSecurityEvent, index: number): SecurityEvent {
  let wasRepaired = false;

  const id = coerceString(raw.id) || `evt-unknown-${index}`;
  if (!coerceString(raw.id)) wasRepaired = true;

  const severity = normalizeSeverity(raw.severity);
  if (coerceString(raw.severity).toUpperCase() !== severity) wasRepaired = true;

  const title = coerceString(raw.title) || "(untitled event)";
  const description = coerceString(raw.description);

  const assetHostname = nullableField(raw.assetHostname) ?? "";
  const assetIp = nullableField(raw.assetIp) ?? "";
  const sourceIp = nullableField(raw.sourceIp);
  const userId = nullableField(raw.userId);

  const tags = normalizeTags(raw.tags);
  if (Array.isArray(raw.tags) && raw.tags.length !== tags.length) wasRepaired = true;

  const timestamp = coerceString(raw.timestamp);
  const parsed = timestamp ? new Date(timestamp) : null;
  const isValidTime = parsed != null && !Number.isNaN(parsed.getTime());
  if (!isValidTime) wasRepaired = true;

  const searchBlob = [
    id,
    title,
    description,
    assetHostname,
    assetIp,
    sourceIp,
    userId,
    severity,
    ...tags,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return {
    id,
    timestamp,
    severity,
    title,
    description,
    assetHostname,
    assetIp,
    sourceIp,
    tags,
    userId,
    parsedDate: isValidTime ? parsed : null,
    isValidTime,
    severityRank: SEVERITY_RANK[severity],
    searchBlob,
    wasRepaired,
  };
}

export interface NormalizeResult {
  events: SecurityEvent[];
  repairedCount: number;
  duplicateCount: number;
}

/** Normalize a raw list, de-duplicating by id (first occurrence wins). */
export function normalizeEvents(raw: unknown): NormalizeResult {
  const list = Array.isArray(raw) ? (raw as RawSecurityEvent[]) : [];
  const seen = new Set<string>();
  const events: SecurityEvent[] = [];
  let repairedCount = 0;
  let duplicateCount = 0;

  list.forEach((item, index) => {
    const event = normalizeEvent(item ?? {}, index);
    if (seen.has(event.id)) {
      duplicateCount += 1;
      return;
    }
    seen.add(event.id);
    if (event.wasRepaired) repairedCount += 1;
    events.push(event);
  });

  return { events, repairedCount, duplicateCount };
}

import type { NormalizedSeverity, SecurityEvent } from "@/types";
import { SEVERITY_RANK } from "./normalize";

const SEVERITY_ORDER: NormalizedSeverity[] = [
  "CRITICAL",
  "HIGH",
  "MEDIUM",
  "LOW",
  "UNKNOWN",
];

export interface SeverityCount {
  severity: NormalizedSeverity;
  count: number;
  share: number; // 0..1
}

export interface RankedItem {
  label: string;
  count: number;
}

export interface OverviewMetrics {
  total: number;
  needsAttention: number; // CRITICAL + HIGH
  affectedHosts: number;
  affectedIdentities: number;
  bySeverity: SeverityCount[];
  topHosts: RankedItem[];
  topTags: RankedItem[];
  recentCriticalHigh: SecurityEvent[];
}

function rank(map: Map<string, number>, limit: number): RankedItem[] {
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, limit);
}

/** Compute all overview metrics in one pass-friendly derivation. */
export function computeOverview(events: SecurityEvent[]): OverviewMetrics {
  const total = events.length;
  const severityCounts = new Map<NormalizedSeverity, number>();
  const hostCounts = new Map<string, number>();
  const tagCounts = new Map<string, number>();
  const hosts = new Set<string>();
  const identities = new Set<string>();

  for (const e of events) {
    severityCounts.set(e.severity, (severityCounts.get(e.severity) ?? 0) + 1);
    if (e.assetHostname) {
      hosts.add(e.assetHostname);
      hostCounts.set(e.assetHostname, (hostCounts.get(e.assetHostname) ?? 0) + 1);
    }
    if (e.userId) identities.add(e.userId);
    for (const tag of e.tags) tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
  }

  const bySeverity: SeverityCount[] = SEVERITY_ORDER.map((severity) => {
    const count = severityCounts.get(severity) ?? 0;
    return { severity, count, share: total ? count / total : 0 };
  }).filter((s) => s.count > 0 || s.severity !== "UNKNOWN");

  const needsAttention =
    (severityCounts.get("CRITICAL") ?? 0) + (severityCounts.get("HIGH") ?? 0);

  const recentCriticalHigh = events
    .filter((e) => e.severity === "CRITICAL" || e.severity === "HIGH")
    .sort((a, b) => {
      const at = a.parsedDate?.getTime() ?? 0;
      const bt = b.parsedDate?.getTime() ?? 0;
      return bt - at || b.severityRank - a.severityRank;
    })
    .slice(0, 5);

  return {
    total,
    needsAttention,
    affectedHosts: hosts.size,
    affectedIdentities: identities.size,
    bySeverity,
    topHosts: rank(hostCounts, 5),
    topTags: rank(tagCounts, 8),
    recentCriticalHigh,
  };
}

export { SEVERITY_RANK };

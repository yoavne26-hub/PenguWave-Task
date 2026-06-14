import { useMemo, useState } from "react";
import type { NormalizedSeverity, SecurityEvent } from "@/types";

export type SortKey = "time" | "severity" | "title" | "host";
export type SortDir = "asc" | "desc";

export interface FilterState {
  search: string;
  severities: NormalizedSeverity[];
  tag: string | null;
  host: string | null;
}

export interface FilterChip {
  key: string;
  label: string;
  onRemove: () => void;
}

const EMPTY: FilterState = { search: "", severities: [], tag: null, host: null };

export function useEventFilters(events: SecurityEvent[]) {
  const [filters, setFilters] = useState<FilterState>(EMPTY);
  const [sortKey, setSortKey] = useState<SortKey>("time");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Distinct facet options derived from the data.
  const facets = useMemo(() => {
    const tags = new Set<string>();
    const hosts = new Set<string>();
    for (const e of events) {
      e.tags.forEach((t) => tags.add(t));
      if (e.assetHostname) hosts.add(e.assetHostname);
    }
    return {
      tags: [...tags].sort(),
      hosts: [...hosts].sort(),
    };
  }, [events]);

  const result = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    const sevSet = new Set(filters.severities);

    const filtered = events.filter((e) => {
      if (q && !e.searchBlob.includes(q)) return false;
      if (sevSet.size && !sevSet.has(e.severity)) return false;
      if (filters.tag && !e.tags.includes(filters.tag)) return false;
      if (filters.host && e.assetHostname !== filters.host) return false;
      return true;
    });

    const dir = sortDir === "asc" ? 1 : -1;
    // Copy before sorting — never mutate the source array.
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "severity":
          cmp = a.severityRank - b.severityRank;
          break;
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "host":
          cmp = a.assetHostname.localeCompare(b.assetHostname);
          break;
        case "time":
        default:
          cmp = (a.parsedDate?.getTime() ?? 0) - (b.parsedDate?.getTime() ?? 0);
          break;
      }
      return cmp * dir;
    });
  }, [events, filters, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "title" || key === "host" ? "asc" : "desc");
    }
  }

  const chips: FilterChip[] = [];
  if (filters.search.trim()) {
    chips.push({
      key: "search",
      label: `“${filters.search.trim()}”`,
      onRemove: () => setFilters((f) => ({ ...f, search: "" })),
    });
  }
  filters.severities.forEach((sev) => {
    chips.push({
      key: `sev-${sev}`,
      label: sev,
      onRemove: () =>
        setFilters((f) => ({ ...f, severities: f.severities.filter((s) => s !== sev) })),
    });
  });
  if (filters.tag) {
    chips.push({
      key: "tag",
      label: `tag: ${filters.tag}`,
      onRemove: () => setFilters((f) => ({ ...f, tag: null })),
    });
  }
  if (filters.host) {
    chips.push({
      key: "host",
      label: `host: ${filters.host}`,
      onRemove: () => setFilters((f) => ({ ...f, host: null })),
    });
  }

  return {
    filters,
    facets,
    result,
    sortKey,
    sortDir,
    chips,
    hasActiveFilters: chips.length > 0,
    setSearch: (search: string) => setFilters((f) => ({ ...f, search })),
    toggleSeverity: (sev: NormalizedSeverity) =>
      setFilters((f) => ({
        ...f,
        severities: f.severities.includes(sev)
          ? f.severities.filter((s) => s !== sev)
          : [...f.severities, sev],
      })),
    setTag: (tag: string | null) => setFilters((f) => ({ ...f, tag })),
    setHost: (host: string | null) => setFilters((f) => ({ ...f, host })),
    toggleSort,
    clearAll: () => setFilters(EMPTY),
  };
}

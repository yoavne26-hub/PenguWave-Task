import type { SecurityEvent } from "@/types";
import { downloadBlob, toCsv } from "@/utils";

/** Flatten a normalized event to the source-shaped record we export. */
function toExportRow(e: SecurityEvent): Record<string, unknown> {
  return {
    id: e.id,
    timestamp: e.timestamp,
    severity: e.severity,
    title: e.title,
    description: e.description,
    assetHostname: e.assetHostname,
    assetIp: e.assetIp,
    sourceIp: e.sourceIp ?? "",
    userId: e.userId ?? "",
    tags: e.tags, // joined with ";" by toCsv
  };
}

function stamp(): string {
  // ISO without separators that are illegal in filenames.
  return new Date().toISOString().replace(/[:.]/g, "-");
}

export function exportCsv(events: SecurityEvent[]): void {
  const csv = toCsv(events.map(toExportRow));
  downloadBlob(csv, `penguwave_events_${stamp()}.csv`, "text/csv;charset=utf-8");
}

export function exportJson(events: SecurityEvent[]): void {
  const json = JSON.stringify(events.map(toExportRow), null, 2);
  downloadBlob(json, `penguwave_events_${stamp()}.json`, "application/json");
}

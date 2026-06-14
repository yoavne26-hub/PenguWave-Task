// Shared helpers for PenguWave.

/**
 * Neutralize CSV/spreadsheet formula injection. A cell that starts with one of
 * = + - @ (or tab/CR) can be interpreted as a formula by Excel/Sheets and run
 * on open. Prefixing with a single quote forces the value to be treated as
 * text. See OWASP "CSV Injection".
 */
function neutralizeFormula(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

/** Quote a CSV field: neutralize formulas, escape embedded quotes, wrap. */
function csvField(value: unknown): string {
  const raw = value == null ? "" : String(value);
  const safe = neutralizeFormula(raw);
  return `"${safe.replace(/"/g, '""')}"`;
}

/**
 * Serialize records to CSV for export. Every field is quoted, internal quotes
 * are doubled, and formula-injection vectors are neutralized. Array values
 * (e.g. tags) are joined with ";".
 */
export function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const encode = (v: unknown) => csvField(Array.isArray(v) ? v.join(";") : v);
  const lines = rows.map((r) => headers.map((h) => encode(r[h])).join(","));
  return [headers.map(csvField).join(","), ...lines].join("\r\n");
}

/**
 * Trigger a client-side file download. Revokes the object URL on the next tick
 * to avoid the race where some browsers cancel the download if revoked too soon.
 */
export function downloadBlob(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

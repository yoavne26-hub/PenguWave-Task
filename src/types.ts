/** Severities the backend can emit. Anything else is normalized to "UNKNOWN". */
export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type NormalizedSeverity = Severity | "UNKNOWN";

/**
 * Raw event shape as it arrives from the API / mock JSON. Treated as
 * untrusted input: any field may be missing, null, or malformed, so the
 * normalizer (src/services/normalize.ts) is responsible for repairing it.
 */
export interface RawSecurityEvent {
  id?: string;
  timestamp?: string;
  severity?: string;
  title?: string;
  description?: string;
  assetHostname?: string;
  assetIp?: string;
  sourceIp?: string | null;
  tags?: unknown;
  userId?: string | null;
}

/**
 * A trusted, typed event after normalization. The UI only ever renders this
 * shape, never the raw input.
 */
export interface SecurityEvent {
  id: string;
  timestamp: string;
  severity: NormalizedSeverity;
  title: string;
  description: string;
  assetHostname: string;
  assetIp: string;
  sourceIp: string | null;
  tags: string[];
  userId: string | null;

  // Derived fields (computed once during normalization).
  parsedDate: Date | null;
  isValidTime: boolean;
  severityRank: number;
  searchBlob: string;
  wasRepaired: boolean;
}

/**
 * User record. Note: NO password field — the client must never receive,
 * store, or render credentials. Real auth/authorization belongs on a backend.
 */
export interface User {
  id: string;
  email: string;
  role: string;
  status: string;
}

/**
 * Role model for the demo. IMPORTANT: this is a UX simulation only — it shapes
 * which affordances appear, NOT what the user is actually allowed to do. Real
 * authorization must be enforced by a backend; never trust the client.
 */
export type Role = "analyst" | "admin" | "viewer";

export interface RolePermissions {
  /** May trigger CSV/JSON export of the (filtered) event set. */
  canExport: boolean;
  /** May see/use the Users administration page. */
  canManageUsers: boolean;
  /** Read-only persona — mutating affordances are hidden/disabled. */
  readOnly: boolean;
}

export const ROLE_PERMISSIONS: Record<Role, RolePermissions> = {
  admin: { canExport: true, canManageUsers: true, readOnly: false },
  analyst: { canExport: true, canManageUsers: false, readOnly: false },
  viewer: { canExport: false, canManageUsers: false, readOnly: true },
};

export const ROLE_LABELS: Record<Role, { title: string; blurb: string }> = {
  analyst: {
    title: "Analyst",
    blurb: "Investigate and triage events, filter and export. No user admin.",
  },
  admin: {
    title: "Admin",
    blurb: "Everything an analyst can do, plus the Users administration page.",
  },
  viewer: {
    title: "Viewer",
    blurb: "Read-only — browse the overview, events, and details. No export or mutations.",
  },
};

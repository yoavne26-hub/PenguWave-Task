/**
 * MOCK credential gate for the demo personas.
 *
 * IMPORTANT — this is a UX simulation, NOT real authentication:
 *  - These are throwaway demo credentials, not secrets. Real auth must happen
 *    on a backend; never trust the client.
 *  - The entered password is compared in memory only. We NEVER log it and
 *    NEVER persist it (only the chosen role string is stored, as before).
 *  - Credentials are intentionally NOT shown in the UI. They live here and are
 *    documented in the README so a reviewer can sign in.
 */
import type { Role } from "./roles";

interface DemoCredential {
  username: string;
  password: string;
}

export const DEMO_CREDENTIALS: Record<Role, DemoCredential> = {
  analyst: { username: "analyst", password: "frostbite" },
  admin: { username: "admin", password: "icebreaker" },
  viewer: { username: "viewer", password: "driftwood" },
};

/**
 * Constant-shape, case-insensitive username match + exact password match.
 * Returns a boolean only — the caller never receives or stores the secret.
 */
export function verifyCredentials(
  role: Role,
  username: string,
  password: string,
): boolean {
  const expected = DEMO_CREDENTIALS[role];
  if (!expected) return false;
  return (
    username.trim().toLowerCase() === expected.username &&
    password === expected.password
  );
}

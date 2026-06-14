/**
 * MOCK credential gate for the demo personas.
 *
 * IMPORTANT — this is a UX *visualization* of a sign-in step, NOT real auth:
 *  - ANY username + password is accepted. The form exists only to simulate the
 *    "authentication level" of each persona; it enforces nothing. Real auth must
 *    happen on a backend — never trust the client.
 *  - The entered password is read in memory only. We NEVER log it and NEVER
 *    persist it (only the chosen role string is stored, as before).
 */
import type { Role } from "./roles";

/**
 * Accepts any non-empty username + password. Returns a boolean only — the
 * caller never receives or stores the secret. The `role` is accepted for a
 * stable signature (and so a real backend check could slot in here later).
 */
export function verifyCredentials(
  _role: Role,
  username: string,
  password: string,
): boolean {
  // Purely a "did they fill the form" check — values are not validated.
  return username.trim().length > 0 && password.length > 0;
}

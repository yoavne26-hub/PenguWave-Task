// Thin API seam. Currently unused by the UI (the app runs on mock data via
// src/services/events.ts), but kept so a real backend can be wired in later.
//
// Security notes:
// - No secrets are hardcoded. The API key, if any, comes from import.meta.env
//   (see .env.example) and is only present when a real backend is configured.
// - Credentials are NEVER logged.

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";
const API_KEY = import.meta.env.VITE_API_KEY;

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extra };
  const token = localStorage.getItem("token");
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (API_KEY) headers["X-Api-Key"] = API_KEY;
  return headers;
}

export async function login(email: string, password: string) {
  // Do not log credentials.
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (data?.token) localStorage.setItem("token", data.token);
  return data;
}

export async function getEvents() {
  const res = await fetch(`${API_URL}/api/events`, { headers: authHeaders() });
  return res.json();
}

export async function getUsers() {
  const res = await fetch(`${API_URL}/api/users`, { headers: authHeaders() });
  return res.json();
}

export async function createUser(user: { email: string; role: string }) {
  const res = await fetch(`${API_URL}/api/users`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(user),
  });
  return res.json();
}

export async function deleteUser(id: string) {
  const res = await fetch(`${API_URL}/api/users/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
}

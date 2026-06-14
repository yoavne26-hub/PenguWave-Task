import { useState } from "react";
import type { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const INITIAL_USERS: User[] = [
  { id: "1", email: "admin@penguwave.io", role: "admin", status: "active" },
  { id: "2", email: "analyst@penguwave.io", role: "analyst", status: "active" },
  { id: "3", email: "viewer@penguwave.io", role: "viewer", status: "disabled" },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [showForm, setShowForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("analyst");

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    // Note: no password is ever collected or stored on the client.
    setUsers((prev) => [
      ...prev,
      { id: String(prev.length + 1), email: newEmail, role: newRole, status: "active" },
    ]);
    setNewEmail("");
    setNewRole("analyst");
    setShowForm(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-ink-muted">Admin-only persona view. No credentials are shown or stored.</p>
        </div>
        <Button variant={showForm ? "outline" : "default"} onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "Add User"}
        </Button>
      </div>

      <p className="rounded-md bg-amber-accent/10 px-3 py-2 text-xs text-amber-accent ring-1 ring-inset ring-amber-accent/30">
        This page is gated by a <strong>UX-only role simulation</strong>. Real authentication and
        authorization must be enforced by a backend — the client must never be trusted.
      </p>

      {showForm && (
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold">New user</h3>
          <form onSubmit={handleAddUser} className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="new-email" className="text-xs text-ink-muted">Email</label>
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="user@penguwave.io"
                required
                className="w-64"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="new-role" className="text-xs text-ink-muted">Role</label>
              <select
                id="new-role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="h-9 rounded-md border border-hairline bg-white/5 px-2 text-sm text-ink"
              >
                <option value="admin">Admin</option>
                <option value="analyst">Analyst</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <Button type="submit">Create user</Button>
          </form>
        </Card>
      )}

      <div className="overflow-x-auto rounded-xl border border-hairline">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-ink-muted">
              <th scope="col" className="px-4 py-3 font-medium">Email</th>
              <th scope="col" className="px-4 py-3 font-medium">Role</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
              <th scope="col" className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-hairline">
                <td className="px-4 py-2.5 font-mono text-xs">{user.email}</td>
                <td className="px-4 py-2.5 capitalize">{user.role}</td>
                <td className="px-4 py-2.5">
                  <span className={cn("text-xs", user.status === "active" ? "text-sev-low" : "text-ink-muted")}>
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <button
                    onClick={() => setUsers((prev) => prev.filter((u) => u.id !== user.id))}
                    className="text-xs text-sev-high hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && <p className="text-sm text-ink-muted">No users.</p>}
    </div>
  );
}

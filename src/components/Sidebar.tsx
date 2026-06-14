import { NavLink } from "react-router-dom";
import { useRole } from "@/auth/RoleContext";
import { ROLE_LABELS } from "@/auth/roles";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/overview", label: "Overview", icon: "◎" },
  { to: "/events", label: "Events", icon: "≋" },
  { to: "/users", label: "Users", icon: "⚇", adminOnly: true },
];

export function Sidebar() {
  const { role, permissions, signOut } = useRole();

  return (
    <aside className="frost flex w-60 shrink-0 flex-col gap-6 rounded-none border-y-0 border-l-0 p-4">
      <div className="flex items-center gap-2 px-2 pt-2">
        <span className="text-xl" aria-hidden>🐧</span>
        <span className="text-lg font-bold tracking-tight">
          Pengu<span className="text-ice-bright">Wave</span>
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1" aria-label="Primary">
        {NAV.filter((item) => !item.adminOnly || permissions.canManageUsers).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-ice/15 text-ice-bright"
                  : "text-ink-muted hover:bg-white/5 hover:text-ink",
              )
            }
          >
            <span className="w-4 text-center" aria-hidden>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {role && (
        <div className="space-y-3 border-t border-hairline pt-4">
          <div className="px-2">
            <p className="text-xs uppercase tracking-wide text-ink-muted">Signed in as</p>
            <p className="text-sm font-semibold">{ROLE_LABELS[role].title}</p>
            {permissions.readOnly && (
              <p className="mt-0.5 text-xs text-amber-accent">Read-only persona</p>
            )}
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={signOut}>
            Switch persona
          </Button>
          <p className="px-2 text-[11px] leading-snug text-ink-muted/80">
            Role gating here is a <strong>UX simulation</strong>, not real
            authorization. Enforcement belongs on a backend.
          </p>
        </div>
      )}
    </aside>
  );
}

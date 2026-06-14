import { NavLink } from "react-router-dom";
import { useRole } from "@/auth/RoleContext";
import { ROLE_LABELS } from "@/auth/roles";
import { cn } from "@/lib/utils";
import {
  IconEvents,
  IconOverview,
  IconUsers,
  PenguinMark,
  type IconComponent,
} from "@/components/icons";

interface NavItem {
  to: string;
  label: string;
  icon: IconComponent;
  adminOnly?: boolean;
}

const NAV: NavItem[] = [
  { to: "/overview", label: "Overview", icon: IconOverview },
  { to: "/events", label: "Events", icon: IconEvents },
  { to: "/users", label: "Users", icon: IconUsers, adminOnly: true },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { role, permissions } = useRole();

  return (
    <aside className="frost flex h-full w-60 shrink-0 flex-col gap-7 rounded-none border-y-0 border-l-0 p-4">
      <div className="flex items-center gap-2.5 px-1 pt-2">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-ice/15 ring-1 ring-ice-bright/25">
          <PenguinMark className="text-ice-bright" style={{ fontSize: "1.4rem" }} />
        </span>
        <span className="text-lg font-bold tracking-tight">
          Pengu<span className="text-ice-bright">Wave</span>
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1" aria-label="Primary" data-tour="nav">
        <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted/70">
          Navigation
        </p>
        {NAV.filter((item) => !item.adminOnly || permissions.canManageUsers).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "relative flex items-center gap-3 rounded-md py-2.5 pl-3 pr-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-ice/15 text-ice-bright"
                    : "text-ink-muted hover:bg-white/5 hover:text-ink",
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span aria-hidden className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r bg-ice-bright" />
                  )}
                  <Icon style={{ fontSize: "1.15rem" }} />
                  {item.label}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {role && (
        <div className="border-t border-hairline pt-4">
          <div className="px-1">
            <p className="text-[11px] uppercase tracking-wide text-ink-muted">Signed in as</p>
            <p className="text-sm font-semibold">{ROLE_LABELS[role].title}</p>
            {permissions.readOnly && (
              <p className="mt-0.5 text-xs text-amber-accent">Read-only persona</p>
            )}
            <p className="mt-2 text-[11px] leading-snug text-ink-muted/80">
              Switch persona from the menu in the top bar. Roles are a{" "}
              <strong>UX simulation</strong>, not real authorization.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}

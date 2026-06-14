import { useEffect, useRef, useState } from "react";
import { useRole } from "@/auth/RoleContext";
import { ROLE_LABELS, type Role } from "@/auth/roles";
import { cn } from "@/lib/utils";
import { IconChevronDown, IconSignOut, IconUser } from "@/components/icons";

const ORDER: Role[] = ["analyst", "admin", "viewer"];

/**
 * Header dropdown for switching persona / signing out — always visible, so the
 * user never has to scroll the sidebar to change access level. Persona is a UX
 * simulation, not real authorization.
 */
export function PersonaMenu() {
  const { role, enter, signOut } = useRole();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!role) return null;

  return (
    <div className="relative" ref={ref} data-tour="persona">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-md border border-hairline bg-white/5 px-2.5 py-1.5 text-sm transition-colors hover:bg-white/10"
      >
        <IconUser className="text-ice-bright" />
        <span className="font-medium">{ROLE_LABELS[role].title}</span>
        <IconChevronDown className="text-ink-muted" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-hairline bg-surface shadow-2xl shadow-black/40"
        >
          <p className="px-3 pb-1 pt-3 text-[11px] uppercase tracking-wide text-ink-muted">
            Switch persona
          </p>
          {ORDER.map((r) => (
            <button
              key={r}
              role="menuitemradio"
              aria-checked={r === role}
              onClick={() => {
                enter(r);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-white/5",
                r === role ? "text-ice-bright" : "text-ink",
              )}
            >
              <span>{ROLE_LABELS[r].title}</span>
              {r === role && <span className="text-[11px] text-ink-muted">current</span>}
            </button>
          ))}
          <div className="my-1 border-t border-hairline" />
          <button
            role="menuitem"
            onClick={() => {
              signOut();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink-muted transition-colors hover:bg-white/5 hover:text-ink"
          >
            <IconSignOut /> Sign out
          </button>
          <p className="px-3 pb-2.5 pt-1 text-[10px] leading-snug text-ink-muted/70">
            UX simulation — not real authorization.
          </p>
        </div>
      )}
    </div>
  );
}

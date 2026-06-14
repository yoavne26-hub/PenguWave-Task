import { useRole } from "@/auth/RoleContext";
import { ROLE_LABELS, type Role } from "@/auth/roles";
import { Card } from "@/components/ui/card";

const ORDER: Role[] = ["analyst", "admin", "viewer"];

/** Persona picker shown when no role is selected. Demo UX, not auth. */
export function RoleEntrance() {
  const { enter } = useRole();

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-3xl space-y-8">
        <header className="space-y-3 text-center">
          <div className="flex items-center justify-center gap-2 text-2xl font-bold tracking-tight">
            <span aria-hidden>🐧</span>
            Pengu<span className="text-ice-bright">Wave</span>
          </div>
          <p className="text-ink-muted">
            Security Operations Portal — choose a demo persona to enter the console.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          {ORDER.map((role) => (
            <button
              key={role}
              onClick={() => enter(role)}
              className="group text-left focus-visible:outline-none"
            >
              <Card className="h-full p-5 transition-all hover:-translate-y-0.5 hover:ring-1 hover:ring-ice-bright/50 group-focus-visible:ring-2 group-focus-visible:ring-ice-bright">
                <h2 className="text-lg font-semibold text-ink">{ROLE_LABELS[role].title}</h2>
                <p className="mt-2 text-sm text-ink-muted">{ROLE_LABELS[role].blurb}</p>
                <span className="mt-4 inline-block text-sm font-medium text-ice-bright">
                  Enter as {ROLE_LABELS[role].title} →
                </span>
              </Card>
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-ink-muted/80">
          These personas only reshape the UI. They are <strong>not</strong> real
          authentication or authorization — that must be enforced by a backend.
        </p>
      </div>
    </div>
  );
}

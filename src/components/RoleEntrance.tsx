import { useRef, useState } from "react";
import { useRole } from "@/auth/RoleContext";
import { ROLE_LABELS, type Role } from "@/auth/roles";
import { verifyCredentials } from "@/auth/credentials";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EntranceBackground } from "@/components/EntranceBackground";
import {
  IconArrowLeft,
  IconChevronRight,
  IconEvents,
  IconLock,
  IconOverview,
  IconUser,
  IconUsers,
  PenguinMark,
  type IconComponent,
} from "@/components/icons";

const ORDER: Role[] = ["analyst", "admin", "viewer"];

const ROLE_ICON: Record<Role, IconComponent> = {
  analyst: IconEvents,
  admin: IconUsers,
  viewer: IconOverview,
};

/** Persona picker + mock credential gate shown when no role is selected. */
export function RoleEntrance() {
  const { enter } = useRole();
  const [selected, setSelected] = useState<Role | null>(null);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <EntranceBackground />
      <div className="relative z-10 w-full max-w-3xl space-y-8">
        <header className="space-y-3 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ice-cyan/80">
            Security Operations Portal
          </p>
          <div className="flex items-center justify-center gap-2.5 text-3xl font-bold tracking-tight">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-ice/15 ring-1 ring-ice-bright/30">
              <PenguinMark className="text-ice-bright" style={{ fontSize: "1.9rem" }} />
            </span>
            Pengu<span className="text-ice-bright">Wave</span>
          </div>
          <p className="text-ink-muted">
            {selected
              ? `Sign in to the console as ${ROLE_LABELS[selected].title}.`
              : "Choose a demo persona to enter the console."}
          </p>
        </header>

        {selected ? (
          <CredentialGate
            role={selected}
            onCancel={() => setSelected(null)}
            onSuccess={() => enter(selected)}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {ORDER.map((role) => {
              const Icon = ROLE_ICON[role];
              return (
                <button
                  key={role}
                  onClick={() => setSelected(role)}
                  className="group text-left focus-visible:outline-none"
                >
                  <Card className="relative h-full cursor-pointer overflow-hidden p-5 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-ice/10 hover:ring-1 hover:ring-ice-bright/50 group-focus-visible:ring-2 group-focus-visible:ring-ice-bright">
                    <span
                      aria-hidden
                      className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-ice via-ice-bright to-ice-cyan opacity-70"
                    />
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-ice/15 text-ice-bright ring-1 ring-ice-bright/20">
                      <Icon style={{ fontSize: "1.1rem" }} />
                    </span>
                    <h2 className="mt-3 text-lg font-semibold text-ink">{ROLE_LABELS[role].title}</h2>
                    <p className="mt-1.5 text-sm text-ink-muted">{ROLE_LABELS[role].blurb}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-ice-bright">
                      Sign in
                      <IconChevronRight className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Card>
                </button>
              );
            })}
          </div>
        )}

        <p className="text-center text-xs text-ink-muted/80">
          These personas only reshape the UI. They are <strong>not</strong> real
          authentication or authorization — that must be enforced by a backend.
        </p>
      </div>
    </div>
  );
}

function CredentialGate({
  role,
  onCancel,
  onSuccess,
}: {
  role: Role;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Verify in memory only. The password is never logged or persisted.
    if (verifyCredentials(role, username, password)) {
      setError(null);
      onSuccess();
      return;
    }
    // The only failure is an empty field — this gate accepts any credentials.
    setError("Enter any username and password to continue.");
    passwordRef.current?.focus();
  }

  return (
    <Card className="mx-auto max-w-sm p-6">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <label htmlFor="cg-username" className="text-sm font-medium text-ink">
            Username
          </label>
          <div className="relative">
            <IconUser className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <Input
              id="cg-username"
              autoFocus
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-9"
              placeholder="persona username"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="cg-password" className="text-sm font-medium text-ink">
            Password
          </label>
          <div className="relative">
            <IconLock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <Input
              id="cg-password"
              ref={passwordRef}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-9"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-1.5 py-0.5 text-xs text-ink-muted hover:text-ink"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm text-sev-critical">
            {error}
          </p>
        )}

        <div className="flex items-center gap-2 pt-1">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            <IconArrowLeft /> Back
          </Button>
          <Button type="submit" className="ml-auto">
            Enter console
          </Button>
        </div>

        <p className="text-center text-[11px] leading-snug text-ink-muted/70">
          Mock sign-in — <strong>any</strong> username and password are accepted.
          This only visualizes a persona's access level; it is not real authentication.
        </p>
      </form>
    </Card>
  );
}

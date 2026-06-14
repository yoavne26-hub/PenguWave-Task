import { useRef, useState } from "react";
import { useRole } from "@/auth/RoleContext";
import { ROLE_LABELS, type Role } from "@/auth/roles";
import { verifyCredentials } from "@/auth/credentials";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  IconArrowLeft,
  IconChevronRight,
  IconLock,
  IconUser,
  PenguinMark,
} from "@/components/icons";

const ORDER: Role[] = ["analyst", "admin", "viewer"];

/** Persona picker + mock credential gate shown when no role is selected. */
export function RoleEntrance() {
  const { enter } = useRole();
  const [selected, setSelected] = useState<Role | null>(null);

  return (
    <div className="relative flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-3xl space-y-8">
        <header className="space-y-3 text-center">
          <div className="flex items-center justify-center gap-2 text-2xl font-bold tracking-tight">
            <PenguinMark className="text-ice-bright" style={{ fontSize: "1.75rem" }} />
            Pengu<span className="text-ice-bright">Wave</span>
          </div>
          <p className="text-ink-muted">
            {selected
              ? `Sign in to the console as ${ROLE_LABELS[selected].title}.`
              : "Security Operations Portal — choose a demo persona to enter the console."}
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
            {ORDER.map((role) => (
              <button
                key={role}
                onClick={() => setSelected(role)}
                className="group text-left focus-visible:outline-none"
              >
                <Card className="h-full cursor-pointer p-5 transition-all hover:-translate-y-0.5 hover:ring-1 hover:ring-ice-bright/50 group-focus-visible:ring-2 group-focus-visible:ring-ice-bright">
                  <h2 className="text-lg font-semibold text-ink">{ROLE_LABELS[role].title}</h2>
                  <p className="mt-2 text-sm text-ink-muted">{ROLE_LABELS[role].blurb}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-ice-bright">
                    Sign in as {ROLE_LABELS[role].title}
                    <IconChevronRight />
                  </span>
                </Card>
              </button>
            ))}
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Verify in memory only. The password is never logged or persisted.
    if (verifyCredentials(role, username, password)) {
      setError(null);
      onSuccess();
      return;
    }
    setError("Incorrect username or password for this persona.");
    setPassword("");
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
          Mock sign-in for the demo. Credentials are documented in the README.
        </p>
      </form>
    </Card>
  );
}

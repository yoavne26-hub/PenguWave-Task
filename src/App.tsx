import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { RoleProvider, useRole } from "@/auth/RoleContext";
import { Sidebar } from "@/components/Sidebar";
import { RoleEntrance } from "@/components/RoleEntrance";
import { OnboardingProvider, HelpButton } from "@/components/onboarding/Onboarding";
import { PersonaMenu } from "@/components/PersonaMenu";
import { Button } from "@/components/ui/button";
import { IconMenu } from "@/components/icons";
import OverviewPage from "@/pages/OverviewPage";
import EventsPage from "@/pages/EventsPage";
import UsersPage from "@/pages/UsersPage";
import NotFound from "@/pages/NotFound";

function Shell() {
  const { role, permissions } = useRole();
  const [navOpen, setNavOpen] = useState(false);

  // Esc closes the mobile nav drawer.
  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navOpen]);

  // No persona selected → show the entrance picker (demo UX, not auth).
  if (!role) return <RoleEntrance />;

  return (
    <OnboardingProvider>
      <div className="flex min-h-screen">
        {/* Static rail on large screens. */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Off-canvas drawer on small screens. */}
        {navOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="overlay-in absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setNavOpen(false)}
              aria-hidden
            />
            <div className="absolute left-0 top-0 h-full">
              <Sidebar onNavigate={() => setNavOpen(false)} />
            </div>
          </div>
        )}

        <main className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
          <header className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setNavOpen(true)}
                aria-label="Open navigation"
              >
                <IconMenu style={{ fontSize: "1.15rem" }} />
              </Button>
              <span className="hidden rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-ink-muted ring-1 ring-inset ring-hairline sm:inline">
                Demo · roles are a UX simulation, not real authorization
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <HelpButton />
              <PersonaMenu />
            </div>
          </header>
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Navigate to="/overview" replace />} />
              <Route path="/overview" element={<OverviewPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route
                path="/users"
                element={
                  permissions.canManageUsers ? <UsersPage /> : <Navigate to="/overview" replace />
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>
      </div>
    </OnboardingProvider>
  );
}

export default function App() {
  return (
    <RoleProvider>
      <Shell />
    </RoleProvider>
  );
}

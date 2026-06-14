import { Navigate, Route, Routes } from "react-router-dom";
import { RoleProvider, useRole } from "@/auth/RoleContext";
import { Sidebar } from "@/components/Sidebar";
import { RoleEntrance } from "@/components/RoleEntrance";
import { OnboardingProvider, HelpButton } from "@/components/onboarding/Onboarding";
import { PersonaMenu } from "@/components/PersonaMenu";
import OverviewPage from "@/pages/OverviewPage";
import EventsPage from "@/pages/EventsPage";
import UsersPage from "@/pages/UsersPage";
import NotFound from "@/pages/NotFound";

function Shell() {
  const { role, permissions } = useRole();

  // No persona selected → show the entrance picker (demo UX, not auth).
  if (!role) return <RoleEntrance />;

  return (
    <OnboardingProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex flex-1 flex-col overflow-x-hidden">
          <header className="flex items-center justify-between gap-3 border-b border-hairline px-6 py-3 lg:px-8">
            <span className="hidden rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-ink-muted ring-1 ring-inset ring-hairline sm:inline">
              Demo · roles are a UX simulation, not real authorization
            </span>
            <div className="ml-auto flex items-center gap-2">
              <HelpButton />
              <PersonaMenu />
            </div>
          </header>
          <div className="mx-auto w-full max-w-6xl px-6 py-6 lg:px-8">
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

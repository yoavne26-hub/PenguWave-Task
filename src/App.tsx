import { Navigate, Route, Routes } from "react-router-dom";
import { RoleProvider, useRole } from "@/auth/RoleContext";
import { Sidebar } from "@/components/Sidebar";
import { RoleEntrance } from "@/components/RoleEntrance";
import OverviewPage from "@/pages/OverviewPage";
import EventsPage from "@/pages/EventsPage";
import UsersPage from "@/pages/UsersPage";
import NotFound from "@/pages/NotFound";

function Shell() {
  const { role, permissions } = useRole();

  // No persona selected → show the entrance picker (demo UX, not auth).
  if (!role) return <RoleEntrance />;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden px-6 py-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
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
  );
}

export default function App() {
  return (
    <RoleProvider>
      <Shell />
    </RoleProvider>
  );
}

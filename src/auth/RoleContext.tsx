import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  ROLE_PERMISSIONS,
  type Role,
  type RolePermissions,
} from "./roles";

const STORAGE_KEY = "penguwave-role";

interface RoleContextValue {
  role: Role | null;
  permissions: RolePermissions;
  enter: (role: Role) => void;
  signOut: () => void;
}

// Default permissions when no role is selected: most restrictive.
const NO_PERMISSIONS: RolePermissions = {
  canExport: false,
  canManageUsers: false,
  readOnly: true,
};

const RoleContext = createContext<RoleContextValue | null>(null);

function readStoredRole(): Role | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "analyst" || stored === "admin" || stored === "viewer"
    ? stored
    : null;
}

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role | null>(readStoredRole);

  const enter = useCallback((next: Role) => {
    localStorage.setItem(STORAGE_KEY, next);
    setRole(next);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setRole(null);
  }, []);

  const value = useMemo<RoleContextValue>(
    () => ({
      role,
      permissions: role ? ROLE_PERMISSIONS[role] : NO_PERMISSIONS,
      enter,
      signOut,
    }),
    [role, enter, signOut],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within a RoleProvider");
  return ctx;
}

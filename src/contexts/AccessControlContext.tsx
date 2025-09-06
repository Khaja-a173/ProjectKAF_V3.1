import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { apiFetch } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { User as AccessUser, Role, AccessPolicy, AccessAuditLog, DASHBOARD_REGISTRY, DEFAULT_ROLES } from '@/types/access';

// --- ADD backward compatibility for legacy hooks ---
export type AccessRole = { key: string; name: string; capabilities: string[] };
export type AccessState = {
  users: AccessUser[];
  roles: AccessRole[];
  auditLogs?: any[];
  policy?: any;
};

// Module-scoped state + subscribers (safe shim for legacy hooks)
let __accessState: AccessState = { users: [], roles: [], auditLogs: [], policy: null };
const __accessSubs = new Set<(s: AccessState) => void>();

export function updateGlobalAccess(
  updater: (prev: any) => any
) {
  try {
    __accessState = updater(__accessState);
    __accessSubs.forEach((cb) => cb(__accessState));
  } catch (e) {
    console.error('[Access] updateGlobalAccess failed:', e);
  }
}

interface AccessControlContextType {
  currentUser: AccessUser | null;
  setCurrentUser: (user: AccessUser | null) => void;
  policy: AccessPolicy | null;
  users: AccessUser[]; // for future multi-user UIs; currently just [current]
  roles: Role[];
  auditLogs: AccessAuditLog[];
  loading: boolean;
  error: string | null;
  hasCapability: (capability: string, locationId?: string) => boolean;
  canAccessDashboard: (dashboardKey: string) => boolean;
  refreshPolicy: () => Promise<void>;
  switchUser: (userId: string) => void; // no-op in SaaS session model
}

const AccessControlContext = createContext<AccessControlContextType | undefined>(undefined);

// Canonical role → capabilities (keep in sync with backend RBAC intent)
const ROLE_CAPS: Record<string, string[]> = {
  ADMIN: [
    'ALL',
    'KITCHEN_VIEW', 'KITCHEN_ACTIONS', 'KITCHEN_OVERRIDE',
    'LIVE_ORDERS_VIEW',
    'TABLES_VIEW', 'TABLES_MANAGE', 'TABLES_CONFIG',
    'MENU_VIEW', 'MENU_MANAGE', 'MENU_BULK',
    'STAFF_VIEW', 'STAFF_MANAGE', 'STAFF_ROLES',
    'CUSTOMIZATION_VIEW', 'CUSTOMIZATION_MANAGE', 'CUSTOMIZATION_PUBLISH',
    'RESERVATIONS_VIEW', 'RESERVATIONS_MANAGE',
    'PAYMENTS_VIEW', 'PAYMENTS_PROCESS', 'PAYMENTS_REFUND',
    'REPORTS_VIEW', 'REPORTS_EXPORT',
  ],
  MANAGER: [
    'KITCHEN_VIEW', 'KITCHEN_ACTIONS',
    'LIVE_ORDERS_VIEW',
    'TABLES_VIEW', 'TABLES_MANAGE',
    'MENU_VIEW', 'MENU_MANAGE',
    'STAFF_VIEW',
    'RESERVATIONS_VIEW', 'RESERVATIONS_MANAGE',
    'PAYMENTS_VIEW',
    'REPORTS_VIEW',
  ],
  STAFF_WAITER: [ 'LIVE_ORDERS_VIEW', 'TABLES_VIEW', 'KITCHEN_VIEW', 'RESERVATIONS_VIEW' ],
  STAFF_CHEF:   [ 'KITCHEN_VIEW', 'KITCHEN_ACTIONS', 'LIVE_ORDERS_VIEW' ],
};

function mapRoleToCapabilities(roleKey?: string): string[] {
  if (!roleKey) return [];
  const key = roleKey.toUpperCase();
  return ROLE_CAPS[key] ?? [];
}

// Shape returned by /auth/whoami (server contract)
interface WhoAmI {
  authenticated: boolean;
  user: { id: string; email: string } | null;
  memberships: Array<{
    tenant_id: string;
    role: string; // 'admin' | 'manager' | 'staff_*'
    locations?: string[];
  }>;
  primary_tenant_id?: string | null;
}

function toAccessUser(who: WhoAmI): AccessUser | null {
  if (!who.authenticated || !who.user) return null;
  const primaryTenant = who.primary_tenant_id || who.memberships[0]?.tenant_id || null;
  const roleKey = (who.memberships.find(m => m.tenant_id === primaryTenant)?.role || '').toUpperCase();
  const capabilities = mapRoleToCapabilities(roleKey);
  return {
    id: who.user.id,
    tenantId: primaryTenant || 'unknown_tenant',
    email: who.user.email,
    firstName: '',
    lastName: '',
    status: 'active',
    roles: [{ key: roleKey || 'GUEST', name: roleKey || 'GUEST', capabilities }] as Role[],
    locationIds: [],
    capabilities,
    lastActive: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  } as AccessUser;
}

interface AccessControlProviderProps {
  children: ReactNode;
}

export function AccessControlProvider({ children }: AccessControlProviderProps) {
  const [currentUser, setCurrentUser] = useState<AccessUser | null>(null);
  const [roles] = useState<Role[]>(DEFAULT_ROLES as Role[]);
  const [auditLogs] = useState<AccessAuditLog[]>([]);
  const [policy, setPolicy] = useState<AccessPolicy | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load session + whoami and derive access
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔍 AccessControlProvider: Initializing...');

        // Ensure we have a Supabase session first
        const { data: sessionData } = await supabase.auth.getSession();
        console.log('🔍 AccessControlProvider: Session check complete', !!sessionData.session);
        
        if (!sessionData.session) {
          console.log('✅ AccessControlProvider: No session - proceeding as anonymous user');
          setCurrentUser(null);
          if (!cancelled) setLoading(false);
          return;
        }

        // Fetch server-side identity + memberships
        console.log('🔍 AccessControlProvider: Fetching whoami...');
        const who = await apiFetch('/auth/whoami');
        console.log('✅ AccessControlProvider: WhoAmI response received');
        const mapped = toAccessUser(who as WhoAmI);
        setCurrentUser(mapped);

        // Optionally fetch a policy from API later; for now synthesize from ROLE_CAPS
        const roleKey = mapped?.roles?.[0]?.key || 'GUEST';
        const roleCaps = mapRoleToCapabilities(roleKey);
        const syntheticPolicy: AccessPolicy = {
          id: 'synthetic_policy',
          tenantId: mapped?.tenantId || 'unknown_tenant',
          version: 1,
          roleCapabilities: { [roleKey]: roleCaps },
          userOverrides: {},
          locationGroups: [],
          createdBy: 'system',
          createdAt: new Date(),
        } as AccessPolicy;
        setPolicy(syntheticPolicy);
        console.log('✅ AccessControlProvider: Initialization complete');
      } catch (e: any) {
        console.error('❌ AccessControlProvider: Initialization failed', e);
        setError(e?.message ?? 'Failed to initialize access control');
        setCurrentUser(null);
        // Don't block the app if auth fails - continue with null user
      } finally {
        if (!cancelled) {
          setLoading(false);
          console.log('✅ AccessControlProvider: Loading complete');
        }
      }
    })();

    // React to auth changes (login/logout in other tabs)
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (!session) {
        setCurrentUser(null);
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const hasCapability = useMemo(() => {
    return (capability: string, _locationId?: string): boolean => {
      if (!currentUser) return false;
      if (currentUser.capabilities?.includes('ALL')) return true;
      return currentUser.capabilities?.includes(capability) ?? false;
    };
  }, [currentUser]);

  const canAccessDashboard = useMemo(() => {
    return (dashboardKey: string): boolean => {
      const dashboard = DASHBOARD_REGISTRY[dashboardKey];
      // If the dashboard key is not registered, don't block rendering (fail-open for tiles)
      if (!dashboard) return true;

      // While we're still resolving session/policy, don't hide tiles
      if (loading) return true;

      // Not logged in -> no access to dashboards
      if (!currentUser) return false;

      // ADMIN shortcut
      if (currentUser.capabilities?.includes('ALL')) return true;

      // Check required capabilities
      return dashboard.capabilities.some((cap) => hasCapability(cap.key));
    };
  }, [hasCapability, currentUser, loading]);

  const refreshPolicy = async () => {
    try {
      setLoading(true);
      const who = await apiFetch('/auth/whoami');
      const mapped = toAccessUser(who as WhoAmI);
      setCurrentUser(mapped);
      const roleKey = mapped?.roles?.[0]?.key || 'GUEST';
      const roleCaps = mapRoleToCapabilities(roleKey);
      setPolicy({
        id: 'synthetic_policy',
        tenantId: mapped?.tenantId || 'unknown_tenant',
        version: 1,
        roleCapabilities: { [roleKey]: roleCaps },
        userOverrides: {},
        locationGroups: [],
        createdBy: 'system',
        createdAt: new Date(),
      } as AccessPolicy);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to refresh access policy');
    } finally {
      setLoading(false);
    }
  };

  const switchUser = (_userId: string) => {
    // No-op: in SaaS we do not arbitrarily switch users; session binds identity.
    // Kept to preserve existing component contracts.
  };

  return (
    <AccessControlContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        policy,
        users: currentUser ? [currentUser] : [],
        roles,
        auditLogs,
        loading,
        error,
        hasCapability,
        canAccessDashboard,
        refreshPolicy,
        switchUser,
      }}
    >
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading ProjectKAF...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AccessControlContext.Provider>
  );
}

export function useAccessControl() {
  const context = useContext(AccessControlContext);
  if (!context) throw new Error('useAccessControl must be used within an AccessControlProvider');
  return context;
}

export function useCapability(capability: string, locationId?: string) {
  const { hasCapability } = useAccessControl();
  return hasCapability(capability, locationId);
}

export function useDashboardAccess(dashboardKey: string) {
  const { canAccessDashboard } = useAccessControl();
  return canAccessDashboard(dashboardKey);
}

export interface User {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  status: "active" | "invited" | "suspended" | "expired";
  roles: Role[];
  locationIds: string[];
  capabilities: string[];
  temporaryAccess?: TemporaryAccess[];
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  tenantId: string;
  key: string;
  name: string;
  displayName: string;
  color: string;
  icon: string;
  capabilities: string[];
  isDefault: boolean;
  isCustom: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Dashboard {
  key: string;
  name: string;
  description: string;
  icon: string;
  category: "operations" | "management" | "analytics" | "settings";
  capabilities: DashboardCapability[];
  defaultRoles: {
    manager: string[];
    staff: string[];
  };
}

export interface DashboardCapability {
  key: string;
  name: string;
  description: string;
  type: "view" | "manage" | "action" | "sensitive";
  requiresConfirmation?: boolean;
  stationScoped?: boolean;
}

export interface AccessPolicy {
  id: string;
  tenantId: string;
  version: number;
  roleCapabilities: Record<string, string[]>;
  userOverrides: Record<string, UserOverride>;
  locationGroups: LocationGroup[];
  createdBy: string;
  createdAt: Date;
  changelog?: string;
}

export interface UserOverride {
  userId: string;
  grantedCapabilities: string[];
  revokedCapabilities: string[];
  locationIds?: string[];
  stationIds?: string[];
  expiresAt?: Date;
  reason?: string;
}

export interface LocationGroup {
  id: string;
  name: string;
  locationIds: string[];
  color: string;
}

export interface TemporaryAccess {
  id: string;
  capability: string;
  locationIds?: string[];
  grantedBy: string;
  grantedAt: Date;
  expiresAt: Date;
  reason: string;
  isActive: boolean;
}

export interface AccessAuditLog {
  id: string;
  tenantId: string;
  action:
    | "grant"
    | "revoke"
    | "temp_grant"
    | "role_assign"
    | "role_remove"
    | "suspend"
    | "restore";
  targetUserId: string;
  targetUserEmail: string;
  capability?: string;
  role?: string;
  locationIds?: string[];
  actorId: string;
  actorEmail: string;
  reason?: string;
  before: any;
  after: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface AccessControlFilters {
  search: string;
  role: string;
  status: string;
  location: string;
  capability: string;
}

// Dashboard Registry - Central definition of all dashboards and their capabilities
export const DASHBOARD_REGISTRY: Record<string, Dashboard> = {
  KITCHEN: {
    key: "KITCHEN",
    name: "Kitchen Dashboard",
    description: "Order queues, station management, and kitchen operations",
    icon: "ChefHat",
    category: "operations",
    capabilities: [
      {
        key: "KITCHEN_VIEW",
        name: "View Kitchen Dashboard",
        description: "Access to kitchen order queues and status",
        type: "view",
      },
      {
        key: "KITCHEN_ACTIONS",
        name: "Kitchen Actions",
        description: "Start, ready, hold, and recall orders",
        type: "action",
        stationScoped: true,
      },
      {
        key: "KITCHEN_OVERRIDE",
        name: "Kitchen Override",
        description: "Force status changes and emergency actions",
        type: "sensitive",
        requiresConfirmation: true,
      },
    ],
    defaultRoles: {
      manager: ["KITCHEN_VIEW", "KITCHEN_ACTIONS", "KITCHEN_OVERRIDE"],
      staff: ["KITCHEN_VIEW"],
    },
  },
  LIVE_ORDERS: {
    key: "LIVE_ORDERS",
    name: "Live Orders",
    description: "Real-time order tracking and customer updates",
    icon: "Activity",
    category: "operations",
    capabilities: [
      {
        key: "LIVE_ORDERS_VIEW",
        name: "View Live Orders",
        description: "Access to live order tracking dashboard",
        type: "view",
      },
    ],
    defaultRoles: {
      manager: ["LIVE_ORDERS_VIEW"],
      staff: ["LIVE_ORDERS_VIEW"],
    },
  },
  TABLES: {
    key: "TABLES",
    name: "Table Management",
    description: "Table status, reservations, and floor management",
    icon: "Grid3X3",
    category: "operations",
    capabilities: [
      {
        key: "TABLES_VIEW",
        name: "View Tables",
        description: "View table status and floor layout",
        type: "view",
      },
      {
        key: "TABLES_MANAGE",
        name: "Manage Tables",
        description: "Change table status, seat guests, manage sessions",
        type: "manage",
      },
      {
        key: "TABLES_CONFIG",
        name: "Configure Tables",
        description: "Add/remove tables, modify floor layout",
        type: "sensitive",
        requiresConfirmation: true,
      },
    ],
    defaultRoles: {
      manager: ["TABLES_VIEW", "TABLES_MANAGE", "TABLES_CONFIG"],
      staff: ["TABLES_VIEW"],
    },
  },
  MENU: {
    key: "MENU",
    name: "Menu Management",
    description: "Menu items, categories, pricing, and availability",
    icon: "Menu",
    category: "management",
    capabilities: [
      {
        key: "MENU_VIEW",
        name: "View Menu",
        description: "Access to menu management dashboard",
        type: "view",
      },
      {
        key: "MENU_MANAGE",
        name: "Manage Menu",
        description: "Edit items, prices, availability, and categories",
        type: "manage",
      },
      {
        key: "MENU_BULK",
        name: "Bulk Operations",
        description: "Bulk upload, export, and mass changes",
        type: "action",
      },
    ],
    defaultRoles: {
      manager: ["MENU_VIEW", "MENU_MANAGE", "MENU_BULK"],
      staff: ["MENU_VIEW"],
    },
  },
  STAFF: {
    key: "STAFF",
    name: "Staff Management",
    description: "User management, roles, and permissions",
    icon: "Users",
    category: "management",
    capabilities: [
      {
        key: "STAFF_VIEW",
        name: "View Staff",
        description: "View staff directory and basic information",
        type: "view",
      },
      {
        key: "STAFF_MANAGE",
        name: "Manage Staff",
        description: "Invite, edit, and manage staff members",
        type: "manage",
      },
      {
        key: "STAFF_ROLES",
        name: "Manage Roles",
        description: "Assign roles and permissions",
        type: "sensitive",
        requiresConfirmation: true,
      },
    ],
    defaultRoles: {
      manager: ["STAFF_VIEW"],
      staff: [],
    },
  },
  CUSTOMIZATION: {
    key: "CUSTOMIZATION",
    name: "Application Customization",
    description: "Branding, themes, and page customization",
    icon: "Palette",
    category: "settings",
    capabilities: [
      {
        key: "CUSTOMIZATION_VIEW",
        name: "View Customization",
        description: "Access to customization dashboard",
        type: "view",
      },
      {
        key: "CUSTOMIZATION_MANAGE",
        name: "Manage Customization",
        description: "Edit branding, themes, and page content",
        type: "manage",
      },
      {
        key: "CUSTOMIZATION_PUBLISH",
        name: "Publish Changes",
        description: "Publish customization changes live",
        type: "sensitive",
        requiresConfirmation: true,
      },
    ],
    defaultRoles: {
      manager: [],
      staff: [],
    },
  },
  RESERVATIONS: {
    key: "RESERVATIONS",
    name: "Reservations",
    description: "Booking management and customer reservations",
    icon: "Calendar",
    category: "operations",
    capabilities: [
      {
        key: "RESERVATIONS_VIEW",
        name: "View Reservations",
        description: "View booking calendar and reservation details",
        type: "view",
      },
      {
        key: "RESERVATIONS_MANAGE",
        name: "Manage Reservations",
        description: "Create, modify, and cancel reservations",
        type: "manage",
      },
    ],
    defaultRoles: {
      manager: ["RESERVATIONS_VIEW", "RESERVATIONS_MANAGE"],
      staff: ["RESERVATIONS_VIEW"],
    },
  },
  PAYMENTS: {
    key: "PAYMENTS",
    name: "Payments",
    description: "Payment processing, refunds, and financial operations",
    icon: "CreditCard",
    category: "management",
    capabilities: [
      {
        key: "PAYMENTS_VIEW",
        name: "View Payments",
        description: "View payment history and transaction details",
        type: "view",
      },
      {
        key: "PAYMENTS_PROCESS",
        name: "Process Payments",
        description: "Process customer payments and transactions",
        type: "action",
      },
      {
        key: "PAYMENTS_REFUND",
        name: "Issue Refunds",
        description: "Process refunds and payment reversals",
        type: "sensitive",
        requiresConfirmation: true,
      },
    ],
    defaultRoles: {
      manager: ["PAYMENTS_VIEW"],
      staff: [],
    },
  },
  REPORTS: {
    key: "REPORTS",
    name: "Analytics & Reports",
    description: "Business analytics, reports, and insights",
    icon: "BarChart3",
    category: "analytics",
    capabilities: [
      {
        key: "REPORTS_VIEW",
        name: "View Reports",
        description: "Access to analytics dashboard and basic reports",
        type: "view",
      },
      {
        key: "REPORTS_EXPORT",
        name: "Export Data",
        description: "Export reports and sensitive business data",
        type: "sensitive",
        requiresConfirmation: true,
      },
    ],
    defaultRoles: {
      manager: ["REPORTS_VIEW"],
      staff: [],
    },
  },
};

// Default Role Templates
export const DEFAULT_ROLES: Omit<
  Role,
  "id" | "tenantId" | "createdAt" | "updatedAt"
>[] = [
  {
    key: "OWNER",
    name: "OWNER",
    displayName: "Owner",
    color: "#DC2626",
    icon: "Crown",
    capabilities: ["ALL"], // Special case - grants all capabilities
    isDefault: true,
    isCustom: false,
  },
  {
    key: "ADMIN",
    name: "ADMIN",
    displayName: "Administrator",
    color: "#7C2D12",
    icon: "Shield",
    capabilities: [
      "KITCHEN_VIEW",
      "KITCHEN_ACTIONS",
      "KITCHEN_OVERRIDE",
      "LIVE_ORDERS_VIEW",
      "TABLES_VIEW",
      "TABLES_MANAGE",
      "TABLES_CONFIG",
      "MENU_VIEW",
      "MENU_MANAGE",
      "MENU_BULK",
      "STAFF_VIEW",
      "STAFF_MANAGE",
      "STAFF_ROLES",
      "CUSTOMIZATION_VIEW",
      "CUSTOMIZATION_MANAGE",
      "CUSTOMIZATION_PUBLISH",
      "RESERVATIONS_VIEW",
      "RESERVATIONS_MANAGE",
      "PAYMENTS_VIEW",
      "PAYMENTS_PROCESS",
      "PAYMENTS_REFUND",
      "REPORTS_VIEW",
      "REPORTS_EXPORT",
    ],
    isDefault: true,
    isCustom: false,
  },
  {
    key: "MANAGER",
    name: "MANAGER",
    displayName: "Manager",
    color: "#3B82F6",
    icon: "UserCog",
    capabilities: [
      "KITCHEN_VIEW",
      "KITCHEN_ACTIONS",
      "LIVE_ORDERS_VIEW",
      "TABLES_VIEW",
      "TABLES_MANAGE",
      "MENU_VIEW",
      "MENU_MANAGE",
      "STAFF_VIEW",
      "RESERVATIONS_VIEW",
      "RESERVATIONS_MANAGE",
      "PAYMENTS_VIEW",
      "REPORTS_VIEW",
    ],
    isDefault: true,
    isCustom: false,
  },
  {
    key: "STAFF_WAITER",
    name: "STAFF_WAITER",
    displayName: "Waiter",
    color: "#10B981",
    icon: "Users",
    capabilities: [
      "LIVE_ORDERS_VIEW",
      "TABLES_VIEW",
      "KITCHEN_VIEW",
      "RESERVATIONS_VIEW",
    ],
    isDefault: true,
    isCustom: false,
  },
  {
    key: "STAFF_CHEF",
    name: "STAFF_CHEF",
    displayName: "Chef/KDS",
    color: "#F59E0B",
    icon: "ChefHat",
    capabilities: ["KITCHEN_VIEW", "KITCHEN_ACTIONS", "LIVE_ORDERS_VIEW"],
    isDefault: true,
    isCustom: false,
  },
  {
    key: "STAFF_CASHIER",
    name: "STAFF_CASHIER",
    displayName: "Cashier",
    color: "#059669",
    icon: "DollarSign",
    capabilities: ["PAYMENTS_VIEW", "PAYMENTS_PROCESS", "LIVE_ORDERS_VIEW"],
    isDefault: true,
    isCustom: false,
  },
  {
    key: "STAFF_HOST",
    name: "STAFF_HOST",
    displayName: "Host",
    color: "#8B5CF6",
    icon: "UserCheck",
    capabilities: ["RESERVATIONS_VIEW", "RESERVATIONS_MANAGE", "TABLES_VIEW"],
    isDefault: true,
    isCustom: false,
  },
];

export interface AccessControlState {
  policy: AccessPolicy;
  users: User[];
  roles: Role[];
  auditLogs: AccessAuditLog[];
  loading: boolean;
  error: string | null;
}

export interface AccessControlActions {
  grantCapability: (
    userId: string,
    capability: string,
    locationIds?: string[],
  ) => Promise<void>;
  revokeCapability: (userId: string, capability: string) => Promise<void>;
  assignRole: (userId: string, roleKey: string) => Promise<void>;
  removeRole: (userId: string, roleKey: string) => Promise<void>;
  grantTemporaryAccess: (
    userId: string,
    capability: string,
    expiresAt: Date,
    reason: string,
  ) => Promise<void>;
  suspendUser: (userId: string, reason: string) => Promise<void>;
  restoreUser: (userId: string) => Promise<void>;
  updateRole: (roleKey: string, capabilities: string[]) => Promise<void>;
  rollbackToVersion: (version: number) => Promise<void>;
}

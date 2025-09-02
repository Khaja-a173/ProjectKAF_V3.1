import { useState } from "react";
import { useAccessControl } from "../contexts/AccessControlContext";
import { useAccessManagement } from "../hooks/useAccessManagement";
import { DASHBOARD_REGISTRY } from "../types/access";
import {
  Users,
  Shield,
  Search,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  RotateCcw,
  UserPlus,
  UserMinus,
  Key,
  Calendar,
  MapPin,
  Activity,
  History,
  X,
  Building,
  Edit,
} from "lucide-react";

interface AccessControlDashboardProps {
  tenantId: string;
  locationId?: string;
  currentUserId: string;
}

export default function AccessControlDashboard({
  tenantId,
  locationId,
  currentUserId,
}: AccessControlDashboardProps) {
  const {
    currentUser,
    policy,
    users,
    roles,
    auditLogs,
    loading,
    error,
    hasCapability,
    canAccessDashboard,
  } = useAccessControl();

  const {
    grantCapability,
    revokeCapability,
    assignRole,
    removeRole,
    grantTemporaryAccess,
    suspendUser,
    restoreUser,
    updateRole,
    createCustomRole,
    rollbackToVersion,
    bulkAssignRole,
    exportAccessReport,
  } = useAccessManagement(tenantId, currentUserId);

  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "roles" | "dashboards" | "locations" | "audit"
  >("overview");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [showTempAccessModal, setShowTempAccessModal] = useState(false);
  const [showRoleEditor, setShowRoleEditor] = useState(false);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      filterRole === "all" || user.roles.some((r) => r.key === filterRole);
    const matchesStatus =
      filterStatus === "all" || user.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "invited":
        return "bg-yellow-100 text-yellow-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "invited":
        return <Clock className="w-4 h-4" />;
      case "suspended":
        return <XCircle className="w-4 h-4" />;
      case "expired":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const handleExportReport = async () => {
    try {
      const blob = await exportAccessReport();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `access-report-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export report");
    }
  };

  const handleGrantCapability = async (userId: string, capability: string) => {
    try {
      await grantCapability(
        userId,
        capability,
        undefined,
        "Manual grant from admin",
      );
      alert("Capability granted successfully!");
    } catch (err) {
      alert("Failed to grant capability");
    }
  };

  const handleRevokeCapability = async (userId: string, capability: string) => {
    try {
      await revokeCapability(userId, capability, "Manual revoke from admin");
      alert("Capability revoked successfully!");
    } catch (err) {
      alert("Failed to revoke capability");
    }
  };

  const handleAssignRole = async (userId: string, roleKey: string) => {
    try {
      await assignRole(userId, roleKey, "Manual role assignment from admin");
      alert("Role assigned successfully!");
    } catch (err) {
      alert("Failed to assign role");
    }
  };

  const handleRemoveRole = async (userId: string, roleKey: string) => {
    try {
      await removeRole(userId, roleKey, "Manual role removal from admin");
      alert("Role removed successfully!");
    } catch (err) {
      alert("Failed to remove role");
    }
  };
  const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter((u) => u.status === "active").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Custom Roles</p>
              <p className="text-2xl font-bold text-gray-900">
                {roles.filter((r) => r.isCustom).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Policy Version
              </p>
              <p className="text-2xl font-bold text-gray-900">
                v{policy?.version}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <History className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Access Matrix */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Dashboard Access Overview
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Dashboard
                </th>
                {roles
                  .filter((r) => r.isDefault)
                  .map((role) => (
                    <th
                      key={role.key}
                      className="text-center py-3 px-4 font-medium text-gray-900"
                    >
                      {role.displayName}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {Object.values(DASHBOARD_REGISTRY).map((dashboard) => (
                <tr key={dashboard.key} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {dashboard.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {dashboard.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  {roles
                    .filter((r) => r.isDefault)
                    .map((role) => (
                      <td key={role.key} className="py-3 px-4 text-center">
                        <div className="flex justify-center space-x-1">
                          {dashboard.capabilities.map((cap) => {
                            const hasAccess = role.capabilities.includes(
                              cap.key,
                            );
                            return (
                              <div
                                key={cap.key}
                                className={`w-3 h-3 rounded-full ${
                                  hasAccess ? "bg-green-500" : "bg-gray-200"
                                }`}
                                title={`${cap.name}: ${hasAccess ? "Granted" : "Denied"}`}
                              />
                            );
                          })}
                        </div>
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderRolesTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Role Templates & Presets
          </h3>
          <button
            onClick={() => setShowRoleEditor(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Role</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div
              key={role.key}
              className="border border-gray-200 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: role.color }}
                  >
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {role.displayName}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {role.isDefault ? "Default" : "Custom"}
                    </p>
                  </div>
                </div>
                {role.isCustom && (
                  <button
                    onClick={() => setSelectedRole(role.key)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  <strong>Capabilities:</strong> {role.capabilities.length}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Users:</strong>{" "}
                  {
                    users.filter((u) => u.roles.some((r) => r.key === role.key))
                      .length
                  }
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1">
                {role.capabilities.slice(0, 3).map((cap) => (
                  <span
                    key={cap}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {cap.replace("_", " ")}
                  </span>
                ))}
                {role.capabilities.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    +{role.capabilities.length - 3} more
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            User Management
          </h3>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              {roles.map((role) => (
                <option key={role.key} value={role.key}>
                  {role.displayName}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="invited">Invited</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {user.firstName[0]}
                      {user.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </h4>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}
                  >
                    {getStatusIcon(user.status)}
                    <span className="ml-1">{user.status}</span>
                  </span>
                  <button
                    onClick={() => setSelectedUser(user.id)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {user.roles.map((role) => (
                  <span
                    key={role.key}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: role.color }}
                  >
                    {role.displayName}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDashboardsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Dashboard Capabilities Matrix
        </h3>

        <div className="space-y-6">
          {Object.values(DASHBOARD_REGISTRY).map((dashboard) => (
            <div
              key={dashboard.key}
              className="border border-gray-200 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {dashboard.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {dashboard.description}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full capitalize">
                  {dashboard.category}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboard.capabilities.map((capability) => (
                  <div
                    key={capability.key}
                    className="border border-gray-100 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">
                        {capability.name}
                      </h5>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          capability.type === "view"
                            ? "bg-blue-100 text-blue-800"
                            : capability.type === "manage"
                              ? "bg-green-100 text-green-800"
                              : capability.type === "action"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-red-100 text-red-800"
                        }`}
                      >
                        {capability.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {capability.description}
                    </p>
                    {capability.requiresConfirmation && (
                      <div className="mt-2 flex items-center space-x-1 text-xs text-red-600">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Requires confirmation</span>
                      </div>
                    )}
                    {capability.stationScoped && (
                      <div className="mt-2 flex items-center space-x-1 text-xs text-purple-600">
                        <MapPin className="w-3 h-3" />
                        <span>Station scoped</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAuditTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Access Control Audit Log
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportReport}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Audit</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {auditLogs.slice(0, 20).map((log) => (
            <div key={log.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      log.action === "grant" || log.action === "role_assign"
                        ? "bg-green-100"
                        : log.action === "revoke" ||
                            log.action === "role_remove"
                          ? "bg-red-100"
                          : log.action === "suspend"
                            ? "bg-red-100"
                            : log.action === "restore"
                              ? "bg-green-100"
                              : "bg-blue-100"
                    }`}
                  >
                    {log.action === "grant" || log.action === "role_assign" ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : log.action === "revoke" ||
                      log.action === "role_remove" ? (
                      <XCircle className="w-4 h-4 text-red-600" />
                    ) : log.action === "suspend" ? (
                      <XCircle className="w-4 h-4 text-red-600" />
                    ) : log.action === "restore" ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {log.action.replace("_", " ").toUpperCase()}:{" "}
                      {log.targetUserEmail}
                    </div>
                    <div className="text-sm text-gray-500">
                      {log.capability && `Capability: ${log.capability}`}
                      {log.role && `Role: ${log.role}`}
                      {log.reason && ` • ${log.reason}`}
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div>{log.createdAt.toLocaleDateString()}</div>
                  <div>{log.createdAt.toLocaleTimeString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Access Control</h2>
          <p className="text-gray-600">
            Manage user permissions and dashboard access
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-green-100 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-800">
              Live Policy v{policy?.version}
            </span>
          </div>
          <button
            onClick={() =>
              rollbackToVersion(policy?.version ? policy.version - 1 : 1)
            }
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Rollback</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "overview"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "users"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Users & Assignments
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "roles"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Roles & Presets
          </button>
          <button
            onClick={() => setActiveTab("dashboards")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "dashboards"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Dashboards & Capabilities
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "audit"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Audit & Versions
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === "overview" && renderOverview()}
      {activeTab === "users" && renderUsersTab()}
      {activeTab === "roles" && renderRolesTab()}
      {activeTab === "dashboards" && renderDashboardsTab()}
      {activeTab === "audit" && renderAuditTab()}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-40">
          <div className="bg-white rounded-xl p-6 flex items-center space-x-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-900">Updating access control...</span>
          </div>
        </div>
      )}
    </div>
  );
}

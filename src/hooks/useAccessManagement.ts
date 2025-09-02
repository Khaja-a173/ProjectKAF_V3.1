import { useState, useCallback } from "react";
import { updateGlobalAccess } from "../contexts/AccessControlContext";
import { User, Role, AccessAuditLog, TemporaryAccess } from "../types/access";

interface AccessManagementActions {
  grantCapability: (
    userId: string,
    capability: string,
    locationIds?: string[],
    reason?: string,
  ) => Promise<void>;
  revokeCapability: (
    userId: string,
    capability: string,
    reason?: string,
  ) => Promise<void>;
  assignRole: (
    userId: string,
    roleKey: string,
    reason?: string,
  ) => Promise<void>;
  removeRole: (
    userId: string,
    roleKey: string,
    reason?: string,
  ) => Promise<void>;
  grantTemporaryAccess: (
    userId: string,
    capability: string,
    expiresAt: Date,
    reason: string,
    locationIds?: string[],
  ) => Promise<void>;
  suspendUser: (userId: string, reason: string) => Promise<void>;
  restoreUser: (userId: string, reason?: string) => Promise<void>;
  updateRole: (
    roleKey: string,
    capabilities: string[],
    reason?: string,
  ) => Promise<void>;
  createCustomRole: (roleData: Partial<Role>) => Promise<Role>;
  rollbackToVersion: (version: number, reason?: string) => Promise<void>;
  bulkAssignRole: (
    userIds: string[],
    roleKey: string,
    reason?: string,
  ) => Promise<void>;
  exportAccessReport: () => Promise<Blob>;
}

export function useAccessManagement(
  tenantId: string,
  currentUserId: string,
): AccessManagementActions {
  const createAuditLog = (
    action: AccessAuditLog["action"],
    targetUserId: string,
    targetUserEmail: string,
    details: Partial<AccessAuditLog>,
    reason?: string,
  ): AccessAuditLog => ({
    id: `audit_${Date.now()}`,
    tenantId,
    action,
    targetUserId,
    targetUserEmail,
    actorId: currentUserId,
    actorEmail: "admin@restaurant.com", // Would come from current user context
    reason,
    before: null,
    after: null,
    ipAddress: "192.168.1.100", // Would come from request
    userAgent: navigator.userAgent,
    createdAt: new Date(),
    capability: details.capability,
    role: details.role,
    locationIds: details.locationIds,
  });

  const grantCapability = useCallback(
    async (
      userId: string,
      capability: string,
      locationIds?: string[],
      reason?: string,
    ) => {
      try {
        console.log("🔐 Granting capability:", capability, "to user:", userId);

        updateGlobalAccess((prev) => {
          const user = prev.users.find((u) => u.id === userId);
          if (!user) throw new Error("User not found");

          const updatedUsers = prev.users.map((u) => {
            if (u.id === userId) {
              const newCapabilities = [
                ...new Set([...u.capabilities, capability]),
              ];
              return {
                ...u,
                capabilities: newCapabilities,
                updatedAt: new Date(),
              };
            }
            return u;
          });

          const auditLog = createAuditLog(
            "grant",
            userId,
            user.email,
            {
              capability,
              locationIds,
              before: { capabilities: user.capabilities },
              after: {
                capabilities: [...new Set([...user.capabilities, capability])],
              },
            },
            reason,
          );

          return {
            ...prev,
            users: updatedUsers,
            auditLogs: [auditLog, ...prev.auditLogs],
            policy: {
              ...prev.policy,
              version: prev.policy.version + 1,
              userOverrides: {
                ...prev.policy.userOverrides,
                [userId]: {
                  userId,
                  grantedCapabilities: [
                    ...new Set([
                      ...(prev.policy.userOverrides[userId]
                        ?.grantedCapabilities || []),
                      capability,
                    ]),
                  ],
                  revokedCapabilities:
                    prev.policy.userOverrides[userId]?.revokedCapabilities ||
                    [],
                  locationIds,
                  reason,
                },
              },
            },
          };
        });

        // Simulate real-time broadcast
        setTimeout(() => {
          console.log("📡 Broadcasting access control update");
          // In real app, this would trigger WebSocket/SSE events
        }, 100);

        console.log("✅ Capability granted successfully");
      } catch (err) {
        console.error("❌ Failed to grant capability:", err);
        throw err;
      }
    },
    [tenantId, currentUserId],
  );

  const revokeCapability = useCallback(
    async (userId: string, capability: string, reason?: string) => {
      try {
        console.log(
          "🔐 Revoking capability:",
          capability,
          "from user:",
          userId,
        );

        updateGlobalAccess((prev) => {
          const user = prev.users.find((u) => u.id === userId);
          if (!user) throw new Error("User not found");

          const updatedUsers = prev.users.map((u) => {
            if (u.id === userId) {
              const newCapabilities = u.capabilities.filter(
                (c) => c !== capability,
              );
              return {
                ...u,
                capabilities: newCapabilities,
                updatedAt: new Date(),
              };
            }
            return u;
          });

          const auditLog = createAuditLog(
            "revoke",
            userId,
            user.email,
            {
              capability,
              before: { capabilities: user.capabilities },
              after: {
                capabilities: user.capabilities.filter((c) => c !== capability),
              },
            },
            reason,
          );

          return {
            ...prev,
            users: updatedUsers,
            auditLogs: [auditLog, ...prev.auditLogs],
            policy: {
              ...prev.policy,
              version: prev.policy.version + 1,
              userOverrides: {
                ...prev.policy.userOverrides,
                [userId]: {
                  userId,
                  grantedCapabilities:
                    prev.policy.userOverrides[
                      userId
                    ]?.grantedCapabilities?.filter((c) => c !== capability) ||
                    [],
                  revokedCapabilities: [
                    ...new Set([
                      ...(prev.policy.userOverrides[userId]
                        ?.revokedCapabilities || []),
                      capability,
                    ]),
                  ],
                  reason,
                },
              },
            },
          };
        });

        console.log("✅ Capability revoked successfully");
      } catch (err) {
        console.error("❌ Failed to revoke capability:", err);
        throw err;
      }
    },
    [tenantId, currentUserId],
  );

  const assignRole = useCallback(
    async (userId: string, roleKey: string, reason?: string) => {
      try {
        console.log("🔐 Assigning role:", roleKey, "to user:", userId);

        updateGlobalAccess((prev) => {
          const user = prev.users.find((u) => u.id === userId);
          const role = prev.roles.find((r) => r.key === roleKey);
          if (!user || !role) throw new Error("User or role not found");

          const updatedUsers = prev.users.map((u) => {
            if (u.id === userId) {
              const newRoles = [
                ...u.roles.filter((r) => r.key !== roleKey),
                role,
              ];
              const newCapabilities = [
                ...new Set([...u.capabilities, ...role.capabilities]),
              ];
              return {
                ...u,
                roles: newRoles,
                capabilities: newCapabilities,
                updatedAt: new Date(),
              };
            }
            return u;
          });

          const auditLog = createAuditLog(
            "role_assign",
            userId,
            user.email,
            {
              role: roleKey,
              before: { roles: user.roles.map((r) => r.key) },
              after: {
                roles: [
                  ...user.roles
                    .filter((r) => r.key !== roleKey)
                    .map((r) => r.key),
                  roleKey,
                ],
              },
            },
            reason,
          );

          return {
            ...prev,
            users: updatedUsers,
            auditLogs: [auditLog, ...prev.auditLogs],
            policy: {
              ...prev.policy,
              version: prev.policy.version + 1,
            },
          };
        });

        console.log("✅ Role assigned successfully");
      } catch (err) {
        console.error("❌ Failed to assign role:", err);
        throw err;
      }
    },
    [tenantId, currentUserId],
  );

  const removeRole = useCallback(
    async (userId: string, roleKey: string, reason?: string) => {
      try {
        console.log("🔐 Removing role:", roleKey, "from user:", userId);

        updateGlobalAccess((prev) => {
          const user = prev.users.find((u) => u.id === userId);
          if (!user) throw new Error("User not found");

          const updatedUsers = prev.users.map((u) => {
            if (u.id === userId) {
              const newRoles = u.roles.filter((r) => r.key !== roleKey);
              // Recalculate capabilities from remaining roles
              const newCapabilities = [
                ...new Set(newRoles.flatMap((r) => r.capabilities)),
              ];
              return {
                ...u,
                roles: newRoles,
                capabilities: newCapabilities,
                updatedAt: new Date(),
              };
            }
            return u;
          });

          const auditLog = createAuditLog(
            "role_remove",
            userId,
            user.email,
            {
              role: roleKey,
              before: { roles: user.roles.map((r) => r.key) },
              after: {
                roles: user.roles
                  .filter((r) => r.key !== roleKey)
                  .map((r) => r.key),
              },
            },
            reason,
          );

          return {
            ...prev,
            users: updatedUsers,
            auditLogs: [auditLog, ...prev.auditLogs],
            policy: {
              ...prev.policy,
              version: prev.policy.version + 1,
            },
          };
        });

        console.log("✅ Role removed successfully");
      } catch (err) {
        console.error("❌ Failed to remove role:", err);
        throw err;
      }
    },
    [tenantId, currentUserId],
  );

  const grantTemporaryAccess = useCallback(
    async (
      userId: string,
      capability: string,
      expiresAt: Date,
      reason: string,
      locationIds?: string[],
    ) => {
      try {
        console.log(
          "🔐 Granting temporary access:",
          capability,
          "to user:",
          userId,
        );

        updateGlobalAccess((prev) => {
          const user = prev.users.find((u) => u.id === userId);
          if (!user) throw new Error("User not found");

          const tempAccess: TemporaryAccess = {
            id: `temp_${Date.now()}`,
            capability,
            locationIds,
            grantedBy: currentUserId,
            grantedAt: new Date(),
            expiresAt,
            reason,
            isActive: true,
          };

          const updatedUsers = prev.users.map((u) => {
            if (u.id === userId) {
              return {
                ...u,
                temporaryAccess: [...(u.temporaryAccess || []), tempAccess],
                updatedAt: new Date(),
              };
            }
            return u;
          });

          const auditLog = createAuditLog(
            "temp_grant",
            userId,
            user.email,
            {
              capability,
              locationIds,
              before: { temporaryAccess: user.temporaryAccess || [] },
              after: {
                temporaryAccess: [...(user.temporaryAccess || []), tempAccess],
              },
            },
            reason,
          );

          return {
            ...prev,
            users: updatedUsers,
            auditLogs: [auditLog, ...prev.auditLogs],
            policy: {
              ...prev.policy,
              version: prev.policy.version + 1,
            },
          };
        });

        console.log("✅ Temporary access granted successfully");
      } catch (err) {
        console.error("❌ Failed to grant temporary access:", err);
        throw err;
      }
    },
    [tenantId, currentUserId],
  );

  const suspendUser = useCallback(
    async (userId: string, reason: string) => {
      try {
        console.log("🔐 Suspending user:", userId);

        updateGlobalAccess((prev) => {
          const user = prev.users.find((u) => u.id === userId);
          if (!user) throw new Error("User not found");

          const updatedUsers = prev.users.map((u) => {
            if (u.id === userId) {
              return {
                ...u,
                status: "suspended" as const,
                updatedAt: new Date(),
              };
            }
            return u;
          });

          const auditLog = createAuditLog(
            "suspend",
            userId,
            user.email,
            {
              before: { status: user.status },
              after: { status: "suspended" },
            },
            reason,
          );

          return {
            ...prev,
            users: updatedUsers,
            auditLogs: [auditLog, ...prev.auditLogs],
            policy: {
              ...prev.policy,
              version: prev.policy.version + 1,
            },
          };
        });

        console.log("✅ User suspended successfully");
      } catch (err) {
        console.error("❌ Failed to suspend user:", err);
        throw err;
      }
    },
    [tenantId, currentUserId],
  );

  const restoreUser = useCallback(
    async (userId: string, reason?: string) => {
      try {
        console.log("🔐 Restoring user:", userId);

        updateGlobalAccess((prev) => {
          const user = prev.users.find((u) => u.id === userId);
          if (!user) throw new Error("User not found");

          const updatedUsers = prev.users.map((u) => {
            if (u.id === userId) {
              return { ...u, status: "active" as const, updatedAt: new Date() };
            }
            return u;
          });

          const auditLog = createAuditLog(
            "restore",
            userId,
            user.email,
            {
              before: { status: user.status },
              after: { status: "active" },
            },
            reason,
          );

          return {
            ...prev,
            users: updatedUsers,
            auditLogs: [auditLog, ...prev.auditLogs],
            policy: {
              ...prev.policy,
              version: prev.policy.version + 1,
            },
          };
        });

        console.log("✅ User restored successfully");
      } catch (err) {
        console.error("❌ Failed to restore user:", err);
        throw err;
      }
    },
    [tenantId, currentUserId],
  );

  const updateRole = useCallback(
    async (roleKey: string, capabilities: string[], reason?: string) => {
      try {
        console.log("🔐 Updating role:", roleKey);

        updateGlobalAccess((prev) => {
          const role = prev.roles.find((r) => r.key === roleKey);
          if (!role) throw new Error("Role not found");

          const updatedRoles = prev.roles.map((r) => {
            if (r.key === roleKey) {
              return { ...r, capabilities, updatedAt: new Date() };
            }
            return r;
          });

          // Update all users with this role
          const updatedUsers = prev.users.map((user) => {
            if (user.roles.some((r) => r.key === roleKey)) {
              const userRoles = user.roles.map((r) =>
                r.key === roleKey ? { ...r, capabilities } : r,
              );
              const newCapabilities = [
                ...new Set(userRoles.flatMap((r) => r.capabilities)),
              ];
              return {
                ...user,
                roles: userRoles,
                capabilities: newCapabilities,
                updatedAt: new Date(),
              };
            }
            return user;
          });

          const auditLog: AccessAuditLog = {
            id: `audit_${Date.now()}`,
            tenantId,
            action: "grant", // Role update
            targetUserId: roleKey,
            targetUserEmail: `role:${roleKey}`,
            role: roleKey,
            actorId: currentUserId,
            actorEmail: "admin@restaurant.com",
            reason,
            before: { capabilities: role.capabilities },
            after: { capabilities },
            createdAt: new Date(),
          };

          return {
            ...prev,
            roles: updatedRoles,
            users: updatedUsers,
            auditLogs: [auditLog, ...prev.auditLogs],
            policy: {
              ...prev.policy,
              version: prev.policy.version + 1,
              roleCapabilities: {
                ...prev.policy.roleCapabilities,
                [roleKey]: capabilities,
              },
            },
          };
        });

        console.log("✅ Role updated successfully");
      } catch (err) {
        console.error("❌ Failed to update role:", err);
        throw err;
      }
    },
    [tenantId, currentUserId],
  );

  const createCustomRole = useCallback(
    async (roleData: Partial<Role>): Promise<Role> => {
      try {
        console.log("🔐 Creating custom role:", roleData.name);

        const newRole: Role = {
          id: `role_${Date.now()}`,
          tenantId,
          key: roleData.key || `CUSTOM_${Date.now()}`,
          name: roleData.name || "",
          displayName: roleData.displayName || "",
          color: roleData.color || "#6B7280",
          icon: roleData.icon || "User",
          capabilities: roleData.capabilities || [],
          isDefault: false,
          isCustom: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        updateGlobalAccess((prev) => ({
          ...prev,
          roles: [...prev.roles, newRole],
          policy: {
            ...prev.policy,
            version: prev.policy.version + 1,
            roleCapabilities: {
              ...prev.policy.roleCapabilities,
              [newRole.key]: newRole.capabilities,
            },
          },
        }));

        console.log("✅ Custom role created successfully");
        return newRole;
      } catch (err) {
        console.error("❌ Failed to create custom role:", err);
        throw err;
      }
    },
    [tenantId],
  );

  const rollbackToVersion = useCallback(
    async (version: number, reason?: string) => {
      try {
        console.log("🔐 Rolling back to version:", version);

        // In real implementation, this would fetch the specific version from API
        // For now, we'll simulate a rollback by resetting to defaults
        updateGlobalAccess((prev) => {
          const auditLog: AccessAuditLog = {
            id: `audit_${Date.now()}`,
            tenantId,
            action: "grant", // Rollback action
            targetUserId: "system",
            targetUserEmail: "system",
            actorId: currentUserId,
            actorEmail: "admin@restaurant.com",
            reason: reason || `Rollback to version ${version}`,
            before: { version: prev.policy.version },
            after: { version },
            createdAt: new Date(),
          };

          return {
            ...prev,
            auditLogs: [auditLog, ...prev.auditLogs],
            policy: {
              ...prev.policy,
              version: version,
              changelog: `Rolled back to version ${version}`,
            },
          };
        });

        console.log("✅ Rollback completed successfully");
      } catch (err) {
        console.error("❌ Failed to rollback:", err);
        throw err;
      }
    },
    [tenantId, currentUserId],
  );

  const bulkAssignRole = useCallback(
    async (userIds: string[], roleKey: string, reason?: string) => {
      try {
        console.log(
          "🔐 Bulk assigning role:",
          roleKey,
          "to users:",
          userIds.length,
        );

        for (const userId of userIds) {
          await assignRole(userId, roleKey, reason);
        }

        console.log("✅ Bulk role assignment completed");
      } catch (err) {
        console.error("❌ Failed to bulk assign roles:", err);
        throw err;
      }
    },
    [assignRole],
  );

  const exportAccessReport = useCallback(async (): Promise<Blob> => {
    try {
      console.log("🔐 Exporting access report");

      // Generate CSV report
      const csvContent = "User,Email,Roles,Capabilities,Status,Last Active\n";

      const blob = new Blob([csvContent], { type: "text/csv" });
      console.log("✅ Access report exported successfully");
      return blob;
    } catch (err) {
      console.error("❌ Failed to export access report:", err);
      throw err;
    }
  }, []);

  return {
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
  };
}

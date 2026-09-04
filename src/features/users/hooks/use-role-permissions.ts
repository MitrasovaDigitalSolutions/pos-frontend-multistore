"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
    useAssignPermissionToRole,
    usePermissionsList,
    useRevokePermissionFromRole,
    useRolesList,
} from "../api/roles-permissions-api";
import {
    PERMISSION_CATEGORIES,
    PERMISSION_METADATA,
    ROLE_METADATA,
} from "../constants/role-permission-constants";
import type { Permission, RoleWithPermissions } from "../types";
import type {
    PermissionCategoryType,
    RoleWithStats,
} from "../components/role-permission-types";

export function useRolePermissions() {
    const {
        data: roles,
        isLoading: rolesLoading,
        isError: rolesError,
        refetch: refetchRoles,
    } = useRolesList();

    const {
        data: permissions,
        isLoading: permissionsLoading,
        isError: permissionsError,
        refetch: refetchPermissions,
    } = usePermissionsList();

    const assignMutation = useAssignPermissionToRole();
    const revokeMutation = useRevokePermissionFromRole();

    const [selectedRoleName, setSelectedRoleName] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
    const [onlyAssigned, setOnlyAssigned] = useState(false);
    const [pendingToggles, setPendingToggles] = useState<Record<string, boolean>>({});
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
    const [bulkLoadingCategories, setBulkLoadingCategories] = useState<Record<string, boolean>>({});

    const totalPermissionsCount = permissions?.length || 0;

    // Roles with calculated statistics
    const rolesWithStats: RoleWithStats[] = useMemo(() => {
        if (!roles) return [];
        return roles.map((role) => {
            const assigned = role.permissions.length;
            const total = totalPermissionsCount || 41;
            const percentage = total > 0 ? Math.round((assigned / total) * 100) : 0;
            return {
                ...role,
                stats: {
                    total,
                    assigned,
                    percentage,
                },
            };
        });
    }, [roles, totalPermissionsCount]);

    // Active selected role: fallback to first role if not set or invalid
    const activeRoleName = useMemo(() => {
        if (roles && roles.length > 0) {
            if (selectedRoleName && roles.some((r) => r.name === selectedRoleName)) {
                return selectedRoleName;
            }
            return roles[0].name;
        }
        return null;
    }, [roles, selectedRoleName]);

    const selectedRole = useMemo<RoleWithPermissions | undefined>(() => {
        return roles?.find((r) => r.name === activeRoleName);
    }, [roles, activeRoleName]);

    const selectedRoleStats = useMemo(() => {
        const assigned = selectedRole?.permissions.length || 0;
        const total = totalPermissionsCount || 41;
        const percentage = total > 0 ? Math.round((assigned / total) * 100) : 0;
        return { assigned, total, percentage };
    }, [selectedRole, totalPermissionsCount]);

    // Build categories structure from fetched permissions
    const categoriesWithPermissions: PermissionCategoryType[] = useMemo(() => {
        if (!permissions) return [];

        const mappedPermissionNames = new Set(
            PERMISSION_CATEGORIES.flatMap((c) => c.permissions)
        );
        const unmapped = permissions.filter((p) => !mappedPermissionNames.has(p.name));

        const baseCategories: PermissionCategoryType[] = PERMISSION_CATEGORIES.map((cat) => ({
            ...cat,
            items: permissions.filter((p) => cat.permissions.includes(p.name)),
        }));

        if (unmapped.length > 0) {
            baseCategories.push({
                id: "other",
                label: "Hak Akses Tambahan",
                shortLabel: "Lainnya",
                desc: "Hak akses sistem tambahan yang belum diklasifikasikan ke modul utama.",
                icon: PERMISSION_CATEGORIES[7].icon,
                colorClass: "text-slate-700 bg-slate-100 border-slate-300 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-800",
                badgeClass: "bg-slate-200 text-slate-800 border-slate-300",
                permissions: unmapped.map((p) => p.name),
                items: unmapped,
            });
        }

        return baseCategories;
    }, [permissions]);

    // Filter categories based on search, category tab, and onlyAssigned switch
    const filteredCategories = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return categoriesWithPermissions
            .filter((cat) => {
                if (selectedCategoryId === "all") return true;
                return cat.id === selectedCategoryId;
            })
            .map((cat) => {
                const filteredItems = cat.items.filter((perm) => {
                    const isAssigned =
                        selectedRole?.permissions.some((p) => p.name === perm.name) || false;

                    if (onlyAssigned && !isAssigned) {
                        return false;
                    }

                    if (!query) return true;

                    const meta = PERMISSION_METADATA[perm.name];
                    const label = (meta?.label || perm.name).toLowerCase();
                    const desc = (meta?.desc || "").toLowerCase();
                    const name = perm.name.toLowerCase();

                    return label.includes(query) || name.includes(query) || desc.includes(query);
                });

                return {
                    ...cat,
                    items: filteredItems,
                };
            })
            .filter((cat) => cat.items.length > 0);
    }, [
        categoriesWithPermissions,
        searchQuery,
        selectedCategoryId,
        onlyAssigned,
        selectedRole,
    ]);

    // Count visible permissions
    const visiblePermissionsCount = useMemo(() => {
        return filteredCategories.reduce((acc, cat) => acc + cat.items.length, 0);
    }, [filteredCategories]);

    // Toggle a single permission
    const handleTogglePermission = async (permissionName: string, isAssigned: boolean) => {
        if (!activeRoleName) return;

        setPendingToggles((prev) => ({ ...prev, [permissionName]: true }));
        const label = PERMISSION_METADATA[permissionName]?.label || permissionName;
        const roleLabel = ROLE_METADATA[activeRoleName]?.label || activeRoleName;

        if (isAssigned) {
            revokeMutation.mutate(
                { role: activeRoleName, permission: permissionName },
                {
                    onSuccess: () => {
                        toast.success(`Akses '${label}' dicabut dari ${roleLabel}.`);
                    },
                    onError: (err) => {
                        toast.error(err.message || "Gagal mencabut hak akses.");
                    },
                    onSettled: () => {
                        setPendingToggles((prev) => ({ ...prev, [permissionName]: false }));
                    },
                }
            );
        } else {
            assignMutation.mutate(
                { role: activeRoleName, permission: permissionName },
                {
                    onSuccess: () => {
                        toast.success(`Akses '${label}' diberikan ke ${roleLabel}.`);
                    },
                    onError: (err) => {
                        toast.error(err.message || "Gagal memberikan hak akses.");
                    },
                    onSettled: () => {
                        setPendingToggles((prev) => ({ ...prev, [permissionName]: false }));
                    },
                }
            );
        }
    };

    // Bulk assign / revoke for all permissions in a category
    const handleBulkCategoryAction = async (
        categoryId: string,
        permissionsInCat: Permission[],
        action: "assign" | "revoke"
    ) => {
        if (!activeRoleName) return;

        setBulkLoadingCategories((prev) => ({ ...prev, [categoryId]: true }));
        const actionText = action === "assign" ? "diberikan" : "dicabut";

        try {
            const targets = permissionsInCat.filter((perm) => {
                const isAssigned =
                    selectedRole?.permissions.some((p) => p.name === perm.name) || false;
                return action === "assign" ? !isAssigned : isAssigned;
            });

            if (targets.length === 0) {
                toast.info(`Semua izin kategori ini sudah dalam kondisi ${actionText}.`);
                return;
            }

            await Promise.all(
                targets.map((perm) => {
                    const params = { role: activeRoleName, permission: perm.name };
                    return action === "assign"
                        ? assignMutation.mutateAsync(params)
                        : revokeMutation.mutateAsync(params);
                })
            );

            toast.success(`Berhasil memperbarui ${targets.length} hak akses pada kategori ini.`);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Gagal melakukan pembaruan massal.";
            toast.error(message);
        } finally {
            setBulkLoadingCategories((prev) => ({ ...prev, [categoryId]: false }));
        }
    };

    // Accordion expand/collapse helpers
    const isCategoryExpanded = (categoryId: string) => {
        // Automatically open if search query is active
        if (searchQuery.trim() !== "") return true;
        return expandedCategories[categoryId] !== false; // open by default
    };

    const toggleCategory = (categoryId: string) => {
        setExpandedCategories((prev) => ({
            ...prev,
            [categoryId]: prev[categoryId] === false ? true : false,
        }));
    };

    const handleExpandAll = () => {
        const next: Record<string, boolean> = {};
        categoriesWithPermissions.forEach((cat) => {
            next[cat.id] = true;
        });
        setExpandedCategories(next);
    };

    const handleCollapseAll = () => {
        const next: Record<string, boolean> = {};
        categoriesWithPermissions.forEach((cat) => {
            next[cat.id] = false;
        });
        setExpandedCategories(next);
    };

    const isLoading = rolesLoading || permissionsLoading;
    const isError = rolesError || permissionsError;
    const isMutating = assignMutation.isPending || revokeMutation.isPending;

    return {
        // Data & State
        roles: rolesWithStats,
        activeRoleName,
        selectedRole,
        selectedRoleStats,
        categories: categoriesWithPermissions,
        filteredCategories,
        totalPermissionsCount,
        visiblePermissionsCount,

        // Filters
        searchQuery,
        setSearchQuery,
        selectedCategoryId,
        setSelectedCategoryId,
        onlyAssigned,
        setOnlyAssigned,

        // Statuses
        isLoading,
        isError,
        isMutating,
        pendingToggles,
        bulkLoadingCategories,

        // Actions
        setSelectedRoleName,
        handleTogglePermission,
        handleBulkCategoryAction,
        isCategoryExpanded,
        toggleCategory,
        handleExpandAll,
        handleCollapseAll,
        refetchRoles,
        refetchPermissions,
    };
}

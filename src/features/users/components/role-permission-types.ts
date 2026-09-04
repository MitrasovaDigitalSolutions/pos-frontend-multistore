import type { Permission, RoleWithPermissions } from "../types";

export type PermissionActionType = "view" | "manage" | "auth";

export interface PermissionMeta {
    label: string;
    desc: string;
    actionType: PermissionActionType;
    categoryId: string;
}

export interface RoleMeta {
    label: string;
    desc: string;
    colorClass: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
}

export interface StaticPermissionCategory {
    id: string;
    label: string;
    shortLabel: string;
    desc: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    colorClass: string;
    badgeClass: string;
    permissions: string[];
}

export interface PermissionCategoryType extends StaticPermissionCategory {
    items: Permission[];
}

export interface RolePermissionStats {
    total: number;
    assigned: number;
    percentage: number;
}

export interface RoleWithStats extends RoleWithPermissions {
    stats: RolePermissionStats;
}

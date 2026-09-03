import type { User as CoreUser } from "@/types/auth";

export type User = CoreUser;

export interface Permission {
    id: string | number;
    name: string;
    guard_name: string;
    created_at?: string;
    updated_at?: string;
}

export interface RoleWithPermissions {
    id: string | number;
    name: string;
    guard_name: string;
    permissions: Permission[];
    created_at?: string;
    updated_at?: string;
}

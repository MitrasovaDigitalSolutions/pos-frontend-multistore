import type { User as CoreUser } from "@/types/auth";

export type User = CoreUser;

export interface Permission {
    id: number;
    name: string;
    guard_name: string;
}

export interface RoleWithPermissions {
    id: number;
    name: string;
    guard_name: string;
    permissions: Permission[];
}

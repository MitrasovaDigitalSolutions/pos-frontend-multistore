import type { User as CoreUser } from "@/types/auth";

export type User = CoreUser;

export interface Permission {
    uid: string;
    name: string;
    guard_name: string;
}

export interface RoleWithPermissions {
    uid: string;
    name: string;
    guard_name: string;
    permissions: Permission[];
}

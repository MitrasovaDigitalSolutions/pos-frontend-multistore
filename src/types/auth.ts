import type { Role, Permission } from "@/constants/roles";
import "next-auth";
import "next-auth/jwt";

// ─── User Types ─────────────────────────────────────────────────────────────

export interface Store {
    uid: string;
    nama: string;
    alamat: string | null;
    telepon: string | null;
    is_active: boolean;
    is_central?: boolean;
    users_count?: number;
}

export interface User {
    uid: string;
    name: string;
    username: string;
    email: string | null;
    store_uid: string | null;
    stores?: Store[];
    status: "active" | "inactive";
    roles: Role[];
    permissions: Permission[];
}

// ─── Auth Response from Laravel Backend ─────────────────────────────────────

export interface LoginResponse {
    status?: string;
    message?: string;
    data: {
        access_token: string;
        token_type: string;
        user: User;
    };
}

export interface MeResponse {
    status?: string;
    data: {
        user: User;
    };
}

// ─── NextAuth Extended Types ────────────────────────────────────────────────

declare module "next-auth" {
    interface Session {
        user: User;
        accessToken: string;
        cashDrawerSessionId?: string | null;
        error?: "RefreshTokenError";
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        user: User;
        accessToken: string;
        accessTokenExpires: number;
        cashDrawerSessionId?: number | null;
        error?: "RefreshTokenError";
    }
}

import type { Role, Permission } from "@/constants/roles";
import "next-auth";
import "next-auth/jwt";

// ─── User Types ─────────────────────────────────────────────────────────────

export interface User {
    uid: string;
    name: string;
    username: string;
    email: string | null;
    store_uid: string | null;
    status: "active" | "inactive";
    roles: Role[];
    permissions: Permission[];
}

// ─── Auth Response from Laravel Backend ─────────────────────────────────────

export interface LoginResponse {
    access_token: string;
    token_type: string;
    user: User;
    message?: string;
}

export interface MeResponse {
    user: User;
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

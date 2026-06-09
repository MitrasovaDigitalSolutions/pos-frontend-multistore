// ─── Application Routes ─────────────────────────────────────────────────────

export const ROUTES = {
    // Public
    LOGIN: "/login",

    // Protected - Admin
    ADMIN: "/admin",
    ADMIN_PRODUCTS: "/admin/products",
    ADMIN_CASH_DRAWER: "/admin/cash-drawer",
    ADMIN_STOCK: "/admin/stock",
    ADMIN_SUPPLIERS: "/admin/suppliers",
    ADMIN_CATEGORIES: "/admin/categories",
    ADMIN_BRANDS: "/admin/brands",
    ADMIN_REPORTS: "/admin/reports",
    ADMIN_USERS: "/admin/users",
    ADMIN_SETTINGS: "/admin/settings",
    ADMIN_AUDIT: "/admin/audit",

    // Protected - POS
    CHECKOUT: "/checkout",

    // Error
    UNAUTHORIZED: "/unauthorized",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

// ─── Public Routes (no auth required) ───────────────────────────────────────

export const PUBLIC_ROUTES: string[] = [ROUTES.LOGIN, "/api/auth"];

// ─── Auth Routes (redirect to dashboard if already logged in) ───────────────

export const AUTH_ROUTES: string[] = [ROUTES.LOGIN];

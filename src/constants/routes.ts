// ─── Application Routes ─────────────────────────────────────────────────────

export const ROUTES = {
    // Public
    LOGIN: "/login",

    // Protected - Admin
    ADMIN: "/admin",
    ADMIN_PRODUCTS: "/admin/products",
    ADMIN_CASH_DRAWER: "/admin/cash-drawer",
    ADMIN_CASH_ACCOUNTS: "/admin/cash-accounts",
    ADMIN_STOCK: "/admin/stock",
    ADMIN_SUPPLIERS: "/admin/suppliers",
    ADMIN_CATEGORIES: "/admin/categories",
    ADMIN_BRANDS: "/admin/brands",
    ADMIN_MEMBERS: "/admin/members",
    ADMIN_EXPENSES: "/admin/expenses",
    ADMIN_EXPENSE_CATEGORIES: "/admin/expenses/categories",
    ADMIN_REPORTS: "/admin/reports",
    ADMIN_USERS: "/admin/users",
    ADMIN_SETTINGS: "/admin/settings",
    ADMIN_AUDIT: "/admin/audit",
    ADMIN_TRANSACTIONS: "/admin/transactions",
    ADMIN_PURCHASE_ORDER: "/admin/purchase/order",
    ADMIN_PURCHASE_RECEIVING: "/admin/purchase/receiving",
    ADMIN_PURCHASE_PAYMENT: "/admin/purchase/payment",
    ADMIN_PURCHASE_RETURN: "/admin/purchase/return",

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

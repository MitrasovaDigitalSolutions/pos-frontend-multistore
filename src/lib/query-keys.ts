// ─── React Query Key Factory ────────────────────────────────────────────────
// Centralized query keys for cache management and invalidation.

export const queryKeys = {
    // Products
    products: {
        all: ["products"] as const,
        list: () => [...queryKeys.products.all, "list"] as const,
        detail: (id: number) =>
            [...queryKeys.products.all, "detail", id] as const,
    },

    // Users
    users: {
        all: ["users"] as const,
        list: () => [...queryKeys.users.all, "list"] as const,
    },

    // Roles & Permissions
    roles: {
        all: ["roles"] as const,
        list: () => [...queryKeys.roles.all, "list"] as const,
    },

    permissions: {
        all: ["permissions"] as const,
        list: () => [...queryKeys.permissions.all, "list"] as const,
    },

    // Dashboard / Reports
    dashboard: {
        all: ["dashboard"] as const,
        summary: () => [...queryKeys.dashboard.all, "summary"] as const,
    },

    reports: {
        all: ["reports"] as const,
        daily: (date: string) =>
            [...queryKeys.reports.all, "daily", date] as const,
    },

    // Inventory
    inventory: {
        all: ["inventory"] as const,
        movements: () => [...queryKeys.inventory.all, "movements"] as const,
        receivings: () => [...queryKeys.inventory.all, "receivings"] as const,
        opnames: () => [...queryKeys.inventory.all, "opnames"] as const,
        opnameDetail: (id: number) =>
            [...queryKeys.inventory.all, "opname", id] as const,
        suppliers: () => [...queryKeys.inventory.all, "suppliers"] as const,
    },

    // Transactions (checkout)
    transactions: {
        all: ["transactions"] as const,
        onHold: () => [...queryKeys.transactions.all, "on-hold"] as const,
        detail: (id: number) =>
            [...queryKeys.transactions.all, "detail", id] as const,
    },

    // Activity Logs
    activityLogs: {
        all: ["activity-logs"] as const,
        list: () => [...queryKeys.activityLogs.all, "list"] as const,
    },
} as const;

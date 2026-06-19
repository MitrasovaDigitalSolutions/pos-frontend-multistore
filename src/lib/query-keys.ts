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

    // Suppliers
    suppliers: {
        all: ["suppliers"] as const,
    },

    // Categories
    categories: {
        all: ["categories"] as const,
    },

    // Brands
    brands: {
        all: ["brands"] as const,
    },

    // Inventory
    inventory: {
        all: ["inventory"] as const,
        movements: () => [...queryKeys.inventory.all, "movements"] as const,
        receivings: () => [...queryKeys.inventory.all, "receivings"] as const,
        opnames: () => [...queryKeys.inventory.all, "opnames"] as const,
        opnameDetail: (id: number) =>
            [...queryKeys.inventory.all, "opname", id] as const,
    },

    // Purchase
    purchase: {
        all: ["purchase"] as const,
        receivings: () => [...queryKeys.purchase.all, "receivings"] as const,
        receivingDetail: (id: number) =>
            [...queryKeys.purchase.all, "receiving", id] as const,
        orders: () => [...queryKeys.purchase.all, "orders"] as const,
        orderDetail: (id: number) =>
            [...queryKeys.purchase.all, "order", id] as const,
        orderItems: (id: number) =>
            [...queryKeys.purchase.all, "order", id, "items"] as const,
        outstanding: () =>
            [...queryKeys.purchase.all, "orders", "outstanding"] as const,
        orderReceivings: (id: number) =>
            [...queryKeys.purchase.all, "order", id, "receivings"] as const,
        payments: () => [...queryKeys.purchase.all, "payments"] as const,
        paymentDetail: (id: number) =>
            [...queryKeys.purchase.all, "payment", id] as const,
        returns: () => [...queryKeys.purchase.all, "returns"] as const,
        returnDetail: (id: number) =>
            [...queryKeys.purchase.all, "return", id] as const,
    },

    cashAccounts: {
        all: ["cash-accounts"] as const,
    },

    // Transactions (checkout)
    transactions: {
        all: ["transactions"] as const,
        onHold: () => [...queryKeys.transactions.all, "on-hold"] as const,
        detail: (id: number | string) =>
            [...queryKeys.transactions.all, "detail", id] as const,
    },

    // Activity Logs
    activityLogs: {
        all: ["activity-logs"] as const,
        list: () => [...queryKeys.activityLogs.all, "list"] as const,
    },

    // Members
    members: {
        all: ["members"] as const,
        list: () => [...queryKeys.members.all, "list"] as const,
    },
} as const;

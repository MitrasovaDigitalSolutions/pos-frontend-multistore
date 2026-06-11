// ─── API Endpoints ──────────────────────────────────────────────────────────
// All endpoints are relative to the API proxy base URL.

export const ENDPOINTS = {
    // Auth
    AUTH: {
        LOGIN: "/v1/auth/login",
        LOGOUT: "/v1/auth/logout",
        ME: "/v1/auth/me",
    },

    // Products
    PRODUCTS: {
        LIST: "/v1/products",
        DETAIL: (id: number) => `/v1/products/${id}`,
        CREATE: "/v1/products",
        UPDATE: (id: number) => `/v1/products/${id}`,
        DELETE: (id: number) => `/v1/products/${id}`,
        STATUS: (id: number) => `/v1/products/${id}/status`,
        BARCODE: (barcode: string) =>
            `/v1/products/barcode/${encodeURIComponent(barcode)}`,
    },

    // Users
    USERS: {
        LIST: "/v1/users",
        CREATE: "/v1/users",
        UPDATE: (id: number) => `/v1/users/${id}`,
        DELETE: (id: number) => `/v1/users/${id}`,
    },

    // Activity Logs
    ACTIVITY_LOGS: "/v1/activity-logs",

    // Cash Accounts
    CASH_ACCOUNTS: "/v1/cash-accounts",

    // Inventory
    INVENTORY: {
        MOVEMENTS: "/v1/inventory/movements",
        ADJUSTMENT: "/v1/inventory/adjustment",
        RECEIVING: {
            LIST: "/v1/inventory/receiving",
            CREATE: "/v1/inventory/receiving",
            DETAIL: (id: number) => `/v1/inventory/receiving/${id}`,
            UPDATE: (id: number) => `/v1/inventory/receiving/${id}`,
            DELETE: (id: number) => `/v1/inventory/receiving/${id}`,
            PAYMENT_STATUS: (id: number) => `/v1/inventory/receiving/${id}/payment-status`,
        },
        OPNAME: {
            LIST: "/v1/inventory/opname",
            CREATE: "/v1/inventory/opname",
            DETAIL: (id: number) => `/v1/inventory/opname/${id}`,
            UPDATE: (id: number) => `/v1/inventory/opname/${id}`,
            DELETE: (id: number) => `/v1/inventory/opname/${id}`,
        },
        SUPPLIERS: {
            LIST: "/v1/inventory/suppliers",
            ALL: "/v1/inventory/suppliers/all",
            CREATE: "/v1/inventory/suppliers",
            UPDATE: (id: number) => `/v1/inventory/suppliers/${id}`,
            DELETE: (id: number) => `/v1/inventory/suppliers/${id}`,
        },
    },

    // Purchase
    PURCHASE: {
        RECEIVING: {
            LIST: "/v1/purchase/receiving",
            CREATE: "/v1/purchase/receiving",
            DETAIL: (id: number) => `/v1/purchase/receiving/${id}`,
            UPDATE: (id: number) => `/v1/purchase/receiving/${id}`,
            DELETE: (id: number) => `/v1/purchase/receiving/${id}`,
            PAYMENT_STATUS: (id: number) => `/v1/purchase/receiving/${id}/payment-status`,
            COMPARE_PRICES: "/v1/purchase/receiving/compare-prices",
        },
        ORDER: {
            LIST: "/v1/purchase/order",
            CREATE: "/v1/purchase/order",
            DETAIL: (id: number) => `/v1/purchase/order/${id}`,
            UPDATE: (id: number) => `/v1/purchase/order/${id}`,
            DELETE: (id: number) => `/v1/purchase/order/${id}`,
            FINALIZE: (id: number) => `/v1/purchase/order/${id}/finalize`,
            CANCEL: (id: number) => `/v1/purchase/order/${id}/cancel`,
        },
        PAYMENT: {
            LIST: "/v1/purchase/payment",
            CREATE: "/v1/purchase/payment",
            DETAIL: (id: number) => `/v1/purchase/payment/${id}`,
            UPDATE: (id: number) => `/v1/purchase/payment/${id}`,
            DELETE: (id: number) => `/v1/purchase/payment/${id}`,
        },
        RETURN: {
            LIST: "/v1/purchase/return",
            CREATE: "/v1/purchase/return",
            DETAIL: (id: number) => `/v1/purchase/return/${id}`,
            UPDATE: (id: number) => `/v1/purchase/return/${id}`,
            DELETE: (id: number) => `/v1/purchase/return/${id}`,
            FINALIZE: (id: number) => `/v1/purchase/return/${id}/finalize`,
        },
    },

    // Reports
    REPORTS: {
        SUMMARY: "/v1/reports/summary",
        DAILY: (date: string) => `/v1/reports/sales/daily?date=${date}`,
    },

    // Transactions (Checkout)
    TRANSACTIONS: {
        CREATE: "/v1/transactions",
        DETAIL: (id: number) => `/v1/transactions/${id}`,
        ON_HOLD: "/v1/transactions/on-hold",
        ITEMS: {
            ADD: (trxId: number) => `/v1/transactions/${trxId}/items`,
            UPDATE: (trxId: number, itemId: number) =>
                `/v1/transactions/${trxId}/items/${itemId}`,
            DELETE: (trxId: number, itemId: number) =>
                `/v1/transactions/${trxId}/items/${itemId}`,
        },
        HOLD: (trxId: number) => `/v1/transactions/${trxId}/hold`,
        RECALL: (trxId: number) => `/v1/transactions/${trxId}/recall`,
        PAY: {
            CASH: (trxId: number) => `/v1/transactions/${trxId}/pay/cash`,
            CARD: (trxId: number) => `/v1/transactions/${trxId}/pay/card`,
        },
    },
} as const;

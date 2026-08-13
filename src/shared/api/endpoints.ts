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
        DETAIL: (uid: string) => `/v1/products/${uid}`,
        CREATE: "/v1/products",
        UPDATE: (uid: string) => `/v1/products/${uid}`,
        DELETE: (uid: string) => `/v1/products/${uid}`,
        STATUS: (uid: string) => `/v1/products/${uid}/status`,
        BARCODE: (barcode: string) =>
            `/v1/products/barcode/${encodeURIComponent(barcode)}`,
    },

    // Users
    USERS: {
        LIST: "/v1/users",
        CREATE: "/v1/users",
        UPDATE: (uid: string) => `/v1/users/${uid}`,
        DELETE: (uid: string) => `/v1/users/${uid}`,
    },

    // Activity Logs
    ACTIVITY_LOGS: "/v1/activity-logs",

    // Cash Accounts
    CASH_ACCOUNTS: "/v1/cash-accounts",
    CASH_FLOW: "/v1/cash-flow",
    ACCOUNT_CASH_FLOW: (uid: string) => `/v1/cash-accounts/${uid}/cashflow`,

    // Inventory
    INVENTORY: {
        STOCK_TRANSFERS: {
            LIST: "/v1/inventory/stock-transfers",
            OUTGOING: "/v1/inventory/stock-transfers/outgoing",
            INCOMING: "/v1/inventory/stock-transfers/incoming",
            VALIDATIONS: "/v1/inventory/stock-transfers/validations",
            DETAIL: (uid: string) => `/v1/inventory/stock-transfers/${uid}`,
            CREATE: "/v1/inventory/stock-transfers",
            UPDATE: (uid: string) => `/v1/inventory/stock-transfers/${uid}`,
            FINALIZE: (uid: string) => `/v1/inventory/stock-transfers/${uid}/finalize`,
            RECEIVE_ITEM: (uid: string, itemUid: string) => `/v1/inventory/stock-transfers/${uid}/items/${itemUid}/receive`,
            VALIDATE_ITEM: (uid: string, itemUid: string) => `/v1/inventory/stock-transfers/${uid}/items/${itemUid}/validate`,
            CANCEL: (uid: string) => `/v1/inventory/stock-transfers/${uid}/cancel`,
            PRINT_SURAT_JALAN: (uid: string) => `/v1/inventory/stock-transfers/${uid}/print-surat-jalan`,
        },
        MOVEMENTS: "/v1/inventory/movements",
        ADJUSTMENT: "/v1/inventory/adjustment",
        RECEIVING: {
            LIST: "/v1/inventory/receiving",
            CREATE: "/v1/inventory/receiving",
            DETAIL: (uid: string) => `/v1/inventory/receiving/${uid}`,
            UPDATE: (uid: string) => `/v1/inventory/receiving/${uid}`,
            DELETE: (uid: string) => `/v1/inventory/receiving/${uid}`,
            PAYMENT_STATUS: (uid: string) => `/v1/inventory/receiving/${uid}/payment-status`,
        },
        OPNAME: {
            LIST: "/v1/inventory/opname",
            CREATE: "/v1/inventory/opname",
            DETAIL: (uid: string) => `/v1/inventory/opname/${uid}`,
            UPDATE: (uid: string) => `/v1/inventory/opname/${uid}`,
            DELETE: (uid: string) => `/v1/inventory/opname/${uid}`,
        },
        SUPPLIERS: {
            LIST: "/v1/inventory/suppliers",
            ALL: "/v1/inventory/suppliers/all",
            CREATE: "/v1/inventory/suppliers",
            UPDATE: (uid: string) => `/v1/inventory/suppliers/${uid}`,
            DELETE: (uid: string) => `/v1/inventory/suppliers/${uid}`,
        },
    },

    // Purchase
    PURCHASE: {
        RECEIVING: {
            LIST: "/v1/purchase/receiving",
            CREATE: "/v1/purchase/receiving",
            DETAIL: (uid: string) => `/v1/purchase/receiving/${uid}`,
            UPDATE: (uid: string) => `/v1/purchase/receiving/${uid}`,
            DELETE: (uid: string) => `/v1/purchase/receiving/${uid}`,
            PAYMENT_STATUS: (uid: string) => `/v1/purchase/receiving/${uid}/payment-status`,
            COMPARE_PRICES: "/v1/purchase/receiving/compare-prices",
            ITEMS_REPLACE: (uid: string) => `/v1/purchase/receiving/${uid}/items`,
            COMPLETE: (uid: string) => `/v1/purchase/receiving/${uid}/complete`,
            SCAN: "/v1/purchase/receiving/scan",
            DEBTS: "/v1/purchase/receiving/debts",
            DEBTS_SUMMARY: "/v1/purchase/receiving/debts/summary",
            BULK: "/v1/purchase/receiving/bulk",
        },
        ORDER: {
            LIST: "/v1/purchase/order",
            CREATE: "/v1/purchase/order",
            DETAIL: (uid: string) => `/v1/purchase/order/${uid}`,
            UPDATE: (uid: string) => `/v1/purchase/order/${uid}`,
            DELETE: (uid: string) => `/v1/purchase/order/${uid}`,
            FINALIZE: (uid: string) => `/v1/purchase/order/${uid}/finalize`,
            CANCEL: (uid: string) => `/v1/purchase/order/${uid}/cancel`,
            ITEMS_BULK: (uid: string) => `/v1/purchase/order/${uid}/items`,
            ITEMS_REPLACE: (uid: string) => `/v1/purchase/order/${uid}/items`,
            OUTSTANDING: "/v1/purchase/order/outstanding",
            RECEIVINGS: (uid: string) => `/v1/purchase/order/${uid}/receivings`,
            BULK: "/v1/purchase/order/bulk",
        },
        PAYMENT: {
            LIST: "/v1/purchase/payment",
            CREATE: "/v1/purchase/payment",
            BULK: "/v1/purchase/payment/bulk",
            DETAIL: (uid: string) => `/v1/purchase/payment/${uid}`,
            UPDATE: (uid: string) => `/v1/purchase/payment/${uid}`,
            DELETE: (uid: string) => `/v1/purchase/payment/${uid}`,
            SUMMARY: (receivingUid: string) => `/v1/purchase/payment/summary?receiving_uid=${receivingUid}`,
            OUTSTANDING_RECEIVINGS: "/v1/purchase/receiving?status=completed&status_pembayaran=unpauid,pending,partial",
        },
        RETURN: {
            LIST: "/v1/purchase/return",
            CREATE: "/v1/purchase/return",
            DETAIL: (uid: string) => `/v1/purchase/return/${uid}`,
            UPDATE: (uid: string) => `/v1/purchase/return/${uid}`,
            DELETE: (uid: string) => `/v1/purchase/return/${uid}`,
            FINALIZE: (uid: string) => `/v1/purchase/return/${uid}/finalize`,
            ITEMS_BULK: (uid: string) => `/v1/purchase/return/${uid}/items`,
            ITEMS_REPLACE: (uid: string) => `/v1/purchase/return/${uid}/items`,
            RETURNABLE_ITEMS: (receivingUid: string) => `/v1/purchase/receiving/${receivingUid}/returnable-items`,
            SCAN: "/v1/purchase/return/scan",
            BULK: "/v1/purchase/return/bulk",
        },
    },

    // Reports
    REPORTS: {
        SUMMARY: "/v1/reports/summary",
        DAILY: (date: string) => `/v1/reports/sales/daily?date=${date}`,
        JASA_VS_PRODUCT: "/v1/reports/sales/jasa-vs-product",
        CENTRAL: {
            OVERVIEW: "/v1/reports/central/overview",
            STORES: "/v1/reports/central/stores",
            PRINT_STORES: "/v1/reports/central/print/stores",
            PRINT_PRODUCTS: "/v1/reports/central/print/products",
            SALES_TREND: "/v1/reports/central/sales-trend",
            INVENTORY: "/v1/reports/central/inventory",
        },
    },

    // Chart of Accounts (COA)
    CHART_OF_ACCOUNTS: {
        LIST: "/v1/chart-of-accounts",
        FLAT: "/v1/chart-of-accounts/flat",
        BY_TYPE: (type: string) => `/v1/chart-of-accounts/type/${type}`,
        DETAIL: (uid: string) => `/v1/chart-of-accounts/${uid}`,
        CREATE: "/v1/chart-of-accounts",
        UPDATE: (uid: string) => `/v1/chart-of-accounts/${uid}`,
        DELETE: (uid: string) => `/v1/chart-of-accounts/${uid}`,
    },

    // Manual Journals
    MANUAL_JOURNALS: {
        LIST: "/v1/manual-journals",
        DETAIL: (uid: string) => `/v1/manual-journals/${uid}`,
        CREATE: "/v1/manual-journals",
        UPDATE: (uid: string) => `/v1/manual-journals/${uid}`,
        DELETE: (uid: string) => `/v1/manual-journals/${uid}`,
    },

    // COA Mappings (operational transaction → Chart of Account)
    COA_MAPPINGS: {
        LIST: "/v1/coa-mappings",
        UPDATE: "/v1/coa-mappings",
    },

    // Ledger (admin backfill / rebuild actions)
    LEDGER: {
        BACKFILL: "/v1/ledger/backfill",
        BACKFILL_STATUS: "/v1/ledger/backfill/status",
        BALANCE_ENTRY: "/v1/reports/general-ledger/balance-entry",
    },

    // Parent Categories (Accounting Category Mapping)
    PARENT_CATEGORIES: {
        LIST: "/v1/parent-categories",
        DETAIL: (uid: string) => `/v1/parent-categories/${uid}`,
        CREATE: "/v1/parent-categories",
        UPDATE: (uid: string) => `/v1/parent-categories/${uid}`,
        DELETE: (uid: string) => `/v1/parent-categories/${uid}`,
        ASSIGN: (uid: string) => `/v1/parent-categories/${uid}/assign`,
    },

    // Transactions (Checkout)
    TRANSACTIONS: {
        CREATE: "/v1/transactions",
        DETAIL: (uid: string) => `/v1/transactions/${uid}`,
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

    // Supplier Sales (katalog) + Request Transfer (permintaan stok antar cabang)
    SUPPLIER_SALES: {
        LIST: "/v1/supplier-sales",
        ALL: "/v1/supplier-sales/all",
        DETAIL: (uid: string) => `/v1/supplier-sales/${uid}`,
        CREATE: "/v1/supplier-sales",
        UPDATE: (uid: string) => `/v1/supplier-sales/${uid}`,
        DELETE: (uid: string) => `/v1/supplier-sales/${uid}`,
        ADD_ITEM: (uid: string) => `/v1/supplier-sales/${uid}/items`,
        UPDATE_ITEM: (uid: string, productUid: string) =>
            `/v1/supplier-sales/${uid}/items/${productUid}`,
        REMOVE_ITEM: (uid: string, productUid: string) =>
            `/v1/supplier-sales/${uid}/items/${productUid}`,
    },
    REQUEST_TRANSFER: {
        LIST: "/v1/request-transfer",
        CREATE: "/v1/request-transfer",
        SUMMARY: (supplierUid: string, supplierSalesUid?: string | null) =>
            `/v1/request-transfer/summary/${supplierUid}/${supplierSalesUid ?? "null"}`,
        REJECT: (supplierUid: string, supplierSalesUid?: string | null) =>
            `/v1/request-transfer/summary/${supplierUid}/${supplierSalesUid ?? "null"}/reject`,
        ORDER: (supplierUid: string, supplierSalesUid?: string | null) =>
            `/v1/request-transfer/summary/${supplierUid}/${supplierSalesUid ?? "null"}/order`,
        SEND: (supplierUid: string, supplierSalesUid?: string | null) =>
            `/v1/request-transfer/summary/${supplierUid}/${supplierSalesUid ?? "null"}/send`,
    },
} as const;

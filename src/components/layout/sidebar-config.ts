import { hasPermission, hasRole } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import {
    IconArrowsLeftRight,
    IconBox,
    IconBuildingBank,
    IconBuildingStore,
    IconBuildingWarehouse,
    IconChartBar,
    IconDatabase,
    IconDeviceLaptop,
    IconHome,
    IconNotebook,
    IconReceipt,
    IconSettings,
    IconShieldLock,
    IconShoppingCart,
    IconUsers,
    IconWallet,
} from "@tabler/icons-react";

export type PermissionChecker = (roles: string[], permissions: string[]) => boolean;

export interface NavItem {
    id?: string;
    label: string;
    path?: string;
    tab?: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    badge?: string | number;
    badgeVariant?: "emerald" | "amber" | "rose" | "blue" | "slate";
    permission?: PermissionChecker;
    children?: NavItem[];
}

export interface SidebarSectionConfig {
    title: string;
    items: NavItem[];
}

export const NAVIGATION_CONFIG: SidebarSectionConfig[] = [
    // ─── 1. Menu Utama (Operasional Harian) ──────────────────────────────────────
    {
        title: "Menu Utama",
        items: [
            {
                label: "Dashboard",
                path: ROUTES.ADMIN,
                icon: IconHome,
                permission: (roles, permissions) =>
                    hasRole(roles, "admin") || hasPermission(roles, permissions, "view_reports"),
            },
            {
                label: "Layar Kasir (POS)",
                path: ROUTES.CHECKOUT,
                icon: IconDeviceLaptop,
                permission: (roles, permissions) =>
                    hasRole(roles, "admin") || hasPermission(roles, permissions, "create_sales"),
            },
        ],
    },

    // ─── 2. Transaksi ────────────────────────────────────────────────────────────
    {
        title: "Transaksi",
        items: [
            {
                label: "Penjualan",
                icon: IconReceipt,
                permission: (roles, permissions) =>
                    hasRole(roles, "admin") ||
                    hasPermission(roles, permissions, "view_cash_drawer") ||
                    hasPermission(roles, permissions, "view_sales") ||
                    hasPermission(roles, permissions, "create_sales") ||
                    hasPermission(roles, permissions, "view_reports"),
                children: [
                    {
                        label: "Sesi Kasir",
                        path: ROUTES.ADMIN_CASH_DRAWER,
                        permission: (roles, permissions) =>
                            hasRole(roles, "admin") || hasPermission(roles, permissions, "view_cash_drawer"),
                    },
                    {
                        label: "Daftar Transaksi",
                        path: ROUTES.ADMIN_TRANSACTIONS,
                        permission: (roles, permissions) =>
                            hasRole(roles, "admin") ||
                            hasPermission(roles, permissions, "view_sales") ||
                            hasPermission(roles, permissions, "create_sales"),
                    },
                ],
            },
            {
                label: "Pembelian",
                icon: IconShoppingCart,
                permission: (roles, permissions) =>
                    hasRole(roles, "admin") ||
                    hasPermission(roles, permissions, "view_purchase") ||
                    hasPermission(roles, permissions, "manage_purchase"),
                children: [
                    {
                        label: "Pemesanan",
                        path: ROUTES.ADMIN_PURCHASE_ORDER,
                        permission: (roles, permissions) =>
                            hasRole(roles, "admin") ||
                            hasPermission(roles, permissions, "view_purchase") ||
                            hasPermission(roles, permissions, "manage_purchase"),
                    },
                    {
                        label: "Penerimaan Barang",
                        path: ROUTES.ADMIN_PURCHASE_RECEIVING,
                        permission: (roles, permissions) =>
                            hasRole(roles, "admin") ||
                            hasPermission(roles, permissions, "view_purchase") ||
                            hasPermission(roles, permissions, "manage_purchase"),
                    },
                    {
                        label: "Pembayaran",
                        path: ROUTES.ADMIN_PURCHASE_PAYMENT,
                        permission: (roles, permissions) =>
                            hasRole(roles, "admin") ||
                            hasPermission(roles, permissions, "view_purchase") ||
                            hasPermission(roles, permissions, "manage_purchase"),
                    },
                    {
                        label: "Retur Pembelian",
                        path: ROUTES.ADMIN_PURCHASE_RETURN,
                        permission: (roles, permissions) =>
                            hasRole(roles, "admin") ||
                            hasPermission(roles, permissions, "view_purchase") ||
                            hasPermission(roles, permissions, "manage_purchase"),
                    },
                ],
            },
            {
                label: "Konsinyasi",
                icon: IconBuildingWarehouse,
                permission: (roles, permissions) =>
                    hasRole(roles, "admin") ||
                    hasPermission(roles, permissions, "view_consignment") ||
                    hasPermission(roles, permissions, "manage_consignment") ||
                    hasPermission(roles, permissions, "view_purchase") ||
                    hasPermission(roles, permissions, "manage_purchase"),
                children: [
                    {
                        label: "Penerimaan Konsinyasi",
                        path: ROUTES.ADMIN_CONSIGNMENT,
                        permission: (roles, permissions) =>
                            hasRole(roles, "admin") ||
                            hasPermission(roles, permissions, "view_consignment") ||
                            hasPermission(roles, permissions, "manage_consignment") ||
                            hasPermission(roles, permissions, "view_purchase") ||
                            hasPermission(roles, permissions, "manage_purchase"),
                    },
                    {
                        label: "Pelunasan & Retur",
                        path: ROUTES.ADMIN_CONSIGNMENT_PAYMENT,
                        permission: (roles, permissions) =>
                            hasRole(roles, "admin") ||
                            hasPermission(roles, permissions, "view_consignment") ||
                            hasPermission(roles, permissions, "manage_consignment") ||
                            hasPermission(roles, permissions, "view_purchase") ||
                            hasPermission(roles, permissions, "manage_purchase"),
                    },
                ],
            },
        ],
    },

    // ─── 3. Inventori ────────────────────────────────────────────────────────────
    {
        title: "Inventori",
        items: [
            {
                label: "Transfer Stok",
                icon: IconArrowsLeftRight,
                permission: (roles, permissions) =>
                    hasRole(roles, "admin") ||
                    hasPermission(roles, permissions, "view_stock_transfers") ||
                    hasPermission(roles, permissions, "manage_stock_transfers"),
                children: [
                    {
                        label: "Request Transfer",
                        path: ROUTES.ADMIN_REQUEST_TRANSFERS,
                        permission: (roles, permissions) =>
                            hasRole(roles, "admin") ||
                            hasPermission(roles, permissions, "view_request_transfers") ||
                            hasPermission(roles, permissions, "manage_request_transfers"),
                    },
                    {
                        label: "Kelola Request Masuk",
                        path: ROUTES.ADMIN_REQUEST_TRANSFERS_INCOMING,
                        permission: (roles, permissions) =>
                            hasRole(roles, "admin") ||
                            hasPermission(roles, permissions, "view_request_transfers") ||
                            hasPermission(roles, permissions, "manage_request_transfers"),
                    },
                    {
                        label: "Transfer Keluar",
                        path: ROUTES.ADMIN_STOCK_TRANSFERS,
                        permission: (roles, permissions) =>
                            hasRole(roles, "admin") ||
                            hasPermission(roles, permissions, "view_stock_transfers") ||
                            hasPermission(roles, permissions, "manage_stock_transfers"),
                    },
                    {
                        label: "Transfer Masuk",
                        path: ROUTES.ADMIN_STOCK_TRANSFERS_INCOMING,
                        permission: (roles, permissions) =>
                            hasRole(roles, "admin") ||
                            hasPermission(roles, permissions, "view_stock_transfers") ||
                            hasPermission(roles, permissions, "manage_stock_transfers"),
                    },
                    {
                        label: "Validasi",
                        path: ROUTES.ADMIN_STOCK_TRANSFERS_VALIDATIONS,
                        permission: (roles, permissions) =>
                            hasRole(roles, "admin") ||
                            hasPermission(roles, permissions, "view_stock_transfers") ||
                            hasPermission(roles, permissions, "manage_stock_transfers"),
                    },
                ],
            },
            {
                label: "Inventori",
                icon: IconBox,
                permission: (roles, permissions) =>
                    hasRole(roles, "admin") ||
                    hasPermission(roles, permissions, "view_inventory") ||
                    hasPermission(roles, permissions, "manage_inventory"),
                children: [
                    {
                        label: "Stok Opname",
                        path: ROUTES.ADMIN_STOCK,
                        permission: (roles, permissions) =>
                            hasRole(roles, "admin") ||
                            hasPermission(roles, permissions, "view_inventory") ||
                            hasPermission(roles, permissions, "manage_inventory"),
                    },
                    {
                        label: "Kartu Stok",
                        path: ROUTES.ADMIN_STOCK_LEDGER,
                        permission: (roles, permissions) =>
                            hasRole(roles, "admin") ||
                            hasPermission(roles, permissions, "view_inventory") ||
                            hasPermission(roles, permissions, "manage_inventory"),
                    },
                    {
                        label: "Produksi Harian",
                        path: ROUTES.ADMIN_PRODUCTION,
                        permission: (roles, permissions) =>
                            hasRole(roles, "admin") ||
                            hasPermission(roles, permissions, "view_production") ||
                            hasPermission(roles, permissions, "manage_production"),
                    },
                ],
            },
        ],
    },

    // ─── 4. Keuangan ─────────────────────────────────────────────────────────────
    {
        title: "Keuangan",
        items: [
            {
                label: "Kas & Bank",
                path: ROUTES.ADMIN_CASH_ACCOUNTS,
                icon: IconWallet,
                permission: (roles, permissions) =>
                    hasRole(roles, "admin") ||
                    hasPermission(roles, permissions, "manage_cash_accounts") ||
                    hasPermission(roles, permissions, "view_cash_drawer"),
            },
            {
                label: "Pengeluaran",
                icon: IconReceipt,
                permission: (roles, permissions) =>
                    hasRole(roles, "admin") ||
                    hasPermission(roles, permissions, "view_expenses") ||
                    hasPermission(roles, permissions, "manage_expenses"),
                children: [
                    {
                        label: "Catatan Pengeluaran",
                        path: ROUTES.ADMIN_EXPENSES,
                        permission: (roles, permissions) =>
                            hasRole(roles, "admin") ||
                            hasPermission(roles, permissions, "view_expenses") ||
                            hasPermission(roles, permissions, "manage_expenses"),
                    },
                    {
                        label: "Kategori Pengeluaran",
                        path: ROUTES.ADMIN_EXPENSE_CATEGORIES,
                        permission: (roles, permissions) =>
                            hasRole(roles, "admin") ||
                            hasPermission(roles, permissions, "view_expenses") ||
                            hasPermission(roles, permissions, "manage_expenses"),
                    },
                ],
            },
            {
                label: "Hutang",
                icon: IconNotebook,
                permission: (roles, permissions) =>
                    hasRole(roles, "admin") ||
                    hasPermission(roles, permissions, "view_members") ||
                    hasPermission(roles, permissions, "view_purchase"),
                children: [
                    {
                        label: "Hutang Sales",
                        path: ROUTES.ADMIN_DEBTS_SALES,
                        permission: (roles, permissions) =>
                            hasRole(roles, "admin") || hasPermission(roles, permissions, "view_purchase"),
                    },
                    {
                        label: "Hutang Member",
                        path: ROUTES.ADMIN_DEBTS_MEMBER,
                        permission: (roles, permissions) =>
                            hasRole(roles, "admin") || hasPermission(roles, permissions, "view_members"),
                    },
                    {
                        label: "Pembayaran Hutang Member",
                        path: ROUTES.ADMIN_DEBTS_MEMBER_PAYMENTS,
                        permission: (roles, permissions) =>
                            hasRole(roles, "admin") || hasPermission(roles, permissions, "view_members"),
                    },
                ],
            },
            {
                label: "Laporan",
                icon: IconChartBar,
                permission: (roles, permissions) =>
                    hasRole(roles, "admin") || hasPermission(roles, permissions, "view_reports"),
                children: [
                    {
                        label: "Laporan Laba Rugi",
                        path: ROUTES.ADMIN_REPORTS_LABARUGI,
                        permission: (roles, permissions) =>
                            hasRole(roles, "admin") || hasPermission(roles, permissions, "view_reports"),
                    },
                    {
                        label: "Laporan Penjualan",
                        path: ROUTES.ADMIN_REPORTS_SALES,
                        permission: (roles, permissions) =>
                            hasRole(roles, "admin") || hasPermission(roles, permissions, "view_reports"),
                    },
                    {
                        label: "Penjualan Per Kategori",
                        path: ROUTES.ADMIN_REPORTS_SALES_BY_CATEGORY,
                        permission: (roles, permissions) =>
                            hasRole(roles, "admin") || hasPermission(roles, permissions, "view_reports"),
                    },
                    {
                        label: "Laporan Pembelian",
                        path: ROUTES.ADMIN_REPORTS_PEMBELIAN,
                        permission: (roles, permissions) =>
                            hasRole(roles, "admin") || hasPermission(roles, permissions, "view_reports"),
                    },
                    {
                        label: "Laporan Pengeluaran",
                        path: ROUTES.ADMIN_REPORTS_PENGELUARAN,
                        permission: (roles, permissions) =>
                            hasRole(roles, "admin") || hasPermission(roles, permissions, "view_reports"),
                    },
                ],
            },
            {
                label: "Akuntansi",
                icon: IconBuildingBank,
                permission: (roles, permissions) =>
                    hasRole(roles, "admin") || hasPermission(roles, permissions, "view_reports"),
                children: [
                    {
                        label: "Jurnal Manual",
                        path: ROUTES.ADMIN_ACCOUNTING_MANUAL_JOURNAL,
                        permission: (roles, permissions) =>
                            hasRole(roles, "admin") ||
                            hasPermission(roles, permissions, "manage_manual_journals") ||
                            hasPermission(roles, permissions, "view_manual_journals") ||
                            hasPermission(roles, permissions, "view_reports"),
                    },
                    {
                        label: "List Jurnal Manual",
                        path: ROUTES.ADMIN_ACCOUNTING_JOURNALS,
                        permission: (roles, permissions) =>
                            hasRole(roles, "admin") ||
                            hasPermission(roles, permissions, "view_manual_journals") ||
                            hasPermission(roles, permissions, "manage_manual_journals") ||
                            hasPermission(roles, permissions, "view_reports"),
                    },
                    {
                        label: "Buku Besar",
                        path: ROUTES.ADMIN_ACCOUNTING_GENERAL_LEDGER,
                        permission: (roles, permissions) =>
                            hasRole(roles, "admin") || hasPermission(roles, permissions, "view_reports"),
                    },
                    {
                        label: "Manajemen Akun",
                        path: ROUTES.ADMIN_ACCOUNTING_COA,
                        permission: (roles, permissions) =>
                            hasRole(roles, "admin") ||
                            hasPermission(roles, permissions, "view_chart_of_accounts") ||
                            hasPermission(roles, permissions, "manage_chart_of_accounts") ||
                            hasPermission(roles, permissions, "view_reports"),
                    },
                    {
                        label: "Neraca",
                        path: ROUTES.ADMIN_ACCOUNTING_BALANCESHEET,
                        permission: (roles, permissions) =>
                            hasRole(roles, "admin") || hasPermission(roles, permissions, "view_reports"),
                    },
                ],
            },
            {
                label: "Aset & Inventaris",
                icon: IconBuildingWarehouse,
                permission: (roles, permissions) =>
                    hasRole(roles, "admin") ||
                    hasPermission(roles, permissions, "view_reports") ||
                    hasPermission(roles, permissions, "manage_settings") ||
                    hasPermission(roles, permissions, "view_assets") ||
                    hasPermission(roles, permissions, "manage_assets"),
                children: [
                    {
                        label: "Daftar Aset",
                        path: ROUTES.ADMIN_ASSETS,
                        permission: (roles, permissions) =>
                            hasRole(roles, "admin") ||
                            hasPermission(roles, permissions, "view_reports") ||
                            hasPermission(roles, permissions, "view_assets"),
                    },
                    {
                        label: "Kategori Aset",
                        path: ROUTES.ADMIN_ASSET_CATEGORIES,
                        permission: (roles, permissions) =>
                            hasRole(roles, "admin") ||
                            hasPermission(roles, permissions, "view_reports") ||
                            hasPermission(roles, permissions, "view_assets"),
                    },
                ],
            },
        ],
    },

    // ─── 5. Data Master & Sistem (Setup & Konfigurasi) ───────────────────────────
    {
        title: "Data Master & Sistem",
        items: [
            {
                label: "Data Master",
                icon: IconDatabase,
                permission: (roles, permissions) =>
                    hasRole(roles, "admin") ||
                    hasPermission(roles, permissions, "view_products") ||
                    hasPermission(roles, permissions, "manage_products") ||
                    hasPermission(roles, permissions, "view_members") ||
                    hasPermission(roles, permissions, "manage_members"),
                children: [
                    {
                        label: "Produk",
                        path: ROUTES.ADMIN_PRODUCTS,
                        permission: (roles, permissions) =>
                            hasRole(roles, "admin") ||
                            hasPermission(roles, permissions, "view_products") ||
                            hasPermission(roles, permissions, "manage_products"),
                    },
                    {
                        label: "Member / Pelanggan",
                        path: ROUTES.ADMIN_MEMBERS,
                        permission: (roles, permissions) =>
                            hasRole(roles, "admin") ||
                            hasPermission(roles, permissions, "view_members") ||
                            hasPermission(roles, permissions, "manage_members"),
                    },
                ],
            },
            {
                label: "Pengaturan Toko",
                path: ROUTES.ADMIN_SETTINGS,
                icon: IconSettings,
                permission: (roles, permissions) =>
                    hasRole(roles, "admin") || hasPermission(roles, permissions, "manage_settings"),
            },
            {
                label: "Kelola Karyawan",
                path: ROUTES.ADMIN_EMPLOYEES,
                icon: IconUsers,
                permission: (roles, permissions) =>
                    hasRole(roles, "admin") ||
                    hasPermission(roles, permissions, "view_users") ||
                    hasPermission(roles, permissions, "manage_users"),
            },
            {
                label: "Log Aktivitas",
                path: ROUTES.ADMIN_AUDIT,
                icon: IconShieldLock,
                permission: (roles, permissions) =>
                    hasRole(roles, "admin") || hasPermission(roles, permissions, "view_audit_logs"),
            },
        ],
    },

    // ─── 6. Khusus Admin ─────────────────────────────────────────────────────────
    {
        title: "Admin",
        items: [
            {
                label: "Laporan Konsolidasi",
                path: ROUTES.ADMIN_REPORTS_CENTRAL,
                icon: IconChartBar,
                permission: (roles) => hasRole(roles, "admin"),
            },
            {
                label: "Kelola Toko",
                path: ROUTES.ADMIN_STORES,
                icon: IconBuildingStore,
                permission: (roles) => hasRole(roles, "admin"),
            },
            {
                label: "Katalog",
                icon: IconBuildingWarehouse,
                permission: (roles) => hasRole(roles, "admin"),
                children: [
                    {
                        label: "Produk",
                        path: ROUTES.ADMIN_PRODUCT_CATALOG,
                        permission: (roles) => hasRole(roles, "admin"),
                    },
                    {
                        label: "Kategori",
                        path: ROUTES.ADMIN_CATEGORIES,
                        permission: (roles) => hasRole(roles, "admin"),
                    },
                    {
                        label: "Brand",
                        path: ROUTES.ADMIN_BRANDS,
                        permission: (roles) => hasRole(roles, "admin"),
                    },
                    {
                        label: "Supplier",
                        path: ROUTES.ADMIN_SUPPLIERS,
                        permission: (roles) => hasRole(roles, "admin"),
                    },
                    {
                        label: "Sales",
                        path: ROUTES.ADMIN_SUPPLIER_SALES,
                        permission: (roles, permissions) =>
                            hasRole(roles, "admin") ||
                            hasPermission(roles, permissions, "view_request_transfers") ||
                            hasPermission(roles, permissions, "manage_request_transfers"),
                    },
                ],
            },
            {
                label: "Kelola User",
                path: ROUTES.ADMIN_USERS,
                icon: IconUsers,
                permission: (roles) => hasRole(roles, "admin"),
            },
        ],
    },
];

// ─── Navigation Helper Functions ─────────────────────────────────────────────

/**
 * Checks if a specific NavItem (link) matches current path and query params.
 */
export function isNavItemActive(
    item: NavItem,
    pathname: string,
    currentTab?: string,
    searchParams?: URLSearchParams | null
): boolean {
    if (!item.path) return false;

    const path = item.path;

    if (item.tab) {
        return pathname === path && currentTab === item.tab;
    }

    if (path === ROUTES.ADMIN_STOCK) {
        return pathname === path && currentTab !== "receiving";
    }

    // Exact matches for root paths
    if (path === "/admin" || path === "/checkout") {
        return pathname === path;
    }

    // Disambiguation for specific overlapping routes
    if (path === ROUTES.ADMIN_ACCOUNTING_COA) {
        return (
            pathname === ROUTES.ADMIN_ACCOUNTING_COA ||
            pathname === ROUTES.ADMIN_ACCOUNTING_COA_MAPPING ||
            pathname === ROUTES.ADMIN_ACCOUNTING_COUNTERPART_MAPPING ||
            pathname === ROUTES.ADMIN_ACCOUNTING_CATEGORY_MAPPING ||
            pathname.startsWith(ROUTES.ADMIN_ACCOUNTING_COA + "/")
        );
    }

    if (
        path === "/admin/expenses" &&
        (pathname === "/admin/expenses/categories" || pathname.startsWith("/admin/expenses/categories/"))
    ) {
        return false;
    }

    if (
        path === ROUTES.ADMIN_ASSETS &&
        (pathname === ROUTES.ADMIN_ASSET_CATEGORIES || pathname.startsWith(ROUTES.ADMIN_ASSET_CATEGORIES + "/"))
    ) {
        return false;
    }

    if (
        path === ROUTES.ADMIN_REPORTS_SALES &&
        (pathname === ROUTES.ADMIN_REPORTS_SALES_BY_CATEGORY || pathname.startsWith(ROUTES.ADMIN_REPORTS_SALES_BY_CATEGORY + "/"))
    ) {
        return false;
    }

    if (
        path === ROUTES.ADMIN_CONSIGNMENT &&
        (pathname === ROUTES.ADMIN_CONSIGNMENT_PAYMENT || pathname.startsWith(ROUTES.ADMIN_CONSIGNMENT_PAYMENT + "/"))
    ) {
        return false;
    }

    const fromParam = searchParams?.get("from");

    if (path === ROUTES.ADMIN_STOCK_TRANSFERS_INCOMING) {
        return (
            pathname === path ||
            pathname.startsWith(path + "/") ||
            (pathname.startsWith(ROUTES.ADMIN_STOCK_TRANSFERS) && fromParam === "incoming")
        );
    }

    if (path === ROUTES.ADMIN_STOCK_TRANSFERS_VALIDATIONS) {
        return (
            pathname === path ||
            pathname.startsWith(path + "/") ||
            (pathname.startsWith(ROUTES.ADMIN_STOCK_TRANSFERS) && fromParam === "validations")
        );
    }

    if (path === ROUTES.ADMIN_REQUEST_TRANSFERS_INCOMING) {
        return pathname === path || pathname.startsWith(path + "/");
    }

    if (path === ROUTES.ADMIN_REQUEST_TRANSFERS) {
        if (
            pathname === ROUTES.ADMIN_REQUEST_TRANSFERS_INCOMING ||
            pathname.startsWith(ROUTES.ADMIN_REQUEST_TRANSFERS_INCOMING + "/")
        ) {
            return false;
        }
    }

    if (path === ROUTES.ADMIN_STOCK_TRANSFERS) {
        if (
            pathname === ROUTES.ADMIN_STOCK_TRANSFERS_INCOMING ||
            pathname.startsWith(ROUTES.ADMIN_STOCK_TRANSFERS_INCOMING + "/") ||
            pathname === ROUTES.ADMIN_STOCK_TRANSFERS_VALIDATIONS ||
            pathname.startsWith(ROUTES.ADMIN_STOCK_TRANSFERS_VALIDATIONS + "/") ||
            fromParam === "incoming" ||
            fromParam === "validations"
        ) {
            return false;
        }
    }

    // Default prefix match for nested child routes (e.g. /admin/purchase/order/new)
    return pathname === path || pathname.startsWith(path + "/");
}

/**
 * Checks recursively whether any child of the item is active.
 */
export function hasActiveChild(
    item: NavItem,
    pathname: string,
    currentTab?: string,
    searchParams?: URLSearchParams | null
): boolean {
    if (!item.children || item.children.length === 0) return false;
    return item.children.some((child) => {
        if (isNavItemActive(child, pathname, currentTab, searchParams)) return true;
        return hasActiveChild(child, pathname, currentTab, searchParams);
    });
}

/**
 * Filters navigation tree by user roles and permissions recursively.
 */
export function filterNavItems(
    items: NavItem[],
    roles: string[],
    permissions: string[]
): NavItem[] {
    return items
        .map((item) => {
            // Check self permission
            const isAllowed = item.permission ? item.permission(roles, permissions) : true;
            if (!isAllowed) return null;

            // If item has children, filter them recursively
            if (item.children && item.children.length > 0) {
                const filteredChildren = filterNavItems(item.children, roles, permissions);
                if (filteredChildren.length === 0) return null;
                return { ...item, children: filteredChildren };
            }

            return item;
        })
        .filter(Boolean) as NavItem[];
}

/**
 * Recursively find the active page title based on current pathname.
 */
export function getNavTitle(
    pathname: string,
    currentTab?: string,
    searchParams?: URLSearchParams | null
): string {
    const fromParam = searchParams?.get("from");

    if (pathname.startsWith(ROUTES.ADMIN_STOCK_TRANSFERS)) {
        if (pathname === ROUTES.ADMIN_STOCK_TRANSFERS_INCOMING || fromParam === "incoming") {
            return "Transfer Masuk";
        }
        if (pathname === ROUTES.ADMIN_STOCK_TRANSFERS_VALIDATIONS || fromParam === "validations") {
            return "Validasi Transfer";
        }
        if (pathname === ROUTES.ADMIN_STOCK_TRANSFERS || fromParam === "outgoing") {
            return "Transfer Keluar";
        }
    }

    // Exact match search recursively
    function findExact(items: NavItem[]): string | undefined {
        for (const item of items) {
            if (item.path === pathname) {
                if (item.tab && item.tab !== currentTab) continue;
                return item.label;
            }
            if (item.children) {
                const found = findExact(item.children);
                if (found) return found;
            }
        }
        return undefined;
    }

    for (const section of NAVIGATION_CONFIG) {
        const found = findExact(section.items);
        if (found) return found;
    }

    // Prefix match search recursively for detail pages
    function findPrefix(items: NavItem[]): string | undefined {
        for (const item of items) {
            if (item.path && item.path !== "/admin" && item.path !== "/checkout") {
                if (pathname.startsWith(item.path + "/")) {
                    return item.label;
                }
            }
            if (item.children) {
                const found = findPrefix(item.children);
                if (found) return found;
            }
        }
        return undefined;
    }

    for (const section of NAVIGATION_CONFIG) {
        const found = findPrefix(section.items);
        if (found) return found;
    }

    return "Dashboard Admin";
}

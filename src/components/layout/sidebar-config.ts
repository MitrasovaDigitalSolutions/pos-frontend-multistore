import { hasPermission, hasRole } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import {
    IconArrowBackUp,
    IconBox,
    IconChartBar,
    IconDatabase,
    IconDeviceLaptop,
    IconHome,
    IconSettings,
    IconShieldLock,
    IconShoppingCart,
    IconTruckDelivery,
    IconUsers,
    IconWallet
} from "@tabler/icons-react";

export interface SidebarMenuItem {
    type: "link";
    path: string;
    label: string;
    icon: React.ComponentType<{ size: number }>;
    tab?: string;
    permission: (roles: string[], permissions: string[]) => boolean;
}

export interface SidebarSubmenuItem {
    path: string;
    label: string;
    permission: (roles: string[], permissions: string[]) => boolean;
}

export interface SidebarSubmenu {
    type: "submenu";
    label: string;
    icon: React.ComponentType<{ size: number }>;
    items: SidebarSubmenuItem[];
    permission: (roles: string[], permissions: string[]) => boolean;
}

export type SidebarItemConfig = SidebarMenuItem | SidebarSubmenu;

export interface SidebarSectionConfig {
    title: string;
    items: SidebarItemConfig[];
}

export const NAVIGATION_CONFIG: SidebarSectionConfig[] = [
    {
        title: "Menu Utama",
        items: [
            {
                type: "link",
                path: ROUTES.ADMIN,
                label: "Dashboard",
                icon: IconHome,
                permission: (roles, permissions) =>
                    hasRole(roles, "admin") || hasPermission(roles, permissions, "view_reports"),
            },
            {
                type: "link",
                path: ROUTES.CHECKOUT,
                label: "Layar Kasir (POS)",
                icon: IconDeviceLaptop,
                permission: (roles, permissions) =>
                    hasRole(roles, "admin") || hasPermission(roles, permissions, "create_sales"),
            },
        ],
    },

    {
        title: "Inventori & Laporan",
        items: [
            {
                type: "link",
                path: ROUTES.ADMIN_STOCK,
                label: "Stok Opname",
                icon: IconBox,
                tab: "inventory",
                permission: (roles, permissions) =>
                    hasRole(roles, "admin") ||
                    hasPermission(roles, permissions, "view_inventory") ||
                    hasPermission(roles, permissions, "manage_inventory"),
            },
            {
                type: "link",
                path: ROUTES.ADMIN_REPORTS,
                label: "Laporan Penjualan",
                icon: IconChartBar,
                permission: (roles, permissions) =>
                    hasRole(roles, "admin") || hasPermission(roles, permissions, "view_reports"),
            },
            {
                type: "link",
                path: ROUTES.ADMIN_CASH_DRAWER,
                label: "Sesi Kasir",
                icon: IconWallet,
                permission: (roles, permissions) =>
                    hasRole(roles, "admin") || hasPermission(roles, permissions, "view_cash_drawer"),
            },
        ],
    },
    {
        title: "Transaksi Pembelian",
        items: [
            {
                type: "link",
                path: ROUTES.ADMIN_PURCHASE_ORDER,
                label: "Pemesanan",
                icon: IconShoppingCart,
                permission: (roles, permissions) =>
                    hasRole(roles, "admin") ||
                    hasPermission(roles, permissions, "view_purchase") ||
                    hasPermission(roles, permissions, "manage_purchase"),
            },
            {
                type: "link",
                path: ROUTES.ADMIN_PURCHASE_RECEIVING,
                label: "Penerimaan",
                icon: IconTruckDelivery,
                permission: (roles, permissions) =>
                    hasRole(roles, "admin") ||
                    hasPermission(roles, permissions, "view_purchase") ||
                    hasPermission(roles, permissions, "manage_purchase"),
            },
            {
                type: "link",
                path: ROUTES.ADMIN_PURCHASE_PAYMENT,
                label: "Pembayaran",
                icon: IconWallet,
                permission: (roles, permissions) =>
                    hasRole(roles, "admin") ||
                    hasPermission(roles, permissions, "view_purchase") ||
                    hasPermission(roles, permissions, "manage_purchase"),
            },
            {
                type: "link",
                path: ROUTES.ADMIN_PURCHASE_RETURN,
                label: "Retur",
                icon: IconArrowBackUp,
                permission: (roles, permissions) =>
                    hasRole(roles, "admin") ||
                    hasPermission(roles, permissions, "view_purchase") ||
                    hasPermission(roles, permissions, "manage_purchase"),
            },
        ],
    },
    {
        title: "Data Utama",
        items: [
            {
                type: "submenu",
                label: "Master Data",
                icon: IconDatabase,
                permission: (roles, permissions) =>
                    hasRole(roles, "admin") ||
                    hasPermission(roles, permissions, "view_products") ||
                    hasPermission(roles, permissions, "view_suppliers"),
                items: [
                    {
                        path: ROUTES.ADMIN_PRODUCTS,
                        label: "Master Product",
                        permission: (roles, permissions) =>
                            hasRole(roles, "admin") ||
                            hasPermission(roles, permissions, "view_products") ||
                            hasPermission(roles, permissions, "manage_products"),
                    },
                    {
                        path: ROUTES.ADMIN_SUPPLIERS,
                        label: "Master Supplier",
                        permission: (roles, permissions) =>
                            hasRole(roles, "admin") ||
                            hasPermission(roles, permissions, "view_suppliers") ||
                            hasPermission(roles, permissions, "manage_suppliers"),
                    },
                    {
                        path: ROUTES.ADMIN_CATEGORIES,
                        label: "Master Kategori",
                        permission: (roles, permissions) =>
                            hasRole(roles, "admin") ||
                            hasPermission(roles, permissions, "view_products") ||
                            hasPermission(roles, permissions, "manage_products"),
                    },
                    {
                        path: ROUTES.ADMIN_BRANDS,
                        label: "Master Brand",
                        permission: (roles, permissions) =>
                            hasRole(roles, "admin") ||
                            hasPermission(roles, permissions, "view_products") ||
                            hasPermission(roles, permissions, "manage_products"),
                    },
                ],
            },
        ],
    },
    {
        title: "Sistem",
        items: [
            {
                type: "link",
                path: ROUTES.ADMIN_USERS,
                label: "Kelola Pengguna",
                icon: IconUsers,
                permission: (roles, permissions) =>
                    hasRole(roles, "admin") ||
                    hasPermission(roles, permissions, "view_users") ||
                    hasPermission(roles, permissions, "manage_users"),
            },
            {
                type: "link",
                path: ROUTES.ADMIN_SETTINGS,
                label: "Pengaturan Toko",
                icon: IconSettings,
                permission: (roles) => hasRole(roles, "admin"),
            },
            {
                type: "link",
                path: ROUTES.ADMIN_AUDIT,
                label: "Log Aktivitas",
                icon: IconShieldLock,
                permission: (roles, permissions) =>
                    hasRole(roles, "admin") || hasPermission(roles, permissions, "view_audit_logs"),
            },
        ],
    },
];

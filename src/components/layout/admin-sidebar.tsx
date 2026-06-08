"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
    IconHome,
    IconShoppingCart,
    IconPackage,
    IconBox,
    IconTruckDelivery,
    IconChartBar,
    IconSettings,
    IconLogout,
    IconDeviceLaptop,
    IconUsers,
} from "@tabler/icons-react";
import { hasRole, hasPermission } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";

export function AdminSidebar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const user = session?.user;

    const currentTab = searchParams.get("tab") || "inventory";

    const userRoles = user?.roles || [];
    const userPermissions = user?.permissions || [];

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/login" });
    };

    const isActive = (path: string, tab?: string) => {
        if (tab) {
            return pathname === path && currentTab === tab;
        }
        // For general routes (except stock where tab determines sub-route)
        if (path === ROUTES.ADMIN_STOCK) {
            return pathname === path && currentTab !== "receiving";
        }
        return pathname === path;
    };

    const getLinkClass = (path: string, tab?: string) => {
        const active = isActive(path, tab);
        return `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all text-left cursor-pointer ${
            active
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
                : "text-gray-400 hover:text-white hover:bg-gray-900"
        }`;
    };

    const hasViewReports =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "view_reports");
    const hasCreateSales =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "create_sales");
    const hasManageProducts =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "manage_products");
    const hasManageUsers =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "manage_users");
    const hasAdmin = hasRole(userRoles, "admin");

    return (
        <aside className="w-52.5 bg-gray-950 text-gray-400 flex flex-col justify-between p-4 py-6 border-r border-gray-900 shrink-0">
            <div className="space-y-6">
                <div className="flex items-center gap-2 px-3">
                    <IconShoppingCart size={22} className="text-emerald-400" />
                    <span className="font-extrabold text-[14px] text-white tracking-wide">
                        MSG POS
                    </span>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <span className="text-[9px] font-extrabold text-gray-600 uppercase tracking-widest px-3 block">
                            Menu Utama
                        </span>
                        <ul className="space-y-0.5">
                            {hasViewReports && (
                                <li>
                                    <Link
                                        href={ROUTES.ADMIN}
                                        className={getLinkClass(ROUTES.ADMIN)}
                                    >
                                        <IconHome size={18} />
                                        <span>Dashboard</span>
                                    </Link>
                                </li>
                            )}
                            {hasCreateSales && (
                                <li>
                                    <Link
                                        href={ROUTES.CHECKOUT}
                                        className={getLinkClass(
                                            ROUTES.CHECKOUT,
                                        )}
                                    >
                                        <IconDeviceLaptop size={18} />
                                        <span>Layar Kasir (POS)</span>
                                    </Link>
                                </li>
                            )}
                            {hasManageProducts && (
                                <li>
                                    <Link
                                        href={ROUTES.ADMIN_PRODUCTS}
                                        className={getLinkClass(
                                            ROUTES.ADMIN_PRODUCTS,
                                        )}
                                    >
                                        <IconPackage size={18} />
                                        <span>Manajemen Produk</span>
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </div>

                    {(hasManageProducts || hasViewReports) && (
                        <div className="space-y-1">
                            <span className="text-[9px] font-extrabold text-gray-600 uppercase tracking-widest px-3 block">
                                Inventori & Laporan
                            </span>
                            <ul className="space-y-0.5">
                                {hasManageProducts && (
                                    <li>
                                        <Link
                                            href={`${ROUTES.ADMIN_STOCK}?tab=inventory`}
                                            className={getLinkClass(
                                                ROUTES.ADMIN_STOCK,
                                                "inventory",
                                            )}
                                        >
                                            <IconBox size={18} />
                                            <span>Stok Barang</span>
                                        </Link>
                                    </li>
                                )}
                                {hasManageProducts && (
                                    <li>
                                        <Link
                                            href={`${ROUTES.ADMIN_STOCK}?tab=receiving`}
                                            className={getLinkClass(
                                                ROUTES.ADMIN_STOCK,
                                                "receiving",
                                            )}
                                        >
                                            <IconTruckDelivery size={18} />
                                            <span>Penerimaan</span>
                                        </Link>
                                    </li>
                                )}
                                {hasViewReports && (
                                    <li>
                                        <Link
                                            href={ROUTES.ADMIN_REPORTS}
                                            className={getLinkClass(
                                                ROUTES.ADMIN_REPORTS,
                                            )}
                                        >
                                            <IconChartBar size={18} />
                                            <span>Laporan Penjualan</span>
                                        </Link>
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-1">
                <span className="text-[9px] font-extrabold text-gray-600 uppercase tracking-widest px-3 block">
                    Sistem
                </span>
                <ul className="space-y-0.5">
                    {hasManageUsers && (
                        <li>
                            <Link
                                href={ROUTES.ADMIN_USERS}
                                className={getLinkClass(ROUTES.ADMIN_USERS)}
                            >
                                <IconUsers size={18} />
                                <span>Kelola Pengguna</span>
                            </Link>
                        </li>
                    )}
                    {hasAdmin && (
                        <li>
                            <Link
                                href={ROUTES.ADMIN_SETTINGS}
                                className={getLinkClass(ROUTES.ADMIN_SETTINGS)}
                            >
                                <IconSettings size={18} />
                                <span>Pengaturan Toko</span>
                            </Link>
                        </li>
                    )}
                    <li>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition-all text-left cursor-pointer border-none bg-transparent"
                        >
                            <IconLogout size={18} />
                            <span>Keluar</span>
                        </button>
                    </li>
                </ul>
            </div>
        </aside>
    );
}

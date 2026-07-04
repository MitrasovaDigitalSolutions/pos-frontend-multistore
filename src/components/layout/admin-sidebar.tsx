"use client";

import { Scrollable } from "@/components/ui/scrollable";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, getImageUrl } from "@/lib/utils";
import { useSidebarStore } from "@/stores/sidebar-store";
import { useSettingsStore } from "@/stores/settings-store";
import {
    IconLogout
} from "@tabler/icons-react";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { signOut } from "@/lib/auth-helpers";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { NAVIGATION_CONFIG } from "./sidebar-config";
import { SidebarLink } from "./sidebar-link";
import { SidebarSubmenu } from "./sidebar-submenu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function AdminSidebar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const user = session?.user;

    const { isCollapsed, toggle, isMobileOpen, setMobileOpen } = useSidebarStore();
    const [mounted, setMounted] = useState(false);
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setMounted(true);
        }, 0);

        // Force body and html to be overflow-hidden to prevent second page-level scrollbar
        document.body.classList.add("overflow-hidden");
        document.documentElement.classList.add("overflow-hidden");

        return () => {
            clearTimeout(timer);
            document.body.classList.remove("overflow-hidden");
            document.documentElement.classList.remove("overflow-hidden");
        };
    }, []);

    useEffect(() => {
        // Auto-close mobile sidebar when navigating
        setMobileOpen(false);
    }, [pathname, setMobileOpen]);

    const collapsed = mounted ? isCollapsed : false;
    const currentTab = searchParams.get("tab") || "inventory";

    const userRoles = user?.roles || [];
    const userPermissions = user?.permissions || [];

    const getSetting = useSettingsStore((state) => state.getSetting);
    const isLoadingSettings = useSettingsStore((state) => state.isLoading);
    const isSettingsLoading = isLoadingSettings || !mounted;

    const appNameRaw = getSetting("app_name", "");
    const appName = appNameRaw && appNameRaw.trim() !== "" ? appNameRaw : "Mitrasova POS";
    const appLogoRaw = getSetting("app_logo_url", "");
    const appLogo = getImageUrl(appLogoRaw);

    const handleLogout = () => {
        setIsLogoutConfirmOpen(true);
    };

    const isActive = (path: string, tab?: string) => {
        if (tab) {
            return pathname === path && currentTab === tab;
        }
        if (path === ROUTES.ADMIN_STOCK) {
            return pathname === path && currentTab !== "receiving";
        }
        // Exact match for root admin & checkout to prevent false positives
        if (path === "/admin" || path === "/checkout") {
            return pathname === path;
        }
        // Prevent "/admin/expenses" from matching when on "/admin/expenses/categories"
        if (path === "/admin/expenses" && (pathname === "/admin/expenses/categories" || pathname.startsWith("/admin/expenses/categories/"))) {
            return false;
        }
        // For all other routes, use prefix matching so nested routes
        // (e.g. /admin/purchase/order/4/items) highlight the parent menu item
        return pathname === path || pathname.startsWith(path + "/");
    };

    // Helper to get active routes from config mapping
    const ROUTES = {
        ADMIN_STOCK: "/admin/inventory/stock-opname",
    } as const;

    return (
        <TooltipProvider delayDuration={0}>
            {/* Mobile Sidebar Overlay Backdrop */}
            {mounted && isMobileOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside
                className={cn(
                    "bg-gray-950 text-gray-400 flex flex-col justify-between border-r border-gray-900 shrink-0 transition-all duration-300 h-screen select-none",
                    // Mobile overlay vs Desktop inline layouts
                    "fixed inset-y-0 left-0 z-50 lg:relative lg:translate-x-0 lg:z-20",
                    mounted && isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                    collapsed ? "w-16" : "w-52.5"
                )}
            >
                <button
                    onClick={toggle}
                    className="absolute top-2 -right-4 z-10 w-4 h-16 hidden lg:flex items-center justify-center rounded-tr-md rounded-br-md bg-gray-950 text-gray-400 hover:text-white hover:bg-gray-900 shadow-md cursor-pointer transition-all outline-none"
                    title={collapsed ? "Perluas Menu" : "Sembunyikan Menu"}
                >
                    {collapsed ? (
                        <ChevronsRight size={13} className="stroke-[3]" />
                    ) : (
                        <ChevronsLeft size={13} className="stroke-[3]" />
                    )}
                </button>

                {/* Top Header Logo */}
                <div
                    className={cn(
                        "py-7 flex items-center gap-2 border-b border-gray-950/20 shrink-0",
                        collapsed ? "justify-center px-0" : "px-5"
                    )}
                >
                    {isSettingsLoading ? (
                        <>
                            <div className="w-7 h-7 bg-gray-800 rounded-md animate-pulse shrink-0" />
                            {!collapsed && (
                                <div className="h-3 bg-gray-800 rounded animate-pulse w-24 shrink-0" />
                            )}
                        </>
                    ) : (
                        <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={appLogo || "/logo/logo.png"}
                                alt="Logo"
                                className="w-7 h-7 object-contain rounded-md p-0.5 shrink-0"
                            />
                            {!collapsed && (
                                <span className="font-extrabold text-xs text-white tracking-wider truncate">
                                    {appName}
                                </span>
                            )}
                        </>
                    )}
                </div>

                {/* Middle Scrollable Section (Menu List) */}
                <Scrollable className="flex-1 min-h-0 py-2">
                    <div
                        className={cn(
                            "flex flex-col pb-4",
                            collapsed ? "px-2 space-y-4" : "px-4 space-y-5"
                        )}
                    >
                        {NAVIGATION_CONFIG.map((section) => {
                            // Filter items based on active user role/permission checks
                            const visibleItems = section.items.filter((item) =>
                                item.permission(userRoles, userPermissions)
                            );

                            if (visibleItems.length === 0) return null;

                            return (
                                <div key={section.title} className="space-y-1">
                                    {!collapsed ? (
                                        <span className="text-[9px] font-extrabold text-gray-600 uppercase tracking-widest px-3 block">
                                            {section.title}
                                        </span>
                                    ) : (
                                        <div className="h-px bg-gray-900 my-2 w-10 mx-auto" />
                                    )}
                                    <ul
                                        className={cn(
                                            "space-y-0.5",
                                            collapsed && "flex flex-col gap-1"
                                        )}
                                    >
                                        {visibleItems.map((item) => {
                                            if (item.type === "link") {
                                                return (
                                                    <SidebarLink
                                                        key={item.path + (item.tab || "")}
                                                        path={item.path}
                                                        label={item.label}
                                                        icon={item.icon}
                                                        tab={item.tab}
                                                        collapsed={collapsed}
                                                        isActive={isActive(item.path, item.tab)}
                                                    />
                                                );
                                            } else {
                                                return (
                                                    <SidebarSubmenu
                                                        key={item.label}
                                                        label={item.label}
                                                        icon={item.icon}
                                                        items={item.items}
                                                        collapsed={collapsed}
                                                        pathname={pathname}
                                                        userRoles={userRoles}
                                                        userPermissions={userPermissions}
                                                        isActive={isActive}
                                                    />
                                                );
                                            }
                                        })}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </Scrollable>

                {/* Bottom Fixed Section (Logout Button) */}
                <div className={cn("p-4 border-t border-gray-900 bg-gray-950 shrink-0", collapsed ? "px-2" : "px-4")}>
                    <ul className="space-y-0.5">
                        {collapsed ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={handleLogout}
                                        className="w-10 h-10 mx-auto flex items-center justify-center rounded-xl text-rose-500 hover:text-rose-300 hover:bg-rose-950/20 transition-all cursor-pointer border-none bg-transparent outline-none"
                                    >
                                        <IconLogout size={18} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="right"
                                    className="bg-gray-900 border-gray-800 text-white font-bold text-xs"
                                >
                                    Keluar
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <li>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition-all text-left cursor-pointer border-none bg-transparent outline-none"
                                >
                                    <IconLogout size={18} />
                                    <span>Keluar</span>
                                </button>
                            </li>
                        )}
                    </ul>
                </div>
            </aside>

            <ConfirmDialog
                open={isLogoutConfirmOpen}
                onOpenChange={setIsLogoutConfirmOpen}
                title="Keluar dari Akun"
                description={
                    session?.cashDrawerSessionId
                        ? "PERHATIAN: Shift laci kasir Anda masih aktif! Keluar hanya akan log out akun, shift laci kasir TIDAK akan ditutup."
                        : "Apakah Anda yakin ingin keluar dari aplikasi?"
                }
                confirmText="Ya, Keluar"
                cancelText="Batal"
                variant="danger"
                onConfirm={async () => {
                    await signOut({ callbackUrl: "/login" });
                }}
            />
        </TooltipProvider>
    );
}

"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { IconCalendar, IconChevronDown, IconLogout, IconMenu } from "@tabler/icons-react";
import { useState } from "react";
import { signOut } from "@/lib/auth-helpers";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NAVIGATION_CONFIG } from "./sidebar-config";
import { useSidebarStore } from "@/stores/sidebar-store";
import { formatToReadableDate } from "@/lib/date-utils";
import { StoreSwitcher } from "./store-switcher";

export function AdminHeader() {
  const { toggleMobile } = useSidebarStore();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const user = session?.user;

  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const currentTab = searchParams.get("tab") || "inventory";

  const getTitle = () => {
    // Search NAVIGATION_CONFIG for matching route
    // First pass: try exact match
    for (const section of NAVIGATION_CONFIG) {
      for (const item of section.items) {
        if (item.type === "link") {
          if (item.path === pathname) {
            if (item.tab && item.tab !== currentTab) {
              continue;
            }
            return item.label;
          }
        } else if (item.type === "submenu") {
          for (const subItem of item.items) {
            if (subItem.path === pathname) {
              return subItem.label;
            }
          }
        }
      }
    }

    // Second pass: try prefix match for nested routes (e.g. /admin/purchase/order/4/items)
    for (const section of NAVIGATION_CONFIG) {
      for (const item of section.items) {
        if (item.type === "link" && item.path !== "/admin" && item.path !== "/checkout") {
          if (pathname.startsWith(item.path + "/")) {
            return item.label;
          }
        } else if (item.type === "submenu") {
          for (const subItem of item.items) {
            if (pathname.startsWith(subItem.path + "/")) {
              return subItem.label;
            }
          }
        }
      }
    }

    return "Dashboard Admin";
  };

  // if (pathname.startsWith("/admin/users")) {
  //   return null;
  // }

  const formattedDate = formatToReadableDate(new Date());

  const userName = user?.name || "Kasir";
  const userRole = user?.roles?.[0] || "kasir";

  return (
    <>
      <header className="relative z-10 flex justify-between items-center px-4 md:px-8 pt-6 pb-4 border-b border-slate-200/60 bg-slate-100">
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Toggle */}
          <button
            type="button"
            onClick={toggleMobile}
            className="lg:hidden p-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 transition-all cursor-pointer shadow-sm"
          >
            <IconMenu size={16} className="stroke-[2.5]" />
          </button>
          <h2 className="text-lg font-extrabold text-slate-900 leading-none">{getTitle()}</h2>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          <StoreSwitcher />
          {/* Date Badge */}
          <div className="hidden sm:flex bg-yellow-50 text-yellow-500 border border-yellow-100 px-3 py-1.5 rounded-full items-center gap-2 font-bold text-xs select-none">
            <IconCalendar size={15} />
            <span>Hari Ini: {formattedDate}</span>
          </div>

          <div className="hidden sm:block h-5 w-px bg-slate-200" />

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 sm:gap-2.5 p-1 sm:p-1.5 rounded-2xl hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-all cursor-pointer select-none outline-none border border-transparent hover:border-slate-200/80 group"
              >
                <div className="text-right hidden md:block">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight group-hover:text-slate-900 transition-colors">
                    {userName}
                  </div>
                  <div className="text-[9px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider leading-none mt-0.5">
                    {userRole.replace("_", " ")}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-extrabold text-xs shadow-sm shadow-emerald-600/5 shrink-0 ring-2 ring-emerald-500/20 group-hover:ring-emerald-500/40 transition-all">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <IconChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors hidden sm:block" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-56 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 shadow-xl rounded-2xl z-50"
            >
              <div className="px-2 py-2 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-extrabold text-sm shrink-0">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 truncate">{userName}</p>
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mt-0.5 truncate">
                    {userRole.replace("_", " ")}
                  </p>
                </div>
              </div>

              <DropdownMenuItem
                onClick={() => setIsLogoutConfirmOpen(true)}
                className="text-rose-600 dark:text-rose-400 focus:bg-rose-50 focus:text-rose-700 dark:focus:bg-rose-950/60 dark:focus:text-rose-300 rounded-xl px-2.5 py-2 font-bold text-xs cursor-pointer flex items-center gap-2 transition-all mt-1 group"
              >
                <IconLogout size={16} className="text-rose-600 dark:text-rose-400 group-focus:text-rose-700 dark:group-focus:text-rose-300" />
                <span>Keluar dari Akun</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

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
        isLoading={isLoggingOut}
        onConfirm={async () => {
          setIsLoggingOut(true);
          await signOut({ callbackUrl: "/login" });
        }}
      />
    </>
  );
}


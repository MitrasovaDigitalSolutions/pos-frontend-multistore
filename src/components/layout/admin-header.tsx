"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { IconCalendar, IconMenu } from "@tabler/icons-react";
import { NAVIGATION_CONFIG } from "./sidebar-config";
import { useSidebarStore } from "@/stores/sidebar-store";
import { formatToReadableDate } from "@/lib/date-utils";

export function AdminHeader() {
  const { toggleMobile } = useSidebarStore();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const user = session?.user;

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

  if (pathname.startsWith("/admin/users")) {
    return null;
  }

  const formattedDate = formatToReadableDate(new Date());

  const userName = user?.name || "Kasir";
  const userRole = user?.roles?.[0] || "kasir";

  return (
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
        {/* Date Badge */}
        <div className="hidden sm:flex bg-yellow-50 text-yellow-500 border border-yellow-100 px-3 py-1.5 rounded-full items-center gap-2 font-bold text-xs select-none">
          <IconCalendar size={15} />
          <span>Hari Ini: {formattedDate}</span>
        </div>

        <div className="hidden sm:block h-5 w-px bg-slate-200" />

        {/* User Badge */}
        <div className="flex items-center gap-2.5">
          <div className="text-right hidden md:block">
            <div className="text-xs font-bold text-slate-800 leading-tight">{userName}</div>
            <div className="text-[9px] font-extrabold uppercase text-emerald-600 tracking-wider leading-none mt-0.5">
              {userRole.replace("_", " ")}
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-xs shadow-sm shadow-emerald-600/5 select-none">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}


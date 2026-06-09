"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { IconCalendar } from "@tabler/icons-react";

const PATH_TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/products": "Manajemen Produk",
  "/admin/stock": "Stok Barang & Inventori",
  "/admin/reports": "Laporan Penjualan & Analitik",
  "/admin/users": "Kelola Pengguna Sistem",
  "/admin/settings": "Pengaturan Profil Toko",
};

export function AdminHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const user = session?.user;

  const currentTab = searchParams.get("tab") || "inventory";

  const getTitle = () => {
    if (pathname === "/admin/stock" && currentTab === "receiving") {
      return "Penerimaan Barang Masuk Log";
    }
    return PATH_TITLES[pathname] || "Dashboard Admin";
  };

  const formattedDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const userName = user?.name || "Kasir";
  const userRole = user?.roles?.[0] || "kasir";

  return (
    <header className="flex justify-between items-center mb-6 border-b border-slate-200/60 pb-4">
      <h2 className="text-base font-extrabold text-slate-900">{getTitle()}</h2>
      <div className="flex items-center gap-4">
        {/* Date Badge */}
        <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-full flex items-center gap-2 font-bold text-xs select-none">
          <IconCalendar size={15} />
          <span>Hari Ini: {formattedDate}</span>
        </div>

        <div className="h-5 w-px bg-slate-200" />

        {/* User Badge */}
        <div className="flex items-center gap-2.5">
          <div className="text-right">
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


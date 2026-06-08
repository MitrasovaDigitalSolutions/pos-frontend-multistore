"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ShowcaseToolbar() {
    const pathname = usePathname();

    const getLinkClass = (path: string) => {
        const isActive = pathname === path;
        return `text-xs font-bold transition-all px-3 py-1 rounded-full ${
            isActive
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
        }`;
    };

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-950/90 border border-slate-800 text-white px-5 py-2.5 rounded-full shadow-2xl z-9999 flex items-center gap-3 backdrop-blur-md">
            <span className="text-[9px] uppercase font-extrabold text-slate-400 tracking-widest mr-1">
                Showcase Nav:
            </span>
            <Link href="/login" className={getLinkClass("/login")}>
                Login
            </Link>
            <div className="w-px h-3.5 bg-slate-800"></div>
            <Link href="/checkout" className={getLinkClass("/checkout")}>
                Layar Kasir
            </Link>
            <div className="w-px h-3.5 bg-slate-800"></div>
            <Link href="/admin" className={getLinkClass("/admin")}>
                Dashboard Admin
            </Link>
        </div>
    );
}

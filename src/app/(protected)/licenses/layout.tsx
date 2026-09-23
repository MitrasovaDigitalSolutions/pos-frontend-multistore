import type { ReactNode } from "react";

interface LicensesLayoutProps {
    children: ReactNode;
}

/**
 * Standalone layout untuk halaman /licenses.
 * Tidak menggunakan AdminSidebar / AdminHeader — pure full-screen page.
 */
export default function LicensesLayout({ children }: LicensesLayoutProps) {
    return (
        <div className="min-h-[100dvh] w-full bg-slate-50/70 text-slate-800 antialiased flex flex-col">
            {children}
        </div>
    );
}

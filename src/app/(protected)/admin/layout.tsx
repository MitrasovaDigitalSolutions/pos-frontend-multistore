import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminHeader } from "@/components/layout/admin-header";
import type { ReactNode } from "react";

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <div className="grow flex h-screen overflow-hidden bg-slate-100">
            <AdminSidebar />

            <main className="grow p-6 px-8 overflow-y-auto h-full">
                <AdminHeader />

                {children}
            </main>
        </div>
    );
}

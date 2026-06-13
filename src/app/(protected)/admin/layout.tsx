import { AdminHeader } from "@/components/layout/admin-header";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import type { ReactNode } from "react";

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {

    return (
        <div className="grow flex h-screen overflow-hidden bg-slate-100">
            <AdminSidebar />

            <div className="grow flex flex-col h-full overflow-hidden">
                <AdminHeader />

                <main className="grow pt-6 px-8 pb-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}

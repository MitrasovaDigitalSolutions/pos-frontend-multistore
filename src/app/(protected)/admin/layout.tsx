import { AdminHeader } from "@/components/layout/admin-header";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import type { ReactNode } from "react";

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {

    return (
        <div className="flex h-screen w-full min-h-0 overflow-hidden bg-slate-100">
            <AdminSidebar />

            <div className="grow flex flex-col h-full min-h-0 overflow-hidden">
                <AdminHeader />

                <main className="grow min-h-0 pt-2 px-4 md:px-8 pb-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}

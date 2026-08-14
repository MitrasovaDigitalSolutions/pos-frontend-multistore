import { AdminHeader } from "@/components/layout/admin-header";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import type { ReactNode } from "react";

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <div className="flex h-screen h-[100dvh] max-h-[100dvh] w-full min-h-0 overflow-hidden bg-slate-100">
            <AdminSidebar />

            <div className="grow flex-1 flex flex-col h-full h-[100dvh] max-h-[100dvh] min-h-0 min-w-0 overflow-hidden">
                <AdminHeader />

                <main className="grow flex-1 min-h-0 min-w-0 pt-2 px-3 sm:px-6 md:px-8 pb-28 sm:pb-8 overflow-y-auto overscroll-y-contain">
                    {children}
                </main>
            </div>
        </div>
    );
}

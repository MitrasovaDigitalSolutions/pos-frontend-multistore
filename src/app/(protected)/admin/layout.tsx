import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminHeader } from "@/components/layout/admin-header";
import type { ReactNode } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="grow flex h-screen overflow-hidden bg-slate-100 pb-8">
      {/* Sidebar Navigation */}
      <AdminSidebar />

      {/* Main Content Section */}
      <main className="grow p-6 px-8 overflow-y-auto h-full">
        {/* Header Bar */}
        <AdminHeader />

        {/* Page Content */}
        {children}
      </main>
    </div>
  );
}

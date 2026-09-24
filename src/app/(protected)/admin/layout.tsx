import { AdminHeader } from "@/components/layout/admin-header";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { PurchaseTutorialController } from "@/features/purchase/tutorial/components/purchase-tutorial-controller";
import { ConsignmentTutorialController } from "@/features/consignment/tutorial/components/consignment-tutorial-controller";
import { TransferTutorialController } from "@/features/stock-transfer/tutorial/components/transfer-tutorial-controller";
import { StockTutorialController } from "@/features/stock/tutorial/components/stock-tutorial-controller";
import { SalesTutorialController } from "@/features/sales-tutorial/components/sales-tutorial-controller";
import { LicenseBanner } from "@/features/license/components/license-banner";
import { LicenseAdminGuard } from "@/features/license/components/license-admin-guard";
import type { ReactNode } from "react";

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <LicenseAdminGuard>
            <div className="flex h-screen h-[100dvh] max-h-[100dvh] w-full min-h-0 overflow-hidden bg-slate-100">
            <AdminSidebar />

            <div className="grow flex-1 flex flex-col h-full h-[100dvh] max-h-[100dvh] min-h-0 min-w-0 overflow-hidden">
                <AdminHeader />
                <LicenseBanner />

                <main className="grow flex-1 min-h-0 min-w-0 pt-2 px-3 sm:px-6 md:px-8 pb-28 sm:pb-8 overflow-y-auto overscroll-y-contain [scrollbar-gutter:stable]">
                    {children}
                </main>
            </div>

            {/* Feature Interactive Tutorial Controllers */}
            <PurchaseTutorialController />
            <ConsignmentTutorialController />
            <TransferTutorialController />
            <StockTutorialController />
            <SalesTutorialController />
        </div>
        </LicenseAdminGuard>
    );
}


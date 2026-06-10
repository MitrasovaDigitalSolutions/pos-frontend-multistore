import { Suspense } from "react";
import { CashDrawerSessions } from "@/features/cash-drawer-sessions/cash-drawer-sessions";
import { PageLoader } from "@/components/feedback/page-loader";

export default function AdminCashDrawerPage() {
    return (
        <Suspense fallback={<PageLoader message="Memuat halaman..." />}>
            <CashDrawerSessions />
        </Suspense>
    );
}

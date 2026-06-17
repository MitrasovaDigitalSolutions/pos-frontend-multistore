import { Suspense } from "react";
import { CashAccountsDashboard } from "@/features/cash/components/cash-accounts-dashboard";
import { PageLoader } from "@/components/feedback/page-loader";

export default function AdminCashAccountsPage() {
    return (
        <Suspense fallback={<PageLoader message="Memuat halaman..." />}>
            <CashAccountsDashboard />
        </Suspense>
    );
}

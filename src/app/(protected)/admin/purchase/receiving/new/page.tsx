import { Suspense } from "react";
import { ReceivingItemsPage } from "@/features/purchase/components/receiving/receiving-items-page";
import { PageLoader } from "@/components/feedback/page-loader";

export default function AdminReceivingNewPage() {
    return (
        <Suspense fallback={<PageLoader message="Memuat halaman..." />}>
            <ReceivingItemsPage receivingId="new" />
        </Suspense>
    );
}

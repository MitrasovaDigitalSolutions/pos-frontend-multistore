import { Suspense } from "react";
import { RequestTransferDetailPage } from "@/features/request-transfer/components/request-transfer-detail-page";

export default function AdminRequestTransferDetailPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-sm text-slate-400">Memuat detail summary...</div>}>
            <RequestTransferDetailPage />
        </Suspense>
    );
}

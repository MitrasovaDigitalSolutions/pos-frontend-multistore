import { Suspense } from "react";
import { RequestTransferIncomingDetailPage } from "@/features/request-transfer/components/request-transfer-incoming-detail-page";

export default function AdminIncomingRequestTransferDetailPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-sm text-slate-400">Memuat detail summary request masuk...</div>}>
            <RequestTransferIncomingDetailPage />
        </Suspense>
    );
}


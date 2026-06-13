import { PaymentCreatePage } from "@/features/purchase/components/payment/payment-create-page";
import { Suspense } from "react";

export default function AdminPurchasePaymentNewPage() {
    return (
        <Suspense fallback={<div className="p-6 text-slate-500 text-xs">Loading page...</div>}>
            <PaymentCreatePage />
        </Suspense>
    );
}

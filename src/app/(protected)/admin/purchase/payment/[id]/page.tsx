import { PaymentDetailPage } from "@/features/purchase/components/payment/payment-detail-page";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function AdminPurchasePaymentDetailPage({ params }: PageProps) {
    const { id } = await params;
    return <PaymentDetailPage paymentId={id} />;
}

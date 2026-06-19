import { TransactionDetailPage } from "@/features/transactions/components/transaction-detail-page";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function AdminTransactionDetailPage({ params }: PageProps) {
    const { id } = await params;
    return <TransactionDetailPage transactionId={id} />;
}

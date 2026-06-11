import { PODetailPage } from "@/features/purchase/components/po-detail-page";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function AdminPurchaseOrderDetailPage({ params }: PageProps) {
    const { id } = await params;
    return <PODetailPage poId={Number(id)} />;
}

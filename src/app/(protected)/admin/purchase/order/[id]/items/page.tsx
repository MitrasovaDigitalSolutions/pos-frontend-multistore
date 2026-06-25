import { POItemsPage } from "@/features/purchase/components/purchase-order/po-items-page";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function AdminPurchaseOrderItemsPage({ params }: PageProps) {
    const { id } = await params;
    return <POItemsPage poId={id} />;
}

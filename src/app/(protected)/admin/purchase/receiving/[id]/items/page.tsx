import { ReceivingItemsPage } from "@/features/purchase/components/receiving/receiving-items-page";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function AdminReceivingItemsPage({ params }: PageProps) {
    const { id } = await params;
    return <ReceivingItemsPage receivingId={id} />;
}

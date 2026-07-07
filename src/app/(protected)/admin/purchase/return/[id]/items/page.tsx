import { ReturnItemsPage } from "@/features/purchase/components/return/return-items-page";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function AdminReturnItemsPage({ params }: PageProps) {
    const { id } = await params;
    return <ReturnItemsPage returnId={id} />;
}

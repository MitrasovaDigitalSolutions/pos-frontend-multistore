import { OpnameDetailPage } from "@/features/stock/components/opname-detail-page";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function AdminOpnameDetailPage({ params }: PageProps) {
    const { id } = await params;
    return <OpnameDetailPage opnameId={id} />;
}

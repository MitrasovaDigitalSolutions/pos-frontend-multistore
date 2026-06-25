import { OpnameItemsPage } from "@/features/stock/components/opname-items-page";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function AdminOpnameItemsPage({ params }: PageProps) {
    const { id } = await params;
    return <OpnameItemsPage opnameId={id} />;
}

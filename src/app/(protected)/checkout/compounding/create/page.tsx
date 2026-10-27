import { CompoundingPageView } from "@/features/pharmacy/components/compounding/compounding-page-view";
import { LicenseAdminGuard } from "@/features/license/components/license-admin-guard";

export const metadata = {
    title: "Buat Racikan Obat (Apotek) — Kasir POS",
    description: "Ruang kerja peracikan obat on-the-fly untuk apotek dan farmasi.",
};

interface CheckoutCompoundingCreatePageProps {
    searchParams: Promise<{ templateId?: string }>;
}

export default async function CheckoutCompoundingCreatePage({
    searchParams,
}: CheckoutCompoundingCreatePageProps) {
    const { templateId } = await searchParams;

    return (
        <LicenseAdminGuard>
            <CompoundingPageView templateId={templateId} />
        </LicenseAdminGuard>
    );
}

import { CompoundingPageView } from "@/features/pharmacy/components/compounding/compounding-page-view";
import { LicenseAdminGuard } from "@/features/license/components/license-admin-guard";

export const metadata = {
    title: "Edit Racikan Obat (Apotek) — Kasir POS",
    description: "Edit data racikan obat on-the-fly untuk apotek dan farmasi.",
};

interface EditCompoundingPageProps {
    params: Promise<{ draftId: string }>;
}

export default async function CheckoutCompoundingEditPage({
    params,
}: EditCompoundingPageProps) {
    const { draftId } = await params;

    return (
        <LicenseAdminGuard>
            <CompoundingPageView draftId={draftId} />
        </LicenseAdminGuard>
    );
}

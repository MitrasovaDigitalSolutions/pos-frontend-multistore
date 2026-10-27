import { CheckoutCompoundingListView } from "@/features/pharmacy/components/compounding/checkout-compounding-list-view";
import { LicenseAdminGuard } from "@/features/license/components/license-admin-guard";

export const metadata = {
    title: "Daftar Racikan Obat (Apotek) — Kasir POS",
    description: "Pilih formula racikan obat standar atau buat racikan baru untuk transaksi kasir.",
};

export default function CheckoutCompoundingPage() {
    return (
        <LicenseAdminGuard>
            <CheckoutCompoundingListView />
        </LicenseAdminGuard>
    );
}

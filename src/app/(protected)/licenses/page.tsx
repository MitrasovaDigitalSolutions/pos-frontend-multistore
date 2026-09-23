import type { Metadata } from "next";
import { LicenseStandalonePage } from "@/features/license/components/license-standalone-page";

export const metadata: Metadata = {
    title: "Kelola Langganan — Mitrasova POS",
    description: "Kelola lisensi, perpanjang paket langganan, add-on aktif, dan riwayat tagihan Mitrasova POS.",
};

export default function LicensesPage() {
    return <LicenseStandalonePage />;
}

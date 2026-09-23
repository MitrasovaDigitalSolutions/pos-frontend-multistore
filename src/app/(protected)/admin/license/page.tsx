import { LicensePage } from "@/features/license/components/license-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Manajemen Lisensi - Mitrasova POS",
    description: "Kelola lisensi, add-on, dan riwayat tagihan langganan aplikasi Mitrasova POS.",
};

export default function AdminLicensePage() {
    return <LicensePage />;
}

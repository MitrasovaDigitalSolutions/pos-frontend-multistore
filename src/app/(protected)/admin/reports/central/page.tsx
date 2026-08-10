import { CentralReportPage } from "@/features/reports/components/central/central-report-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Laporan Konsolidasi | POS System",
    description: "Laporan terpusat untuk manajemen mencakup omset, laba rugi, perbandingan cabang, dan valuasi stok.",
};

export default function AdminCentralReportPage() {
    return <CentralReportPage />;
}

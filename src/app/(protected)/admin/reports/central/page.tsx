import { CentralReportPage } from "@/features/reports/components/central/central-report-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Laporan Konsolidasi HQ (Multi-Store) | POS System",
    description: "Laporan terpusat multi-store untuk manajemen HQ mencakup omset, laba rugi, perbandingan cabang, dan valuasi stok.",
};

export default function AdminCentralReportPage() {
    return <CentralReportPage />;
}

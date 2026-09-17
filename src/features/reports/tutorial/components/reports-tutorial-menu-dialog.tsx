"use client";

import React, { useMemo } from "react";
import { FeatureTutorialDialog, type FeatureTutorialItem } from "@/components/shared/feature-tutorial-dialog";
import { useReportsTutorialStore } from "@/stores/reports-tutorial-store";
import { REPORTS_TUTORIAL_LIST } from "../constants/reports-tutorial-constants";
import type { ReportsTutorialId } from "../types/reports-tutorial";
import {
    IconReportAnalytics,
    IconReceipt,
    IconChartBar,
    IconShoppingCart,
    IconCreditCard,
} from "@tabler/icons-react";
import { useAppRouter } from "@/hooks/use-app-router";

const REPORTS_TUTORIAL_ICONS: Record<
    ReportsTutorialId,
    React.ComponentType<{ size?: number; className?: string }>
> = {
    jelajah_laba_rugi: IconReportAnalytics,
    jelajah_penjualan: IconReceipt,
    jelajah_kategori: IconChartBar,
    jelajah_pembelian: IconShoppingCart,
    jelajah_pengeluaran: IconCreditCard,
};

/** Route sub-halaman untuk setiap flow tutorial. */
const REPORTS_TUTORIAL_ROUTES: Record<ReportsTutorialId, string> = {
    jelajah_laba_rugi: "/admin/reports/laba-rugi",
    jelajah_penjualan: "/admin/reports/sales",
    jelajah_kategori: "/admin/reports/sales/by-category",
    jelajah_pembelian: "/admin/reports/pembelian",
    jelajah_pengeluaran: "/admin/reports/pengeluaran",
};

/** Elemen penanda kesiapan halaman per flow (dipakai waitForElement). */
const REPORTS_TUTORIAL_READY_SELECTOR: Record<ReportsTutorialId, string> = {
    jelajah_laba_rugi: "#laba-rugi-header",
    jelajah_penjualan: "#penjualan-header",
    jelajah_kategori: "#kategori-header",
    jelajah_pembelian: "#pembelian-header",
    jelajah_pengeluaran: "#pengeluaran-header",
};

async function waitForElement(selector: string, timeout = 3500): Promise<Element | null> {
    if (typeof document === "undefined") return null;
    const start = Date.now();
    while (Date.now() - start < timeout) {
        const el = document.querySelector(selector);
        if (el) return el;
        await new Promise((r) => setTimeout(r, 50));
    }
    return document.querySelector(selector);
}

export function ReportsTutorialMenuDialog() {
    const router = useAppRouter();
    const isMenuOpen = useReportsTutorialStore((state) => state.isMenuOpen);
    const setMenuOpen = useReportsTutorialStore((state) => state.setMenuOpen);
    const startTutorial = useReportsTutorialStore((state) => state.startTutorial);

    const handleSelectTutorial = async (id: string) => {
        setMenuOpen(false);

        const tutorialId = id as ReportsTutorialId;
        const targetRoute = REPORTS_TUTORIAL_ROUTES[tutorialId];
        const readySelector = REPORTS_TUTORIAL_READY_SELECTOR[tutorialId];

        if (typeof window !== "undefined") {
            const currentPath = window.location.pathname;
            if (targetRoute && currentPath !== targetRoute) {
                router.push(targetRoute);
                await waitForElement(readySelector, 3500);
            }
        }

        startTutorial(tutorialId);
    };

    const tutorialItems: FeatureTutorialItem[] = useMemo(() => {
        return REPORTS_TUTORIAL_LIST.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category,
            stepCount: item.stepCount,
            badge: item.badge,
            isAvailable: item.isAvailable,
            icon: REPORTS_TUTORIAL_ICONS[item.id],
        }));
    }, []);

    return (
        <FeatureTutorialDialog
            open={isMenuOpen}
            onOpenChange={setMenuOpen}
            title="Pusat Panduan Modul Laporan"
            subtitle="Pilih simulasi interaktif untuk memahami laporan penjualan, pembelian, pengeluaran, laba rugi, dan analisis per kategori."
            items={tutorialItems}
            onSelectTutorial={handleSelectTutorial}
            infoNote="💡 Simulasi laporan bersifat edukatif, menggunakan data contoh, dan tidak mengubah data toko Anda."
        />
    );
}

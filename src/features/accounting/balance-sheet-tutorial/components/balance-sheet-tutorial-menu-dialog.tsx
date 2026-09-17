"use client";

import React, { useMemo } from "react";
import { FeatureTutorialDialog, type FeatureTutorialItem } from "@/components/shared/feature-tutorial-dialog";
import { useBalanceSheetTutorialStore } from "@/stores/balance-sheet-tutorial-store";
import { BALANCE_SHEET_TUTORIAL_LIST } from "../constants/balance-sheet-tutorial-constants";
import type { BalanceSheetTutorialId } from "../types/balance-sheet-tutorial";
import {
    IconScale,
    IconChartBar,
} from "@tabler/icons-react";
import { useAppRouter } from "@/hooks/use-app-router";

const BALANCE_SHEET_TUTORIAL_ICONS: Record<
    BalanceSheetTutorialId,
    React.ComponentType<{ size?: number; className?: string }>
> = {
    jelajah_neraca: IconScale,
    mode_laporan: IconChartBar,
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

export function BalanceSheetTutorialMenuDialog() {
    const router = useAppRouter();
    const isMenuOpen = useBalanceSheetTutorialStore((state) => state.isMenuOpen);
    const setMenuOpen = useBalanceSheetTutorialStore((state) => state.setMenuOpen);
    const startTutorial = useBalanceSheetTutorialStore((state) => state.startTutorial);

    const handleSelectTutorial = async (id: string) => {
        setMenuOpen(false);

        if (typeof window !== "undefined") {
            const currentPath = window.location.pathname;

            if (currentPath !== "/admin/accounting/balance-sheet") {
                router.push("/admin/accounting/balance-sheet");
                await waitForElement("#neraca-status-card", 3500);
            }
        }

        startTutorial(id as BalanceSheetTutorialId);
    };

    const tutorialItems: FeatureTutorialItem[] = useMemo(() => {
        return BALANCE_SHEET_TUTORIAL_LIST.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category,
            stepCount: item.stepCount,
            badge: item.badge,
            isAvailable: item.isAvailable,
            icon: BALANCE_SHEET_TUTORIAL_ICONS[item.id],
        }));
    }, []);

    return (
        <FeatureTutorialDialog
            open={isMenuOpen}
            onOpenChange={setMenuOpen}
            title="Pusat Panduan Laporan Neraca"
            subtitle="Pilih simulasi interaktif untuk memahami struktur posisi keuangan (Aset, Kewajiban, Ekuitas) dan perbandingan multi-mode laporan."
            items={tutorialItems}
            onSelectTutorial={handleSelectTutorial}
            infoNote="💡 Mode simulasi Neraca bersifat edukatif dan aman tanpa mengubah data laporan toko Anda."
        />
    );
}

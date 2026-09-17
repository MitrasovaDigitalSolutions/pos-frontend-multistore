"use client";

import React, { useMemo } from "react";
import { FeatureTutorialDialog, type FeatureTutorialItem } from "@/components/shared/feature-tutorial-dialog";
import { useJournalTutorialStore } from "@/stores/journal-tutorial-store";
import { JOURNAL_TUTORIAL_LIST } from "../constants/journal-tutorial-constants";
import type { JournalTutorialId } from "../types/journal-tutorial";
import {
    IconBook,
    IconListCheck,
    IconPlus,
} from "@tabler/icons-react";
import { useAppRouter } from "@/hooks/use-app-router";

const JOURNAL_TUTORIAL_ICONS: Record<
    JournalTutorialId,
    React.ComponentType<{ size?: number; className?: string }>
> = {
    buku_besar: IconBook,
    list_jurnal: IconListCheck,
    buat_jurnal: IconPlus,
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

export function JournalTutorialMenuDialog() {
    const router = useAppRouter();
    const isMenuOpen = useJournalTutorialStore((state) => state.isMenuOpen);
    const setMenuOpen = useJournalTutorialStore((state) => state.setMenuOpen);
    const startTutorial = useJournalTutorialStore((state) => state.startTutorial);

    const handleSelectTutorial = async (id: string) => {
        setMenuOpen(false);

        if (typeof window !== "undefined") {
            const currentPath = window.location.pathname;

            if (id === "buku_besar") {
                if (currentPath !== "/admin/accounting/general-ledger") {
                    router.push("/admin/accounting/general-ledger");
                    await waitForElement("#bb-filter-from", 3500);
                }
            } else if (id === "list_jurnal") {
                if (currentPath !== "/admin/accounting/journals") {
                    router.push("/admin/accounting/journals");
                    await waitForElement("#journal-search", 3500);
                }
            } else if (id === "buat_jurnal") {
                const targetUrl = "/admin/accounting/manual-journal?action=new";
                if (currentPath + window.location.search !== targetUrl) {
                    router.push(targetUrl);
                    await waitForElement("#mj-tanggal", 3500);
                }
            }
        }

        startTutorial(id as JournalTutorialId);
    };

    const tutorialItems: FeatureTutorialItem[] = useMemo(() => {
        return JOURNAL_TUTORIAL_LIST.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category,
            stepCount: item.stepCount,
            badge: item.badge,
            isAvailable: item.isAvailable,
            icon: JOURNAL_TUTORIAL_ICONS[item.id],
        }));
    }, []);

    return (
        <FeatureTutorialDialog
            open={isMenuOpen}
            onOpenChange={setMenuOpen}
            title="Pusat Panduan Jurnal & Buku Besar"
            subtitle="Pilih simulasi interaktif alur penjelajahan Buku Besar, pengawasan list jurnal, dan entri jurnal manual."
            items={tutorialItems}
            onSelectTutorial={handleSelectTutorial}
            infoNote="💡 Mode simulasi Jurnal aman dan tidak menyimpan transaksi dummy ke database toko Anda."
        />
    );
}

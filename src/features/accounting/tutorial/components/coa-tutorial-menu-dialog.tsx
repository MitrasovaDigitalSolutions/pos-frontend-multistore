"use client";

import React, { useMemo } from "react";
import { FeatureTutorialDialog, type FeatureTutorialItem } from "@/components/shared/feature-tutorial-dialog";
import { useAccountingTutorialStore } from "@/stores/accounting-tutorial-store";
import { COA_TUTORIAL_LIST } from "../constants/accounting-tutorial-constants";
import type { AccountingTutorialId } from "../types/accounting-tutorial";
import {
    IconPlus,
    IconEdit,
    IconTrash,
} from "@tabler/icons-react";
import { useAppRouter } from "@/hooks/use-app-router";

const COA_TUTORIAL_ICONS: Record<
    AccountingTutorialId,
    React.ComponentType<{ size?: number; className?: string }>
> = {
    tambah_akun: IconPlus,
    edit_akun: IconEdit,
    hapus_akun: IconTrash,
};

async function waitForElement(selector: string, timeout = 3000): Promise<Element | null> {
    if (typeof document === "undefined") return null;
    const start = Date.now();
    while (Date.now() - start < timeout) {
        const el = document.querySelector(selector);
        if (el) return el;
        await new Promise((r) => setTimeout(r, 50));
    }
    return document.querySelector(selector);
}

export function CoaTutorialMenuDialog() {
    const router = useAppRouter();
    const isMenuOpen = useAccountingTutorialStore((state) => state.isMenuOpen);
    const setMenuOpen = useAccountingTutorialStore((state) => state.setMenuOpen);
    const startTutorial = useAccountingTutorialStore((state) => state.startTutorial);

    const handleSelectTutorial = async (id: string) => {
        setMenuOpen(false);

        if (typeof window !== "undefined") {
            const currentPath = window.location.pathname;
            const currentSearch = window.location.search;
            if (currentPath !== "/admin/accounting/coa" || currentSearch.includes("tab=")) {
                router.push("/admin/accounting/coa");
                await waitForElement("#btn-tambah-akun", 3500);
            }
        }

        startTutorial(id as AccountingTutorialId);
    };

    const tutorialItems: FeatureTutorialItem[] = useMemo(() => {
        return COA_TUTORIAL_LIST.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category,
            stepCount: item.stepCount,
            badge: item.badge,
            isAvailable: item.isAvailable,
            icon: COA_TUTORIAL_ICONS[item.id],
        }));
    }, []);

    return (
        <FeatureTutorialDialog
            open={isMenuOpen}
            onOpenChange={setMenuOpen}
            title="Pusat Panduan Chart of Accounts"
            subtitle="Pilih simulasi interaktif alur pendaftaran, pembaruan, dan penghapusan akun perkiraan akuntansi."
            items={tutorialItems}
            onSelectTutorial={handleSelectTutorial}
            infoNote="💡 Mode simulasi Chart of Accounts aman dan tidak memodifikasi database toko Anda."
        />
    );
}

"use client";

import React, { useMemo } from "react";
import { FeatureTutorialDialog, type FeatureTutorialItem } from "@/components/shared/feature-tutorial-dialog";
import { useCashTutorialStore } from "@/stores/cash-tutorial-store";
import { CASH_TUTORIAL_LIST } from "../constants/cash-tutorial-constants";
import type { CashTutorialId } from "../types/cash-tutorial";
import {
    IconWallet,
    IconPlus,
    IconArrowsRightLeft,
    IconArrowsExchange,
    IconPencil,
} from "@tabler/icons-react";
import { useAppRouter } from "@/hooks/use-app-router";

const CASH_TUTORIAL_ICONS: Record<
    CashTutorialId,
    React.ComponentType<{ size?: number; className?: string }>
> = {
    jelajah_kas: IconWallet,
    tambah_akun_kas: IconPlus,
    mutasi_kas: IconArrowsRightLeft,
    transfer_kas: IconArrowsExchange,
    kelola_akun_kas: IconPencil,
};

/** Route sub-halaman untuk setiap flow tutorial (semua di dashboard kas). */
const CASH_TUTORIAL_ROUTES: Record<CashTutorialId, string> = {
    jelajah_kas: "/admin/cash-accounts",
    tambah_akun_kas: "/admin/cash-accounts",
    mutasi_kas: "/admin/cash-accounts",
    transfer_kas: "/admin/cash-accounts",
    kelola_akun_kas: "/admin/cash-accounts",
};

/** Elemen penanda kesiapan halaman per flow (dipakai waitForElement). */
const CASH_TUTORIAL_READY_SELECTOR: Record<CashTutorialId, string> = {
    jelajah_kas: "#kas-ledger-table",
    tambah_akun_kas: "#kas-btn-add",
    mutasi_kas: "#kas-accounts-list",
    transfer_kas: "#kas-btn-transfer",
    kelola_akun_kas: "#kas-accounts-list",
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

export function CashTutorialMenuDialog() {
    const router = useAppRouter();
    const isMenuOpen = useCashTutorialStore((state) => state.isMenuOpen);
    const setMenuOpen = useCashTutorialStore((state) => state.setMenuOpen);
    const startTutorial = useCashTutorialStore((state) => state.startTutorial);

    const handleSelectTutorial = async (id: string) => {
        setMenuOpen(false);

        const tutorialId = id as CashTutorialId;
        const targetRoute = CASH_TUTORIAL_ROUTES[tutorialId];
        const readySelector = CASH_TUTORIAL_READY_SELECTOR[tutorialId];

        if (typeof window !== "undefined") {
            const currentPath = window.location.pathname.replace(/\/$/, "");
            const targetPath = targetRoute.replace(/\/$/, "");
            if (targetPath && currentPath !== targetPath) {
                router.push(targetRoute);
                await waitForElement(readySelector, 3500);
            }
        }

        startTutorial(tutorialId);
    };

    const tutorialItems: FeatureTutorialItem[] = useMemo(() => {
        return CASH_TUTORIAL_LIST.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category,
            stepCount: item.stepCount,
            badge: item.badge,
            isAvailable: item.isAvailable,
            icon: CASH_TUTORIAL_ICONS[item.id],
        }));
    }, []);

    return (
        <FeatureTutorialDialog
            open={isMenuOpen}
            onOpenChange={setMenuOpen}
            title="Pusat Panduan Modul Kas & Bank"
            subtitle="Pilih simulasi interaktif untuk memahami pengelolaan akun kas, mutasi manual, transfer saldo, dan buku arus kas."
            items={tutorialItems}
            onSelectTutorial={handleSelectTutorial}
            infoNote="💡 Simulasi kas & bank bersifat edukatif, menggunakan data contoh, dan tidak mengubah saldo maupun data toko Anda."
        />
    );
}

"use client";

import React, { useMemo } from "react";
import { FeatureTutorialDialog, type FeatureTutorialItem } from "@/components/shared/feature-tutorial-dialog";
import { useHutangTutorialStore } from "@/stores/hutang-tutorial-store";
import { HUTANG_TUTORIAL_LIST } from "../constants/hutang-tutorial-constants";
import type { HutangTutorialId } from "../types/hutang-tutorial";
import {
    IconUsers,
    IconBuilding,
    IconFileInvoice,
    IconHistory,
} from "@tabler/icons-react";
import { useAppRouter } from "@/hooks/use-app-router";

const HUTANG_TUTORIAL_ICONS: Record<
    HutangTutorialId,
    React.ComponentType<{ size?: number; className?: string }>
> = {
    jelajah_hutang_member: IconUsers,
    jelajah_hutang_sales: IconBuilding,
    jelajah_hutang_supplier: IconFileInvoice,
    jelajah_pembayaran_member: IconHistory,
};

/** Route sub-halaman untuk setiap flow tutorial. */
const HUTANG_TUTORIAL_ROUTES: Record<HutangTutorialId, string> = {
    jelajah_hutang_member: "/admin/debts/member",
    jelajah_hutang_sales: "/admin/debts/sales",
    jelajah_hutang_supplier: "/admin/debts/sales/tutorial-mock-supplier-1?nama=PT%20Sumber%20Rejeki%20(Demo)",
    jelajah_pembayaran_member: "/admin/debts/member-payments",
};

/** Elemen penanda kesiapan halaman per flow (dipakai waitForElement). */
const HUTANG_TUTORIAL_READY_SELECTOR: Record<HutangTutorialId, string> = {
    jelajah_hutang_member: "#hutang-member-header",
    jelajah_hutang_sales: "#hutang-sales-header",
    jelajah_hutang_supplier: "#hutang-detail-header",
    jelajah_pembayaran_member: "#pembayaran-member-header",
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

export function HutangTutorialMenuDialog() {
    const router = useAppRouter();
    const isMenuOpen = useHutangTutorialStore((state) => state.isMenuOpen);
    const setMenuOpen = useHutangTutorialStore((state) => state.setMenuOpen);
    const startTutorial = useHutangTutorialStore((state) => state.startTutorial);

    const handleSelectTutorial = async (id: string) => {
        setMenuOpen(false);

        const tutorialId = id as HutangTutorialId;
        const targetRoute = HUTANG_TUTORIAL_ROUTES[tutorialId];
        const readySelector = HUTANG_TUTORIAL_READY_SELECTOR[tutorialId];

        if (typeof window !== "undefined") {
            const currentPath = window.location.pathname;
            const targetPath = targetRoute.split("?")[0];
            if (targetPath && currentPath !== targetPath) {
                router.push(targetRoute);
                await waitForElement(readySelector, 3500);
            }
        }

        startTutorial(tutorialId);
    };

    const tutorialItems: FeatureTutorialItem[] = useMemo(() => {
        return HUTANG_TUTORIAL_LIST.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category,
            stepCount: item.stepCount,
            badge: item.badge,
            isAvailable: item.isAvailable,
            icon: HUTANG_TUTORIAL_ICONS[item.id],
        }));
    }, []);

    return (
        <FeatureTutorialDialog
            open={isMenuOpen}
            onOpenChange={setMenuOpen}
            title="Pusat Panduan Modul Hutang"
            subtitle="Pilih simulasi interaktif untuk memahami piutang member, hutang supplier, dan riwayat pembayaran hutang."
            items={tutorialItems}
            onSelectTutorial={handleSelectTutorial}
            infoNote="💡 Simulasi hutang bersifat edukatif, menggunakan data contoh, dan tidak mengubah data toko Anda."
        />
    );
}

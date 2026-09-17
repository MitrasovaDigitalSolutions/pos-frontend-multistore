"use client";

import React, { useMemo } from "react";
import { FeatureTutorialDialog, type FeatureTutorialItem } from "@/components/shared/feature-tutorial-dialog";
import { useExpensesTutorialStore } from "@/stores/expenses-tutorial-store";
import { EXPENSES_TUTORIAL_LIST } from "../constants/expenses-tutorial-constants";
import type { ExpensesTutorialId } from "../types/expenses-tutorial";
import {
    IconReceipt,
    IconCash,
    IconPencil,
    IconCategory,
} from "@tabler/icons-react";
import { useAppRouter } from "@/hooks/use-app-router";

const EXPENSES_TUTORIAL_ICONS: Record<
    ExpensesTutorialId,
    React.ComponentType<{ size?: number; className?: string }>
> = {
    jelajah_pengeluaran: IconReceipt,
    catat_pengeluaran: IconCash,
    edit_pengeluaran: IconPencil,
    kelola_kategori: IconCategory,
};

/** Route sub-halaman untuk setiap flow tutorial. */
const EXPENSES_TUTORIAL_ROUTES: Record<ExpensesTutorialId, string> = {
    jelajah_pengeluaran: "/admin/expenses",
    catat_pengeluaran: "/admin/expenses",
    edit_pengeluaran: "/admin/expenses",
    kelola_kategori: "/admin/expenses/categories",
};

/** Elemen penanda kesiapan halaman per flow (dipakai waitForElement). */
const EXPENSES_TUTORIAL_READY_SELECTOR: Record<ExpensesTutorialId, string> = {
    jelajah_pengeluaran: "#pengeluaran-table",
    catat_pengeluaran: "#pengeluaran-btn-add",
    edit_pengeluaran: "#pengeluaran-table",
    kelola_kategori: "#kategori-table",
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

export function ExpensesTutorialMenuDialog() {
    const router = useAppRouter();
    const isMenuOpen = useExpensesTutorialStore((state) => state.isMenuOpen);
    const setMenuOpen = useExpensesTutorialStore((state) => state.setMenuOpen);
    const startTutorial = useExpensesTutorialStore((state) => state.startTutorial);

    const handleSelectTutorial = async (id: string) => {
        setMenuOpen(false);

        const tutorialId = id as ExpensesTutorialId;
        const targetRoute = EXPENSES_TUTORIAL_ROUTES[tutorialId];
        const readySelector = EXPENSES_TUTORIAL_READY_SELECTOR[tutorialId];

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
        return EXPENSES_TUTORIAL_LIST.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category,
            stepCount: item.stepCount,
            badge: item.badge,
            isAvailable: item.isAvailable,
            icon: EXPENSES_TUTORIAL_ICONS[item.id],
        }));
    }, []);

    return (
        <FeatureTutorialDialog
            open={isMenuOpen}
            onOpenChange={setMenuOpen}
            title="Pusat Panduan Modul Pengeluaran"
            subtitle="Pilih simulasi interaktif untuk memahami pencatatan pengeluaran kas, kategori, serta aksi ubah dan hapus."
            items={tutorialItems}
            onSelectTutorial={handleSelectTutorial}
            infoNote="💡 Simulasi pengeluaran bersifat edukatif, menggunakan data contoh, dan tidak mengubah data toko Anda."
        />
    );
}

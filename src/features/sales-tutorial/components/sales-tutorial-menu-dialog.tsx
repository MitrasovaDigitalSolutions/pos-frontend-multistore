"use client";

import React, { useMemo } from "react";
import { FeatureTutorialDialog, type FeatureTutorialItem } from "@/components/shared/feature-tutorial-dialog";
import { useSalesTutorialStore } from "@/stores/sales-tutorial-store";
import { SALES_TUTORIAL_METAS } from "../constants/sales-tutorial-constants";
import { IconCash, IconReceipt } from "@tabler/icons-react";
import { useAppRouter } from "@/hooks/use-app-router";

async function waitForPathname(substr: string, timeout = 4000): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        if (typeof window !== "undefined" && window.location.pathname.includes(substr)) {
            return true;
        }
        await new Promise((r) => setTimeout(r, 50));
    }
    return false;
}

async function waitForElement(selector: string, timeout = 3500): Promise<Element | null> {
    if (typeof document === "undefined") return null;
    const start = Date.now();
    while (Date.now() - start < timeout) {
        const el = document.querySelector(selector);
        if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) return el;
        }
        await new Promise((r) => setTimeout(r, 50));
    }
    return document.querySelector(selector);
}

export function SalesTutorialMenuDialog() {
    const router = useAppRouter();
    const isMenuOpen = useSalesTutorialStore((state) => state.isMenuOpen);
    const setMenuOpen = useSalesTutorialStore((state) => state.setMenuOpen);
    const startTutorial = useSalesTutorialStore((state) => state.startTutorial);

    const handleSelectTutorial = async (id: string) => {
        setMenuOpen(false);

        if (id === "cash_drawer") {
            if (typeof window !== "undefined" && !window.location.pathname.startsWith("/admin/cash-drawer")) {
                router.push("/admin/cash-drawer");
                await waitForPathname("/admin/cash-drawer");
                await waitForElement("#cash-drawer-container", 3500);
                await new Promise((r) => setTimeout(r, 150));
            }
            startTutorial("cash_drawer");
        } else if (id === "transactions_list") {
            if (typeof window !== "undefined" && window.location.pathname !== "/admin/transactions") {
                router.push("/admin/transactions");
                await waitForPathname("/admin/transactions");
                await waitForElement("#transactions-container", 3500);
                await new Promise((r) => setTimeout(r, 150));
            }
            startTutorial("transactions_list");
        }
    };

    const tutorialItems: FeatureTutorialItem[] = useMemo(() => {
        return SALES_TUTORIAL_METAS.map((meta) => ({
            id: meta.id,
            title: meta.title,
            description: meta.description,
            badge: meta.badge,
            duration: meta.duration,
            stepCount: meta.stepCount,
            isAvailable: meta.isAvailable,
            icon:
                meta.id === "cash_drawer" ? (
                    <IconCash size={20} className="text-emerald-600" />
                ) : (
                    <IconReceipt size={20} className="text-blue-600" />
                ),
        }));
    }, []);

    return (
        <FeatureTutorialDialog
            open={isMenuOpen}
            onOpenChange={setMenuOpen}
            title="Pusat Panduan & Tutorial Penjualan"
            subtitle="Pelajari kontrol uang fisik laci kasir (Sesi Kasir & Shift) hingga pelacakan riwayat nota belanja konsumen (Daftar Transaksi) langkah demi langkah."
            items={tutorialItems}
            onSelectTutorial={handleSelectTutorial}
        />
    );
}

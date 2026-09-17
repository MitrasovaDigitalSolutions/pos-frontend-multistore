"use client";

import React, { useMemo } from "react";
import { FeatureTutorialDialog, type FeatureTutorialItem } from "@/components/shared/feature-tutorial-dialog";
import { useStockTutorialStore } from "@/stores/stock-tutorial-store";
import { STOCK_TUTORIAL_METAS } from "../constants/stock-tutorial-constants";
import type { StockTutorialId } from "../types/stock-tutorial";
import { IconClipboardCheck, IconActivity, IconFileAnalytics } from "@tabler/icons-react";
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

export function StockTutorialMenuDialog() {
    const router = useAppRouter();
    const isMenuOpen = useStockTutorialStore((state) => state.isMenuOpen);
    const setMenuOpen = useStockTutorialStore((state) => state.setMenuOpen);
    const startTutorial = useStockTutorialStore((state) => state.startTutorial);

    const handleSelectTutorial = async (id: string) => {
        if (id === "stock_opname" || id === "stock_adjustment") {
            setMenuOpen(false);

            if (typeof window !== "undefined" && window.location.pathname !== "/admin/inventory/stock-opname") {
                router.push("/admin/inventory/stock-opname");
                await waitForPathname("/inventory/stock-opname");
                await waitForElement("#stock-opname-header", 3500);
                await new Promise((r) => setTimeout(r, 150));
            }

            startTutorial(id as StockTutorialId);
        } else if (id === "stock_ledger") {
            setMenuOpen(false);

            if (typeof window !== "undefined" && window.location.pathname !== "/admin/inventory/stock-ledger") {
                router.push("/admin/inventory/stock-ledger");
                await waitForPathname("/inventory/stock-ledger");
                await waitForElement("#stock-ledger-header", 3500);
                await new Promise((r) => setTimeout(r, 150));
            }

            startTutorial(id as StockTutorialId);
        }
    };

    const tutorialItems: FeatureTutorialItem[] = useMemo(() => {
        return STOCK_TUTORIAL_METAS.map((meta) => ({
            id: meta.id,
            title: meta.title,
            description: meta.description,
            badge: meta.badge,
            duration: meta.duration,
            stepCount: meta.stepCount,
            isAvailable: meta.isAvailable,
            icon:
                meta.id === "stock_adjustment" ? (
                    <IconActivity size={20} className="text-amber-600" />
                ) : meta.id === "stock_ledger" ? (
                    <IconFileAnalytics size={20} className="text-blue-600" />
                ) : (
                    <IconClipboardCheck size={20} className="text-emerald-600" />
                ),
        }));
    }, []);

    return (
        <FeatureTutorialDialog
            open={isMenuOpen}
            onOpenChange={setMenuOpen}
            title="Pusat Panduan & Tutorial Inventori"
            subtitle="Pelajari alur audit fisik berkala (Stock Opname), koreksi cepat per produk (Penyesuaian Stok), hingga buku besar mutasi barang (Kartu Stok) langkah demi langkah."
            items={tutorialItems}
            onSelectTutorial={handleSelectTutorial}
        />
    );
}

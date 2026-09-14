"use client";

import React, { useMemo } from "react";
import { FeatureTutorialDialog, type FeatureTutorialItem } from "@/components/shared/feature-tutorial-dialog";
import { useConsignmentTutorialStore } from "@/stores/consignment-tutorial-store";
import { CONSIGNMENT_TUTORIAL_METAS } from "../constants/consignment-tutorial-constants";
import { IconPackageImport, IconCash } from "@tabler/icons-react";
import { useAppRouter } from "@/hooks/use-app-router";

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

export function ConsignmentTutorialMenuDialog() {
    const router = useAppRouter();
    const isMenuOpen = useConsignmentTutorialStore((state) => state.isMenuOpen);
    const setMenuOpen = useConsignmentTutorialStore((state) => state.setMenuOpen);
    const startTutorial = useConsignmentTutorialStore((state) => state.startTutorial);

    const handleSelectTutorial = async (id: string) => {
        if (id === "consignment_create") {
            setMenuOpen(false);

            if (typeof window !== "undefined" && window.location.pathname !== "/admin/consignment/create") {
                router.push("/admin/consignment/create");
                await waitForElement("#cons-supplier-field", 3500);
            }

            startTutorial("consignment_create");
        } else if (id === "consignment_payment") {
            setMenuOpen(false);

            if (typeof window !== "undefined" && window.location.pathname !== "/admin/consignment/payment") {
                router.push("/admin/consignment/payment");
                await waitForElement("#cons-payment-filter", 3500);
            }

            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("consignment-payment-tutorial-inject-mock"));
            }

            startTutorial("consignment_payment");
        }
    };

    const tutorialItems: FeatureTutorialItem[] = useMemo(() => {
        return CONSIGNMENT_TUTORIAL_METAS.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category,
            stepCount: item.stepCount,
            badge: item.badge,
            isAvailable: Boolean(item.isAvailable),
            icon: item.id === "consignment_payment" ? IconCash : IconPackageImport,
        }));
    }, []);

    return (
        <FeatureTutorialDialog
            open={isMenuOpen}
            onOpenChange={setMenuOpen}
            title="Pusat Panduan & Tutorial Konsinyasi"
            subtitle="Pelajari alur penerimaan titip jual, stok off-book, hingga pelunasan penjualan kasir & retur otomatis."
            items={tutorialItems}
            onSelectTutorial={handleSelectTutorial}
        />
    );
}

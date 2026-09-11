"use client";

import React, { useMemo } from "react";
import { FeatureTutorialDialog, type FeatureTutorialItem } from "@/components/shared/feature-tutorial-dialog";
import { usePurchaseTutorialStore } from "@/stores/purchase-tutorial-store";
import { PURCHASE_TUTORIAL_LIST } from "../constants/purchase-tutorial-constants";
import type { PurchaseTutorialId } from "../types/purchase-tutorial";
import {
    IconFileInvoice,
    IconTruckDelivery,
    IconReceiptTax,
    IconArrowBackUp,
} from "@tabler/icons-react";
import { useAppRouter } from "@/hooks/use-app-router";

const PURCHASE_TUTORIAL_ICONS: Record<
    PurchaseTutorialId,
    React.ComponentType<{ size?: number; className?: string }>
> = {
    po_create: IconFileInvoice,
    receiving_create: IconTruckDelivery,
    payment_create: IconReceiptTax,
    return_create: IconArrowBackUp,
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

export function PurchaseTutorialMenuDialog() {
    const router = useAppRouter();
    const isMenuOpen = usePurchaseTutorialStore((state) => state.isMenuOpen);
    const setMenuOpen = usePurchaseTutorialStore((state) => state.setMenuOpen);
    const startTutorial = usePurchaseTutorialStore((state) => state.startTutorial);

    const handleSelectTutorial = async (id: string) => {
        if (id === "po_create") {
            setMenuOpen(false);

            if (typeof window !== "undefined" && window.location.pathname !== "/admin/purchase/order/new") {
                router.push("/admin/purchase/order/new");
                await waitForElement("#po-barcode-box", 3500);
            }

            startTutorial("po_create");
        }
    };

    const tutorialItems: FeatureTutorialItem[] = useMemo(() => {
        return PURCHASE_TUTORIAL_LIST.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category,
            stepCount: item.stepCount,
            badge: item.badge,
            isAvailable: Boolean(item.isAvailable),
            icon: PURCHASE_TUTORIAL_ICONS[item.id],
        }));
    }, []);

    return (
        <FeatureTutorialDialog
            open={isMenuOpen}
            onOpenChange={setMenuOpen}
            title="Panduan Fitur Pembelian"
            subtitle="Pilih modul simulasi untuk melihat alur pengadaan barang secara interaktif"
            items={tutorialItems}
            onSelectTutorial={handleSelectTutorial}
        />
    );
}

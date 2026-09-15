"use client";

import React, { useMemo } from "react";
import { FeatureTutorialDialog, type FeatureTutorialItem } from "@/components/shared/feature-tutorial-dialog";
import { useTransferTutorialStore } from "@/stores/transfer-tutorial-store";
import { TRANSFER_TUTORIAL_METAS } from "../constants/transfer-tutorial-constants";
import {
    IconArrowsLeftRight,
    IconClipboardList,
    IconPackageExport,
    IconPackageImport,
    IconScale,
} from "@tabler/icons-react";
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

export function TransferTutorialMenuDialog() {
    const router = useAppRouter();
    const isMenuOpen = useTransferTutorialStore((state) => state.isMenuOpen);
    const setMenuOpen = useTransferTutorialStore((state) => state.setMenuOpen);
    const startTutorial = useTransferTutorialStore((state) => state.startTutorial);

    const handleSelectTutorial = async (id: string) => {
        if (id === "request_transfer_create") {
            setMenuOpen(false);

            if (typeof window !== "undefined" && window.location.pathname !== "/admin/request-transfer/create") {
                router.push("/admin/request-transfer/create");
                await waitForPathname("/request-transfer/create");
                await waitForElement("#req-target-store", 3500);
                await new Promise((r) => setTimeout(r, 150));
            }

            startTutorial("request_transfer_create");
        } else if (id === "request_transfer_incoming") {
            setMenuOpen(false);

            if (typeof window !== "undefined" && window.location.pathname !== "/admin/request-transfer/incoming") {
                router.push("/admin/request-transfer/incoming");
                await waitForPathname("/request-transfer/incoming");
                await waitForElement("#req-incoming-list-header", 3500);
                await new Promise((r) => setTimeout(r, 150));
            }

            startTutorial("request_transfer_incoming");
        } else if (id === "stock_transfer_create") {
            setMenuOpen(false);

            if (typeof window !== "undefined" && window.location.pathname !== "/admin/inventory/stock-transfer") {
                router.push("/admin/inventory/stock-transfer");
                await waitForPathname("/inventory/stock-transfer");
                await waitForElement("#transfer-list-header", 3500);
                await new Promise((r) => setTimeout(r, 150));
            }

            startTutorial("stock_transfer_create");
        } else if (id === "stock_transfer_receive") {
            setMenuOpen(false);

            if (typeof window !== "undefined" && window.location.pathname !== "/admin/inventory/stock-transfer/terima") {
                router.push("/admin/inventory/stock-transfer/terima");
                await waitForPathname("/stock-transfer/terima");
                await waitForElement("#transfer-list-header", 3500);
                await new Promise((r) => setTimeout(r, 150));
            }

            startTutorial("stock_transfer_receive");
        } else if (id === "stock_transfer_validation") {
            setMenuOpen(false);

            if (typeof window !== "undefined" && window.location.pathname !== "/admin/inventory/stock-transfer/validasi") {
                router.push("/admin/inventory/stock-transfer/validasi");
                await waitForPathname("/stock-transfer/validasi");
                await waitForElement("#transfer-list-header", 3500);
                await new Promise((r) => setTimeout(r, 150));
            }

            startTutorial("stock_transfer_validation");
        }
    };

    const tutorialItems: FeatureTutorialItem[] = useMemo(() => {
        return TRANSFER_TUTORIAL_METAS.map((item) => {
            let IconComponent = IconArrowsLeftRight;
            if (item.id === "request_transfer_create") IconComponent = IconClipboardList;
            if (item.id === "request_transfer_incoming") IconComponent = IconPackageImport;
            if (item.id === "stock_transfer_create") IconComponent = IconPackageExport;
            if (item.id === "stock_transfer_receive") IconComponent = IconPackageImport;
            if (item.id === "stock_transfer_validation") IconComponent = IconScale;

            return {
                id: item.id,
                title: item.title,
                description: item.description,
                category: item.category,
                stepCount: item.stepCount,
                badge: item.badge,
                isAvailable: Boolean(item.isAvailable),
                icon: IconComponent,
            };
        });
    }, []);

    return (
        <FeatureTutorialDialog
            open={isMenuOpen}
            onOpenChange={setMenuOpen}
            title="Pusat Panduan & Tutorial Transfer Stok"
            subtitle="Pelajari tata cara pengajuan permintaan stok (request), pengelolaan pengiriman, hingga penerimaan dan validasi fisik antar toko."
            items={tutorialItems}
            onSelectTutorial={handleSelectTutorial}
        />
    );
}

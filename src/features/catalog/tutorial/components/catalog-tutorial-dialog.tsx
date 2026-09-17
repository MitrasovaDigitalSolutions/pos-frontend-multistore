"use client";

import React, { useMemo } from "react";
import { FeatureTutorialDialog, type FeatureTutorialItem } from "@/components/shared/feature-tutorial-dialog";
import { useCatalogTutorialStore } from "@/stores/catalog-tutorial-store";
import { CATALOG_TUTORIAL_LIST } from "../constants/catalog-tutorial-constants";
import type { CatalogTutorialId } from "../types/catalog-tutorial";
import { IconPackage, IconBuildingStore } from "@tabler/icons-react";
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

export function CatalogTutorialDialog() {
    const router = useAppRouter();
    const isMenuOpen = useCatalogTutorialStore((state) => state.isMenuOpen);
    const setMenuOpen = useCatalogTutorialStore((state) => state.setMenuOpen);
    const startTutorial = useCatalogTutorialStore((state) => state.startTutorial);

    const handleSelectTutorial = async (id: string) => {
        setMenuOpen(false);

        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/admin/catalog")) {
            router.push("/admin/catalog");
            await waitForElement("#catalog-table-container", 3500);
        }

        startTutorial(id as CatalogTutorialId);
    };

    const tutorialItems: FeatureTutorialItem[] = useMemo(() => {
        return CATALOG_TUTORIAL_LIST.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category,
            stepCount: item.stepCount,
            badge: item.badge,
            isAvailable: item.isAvailable,
            icon: item.id === "pembuatan_katalog" ? IconPackage : IconBuildingStore,
        }));
    }, []);

    return (
        <FeatureTutorialDialog
            open={isMenuOpen}
            onOpenChange={setMenuOpen}
            title="Pusat Panduan Katalog Produk"
            subtitle="Kelola produk master holding dan distribusi harga grosir/ritel ke seluruh cabang toko."
            items={tutorialItems}
            onSelectTutorial={handleSelectTutorial}
            infoNote="Panduan ini dirancang untuk Admin Holding dan beroperasi dalam mode interaktif aman dengan data simulasi multi-cabang."
        />
    );
}

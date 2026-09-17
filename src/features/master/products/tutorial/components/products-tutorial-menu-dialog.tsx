"use client";

import React, { useMemo } from "react";
import { FeatureTutorialDialog, type FeatureTutorialItem } from "@/components/shared/feature-tutorial-dialog";
import { useProductsTutorialStore } from "@/stores/products-tutorial-store";
import { PRODUCTS_TUTORIAL_LIST } from "../constants/products-tutorial-constants";
import type { ProductsTutorialId } from "../types/products-tutorial";
import {
    IconPackage,
    IconEdit,
    IconTrash,
    IconFilter,
} from "@tabler/icons-react";
import { useAppRouter } from "@/hooks/use-app-router";

const PRODUCTS_TUTORIAL_ICONS: Record<
    ProductsTutorialId,
    React.ComponentType<{ size?: number; className?: string }>
> = {
    tambah_produk: IconPackage,
    edit_produk: IconEdit,
    hapus_produk: IconTrash,
    filter_produk: IconFilter,
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

export function ProductsTutorialMenuDialog() {
    const router = useAppRouter();
    const isMenuOpen = useProductsTutorialStore((state) => state.isMenuOpen);
    const setMenuOpen = useProductsTutorialStore((state) => state.setMenuOpen);
    const startTutorial = useProductsTutorialStore((state) => state.startTutorial);

    const handleSelectTutorial = async (id: string) => {
        setMenuOpen(false);

        if (typeof window !== "undefined" && window.location.pathname !== "/admin/products") {
            router.push("/admin/products");
            await waitForElement("#product-table-filters", 3500);
        }

        startTutorial(id as ProductsTutorialId);
    };

    const tutorialItems: FeatureTutorialItem[] = useMemo(() => {
        return PRODUCTS_TUTORIAL_LIST.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category,
            stepCount: item.stepCount,
            badge: item.badge,
            isAvailable: item.isAvailable,
            icon: PRODUCTS_TUTORIAL_ICONS[item.id],
        }));
    }, []);

    return (
        <FeatureTutorialDialog
            open={isMenuOpen}
            onOpenChange={setMenuOpen}
            title="Pusat Panduan Master Produk"
            subtitle="Pilih simulasi interaktif alur pengelolaan katalog produk, penyesuaian harga, dan arsip."
            items={tutorialItems}
            onSelectTutorial={handleSelectTutorial}
            infoNote="💡 Mode simulasi Master Produk aman dan tidak memodifikasi database toko Anda."
        />
    );
}

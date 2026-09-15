"use client";

import React, { useMemo } from "react";
import { useSession } from "next-auth/react";
import { hasRole } from "@/constants/roles";
import { FeatureTutorialDialog, type FeatureTutorialItem } from "@/components/shared/feature-tutorial-dialog";
import { useAssetsTutorialStore } from "@/stores/assets-tutorial-store";
import { ASSET_TUTORIAL_LIST } from "../constants/assets-tutorial-constants";
import type { AssetTutorialId } from "../types/assets-tutorial";
import {
    IconPlus,
    IconEdit,
    IconTrendingDown,
    IconLayersIntersect,
    IconTrash,
    IconTags,
} from "@tabler/icons-react";
import { useAppRouter } from "@/hooks/use-app-router";

const ASSETS_TUTORIAL_ICONS: Record<
    AssetTutorialId,
    React.ComponentType<{ size?: number; className?: string }>
> = {
    catat_aset: IconPlus,
    edit_aset: IconEdit,
    susut_single: IconTrendingDown,
    susut_bulk: IconLayersIntersect,
    detail_hapus: IconTrash,
    kategori_aset: IconTags,
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

export function AssetsTutorialMenuDialog() {
    const router = useAppRouter();
    const { data: session } = useSession();
    // ponytail: halaman kategori admin-only, sembunyikan flow-nya dari non-admin
    const isAdmin = hasRole(session?.user?.roles ?? [], "admin");
    const isMenuOpen = useAssetsTutorialStore((state) => state.isMenuOpen);
    const setMenuOpen = useAssetsTutorialStore((state) => state.setMenuOpen);
    const startTutorial = useAssetsTutorialStore((state) => state.startTutorial);

    const handleSelectTutorial = async (id: string) => {
        setMenuOpen(false);

        if (id === "kategori_aset") {
            if (!isAdmin) return;
            if (typeof window !== "undefined" && window.location.pathname !== "/admin/assets/categories") {
                router.push("/admin/assets/categories");
                await waitForElement("#btn-tambah-kategori", 3500);
            }
        } else {
            if (typeof window !== "undefined" && window.location.pathname !== "/admin/assets") {
                router.push("/admin/assets");
                await waitForElement("#btn-catat-aset", 3500);
            }
        }

        startTutorial(id as AssetTutorialId);
    };

    const tutorialItems: FeatureTutorialItem[] = useMemo(() => {
        return ASSET_TUTORIAL_LIST.filter((item) => item.id !== "kategori_aset" || isAdmin).map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category,
            stepCount: item.stepCount,
            badge: item.badge,
            isAvailable: item.isAvailable,
            icon: ASSETS_TUTORIAL_ICONS[item.id],
        }));
    }, [isAdmin]);

    return (
        <FeatureTutorialDialog
            open={isMenuOpen}
            onOpenChange={setMenuOpen}
            title="Pusat Panduan Manajemen Aset"
            subtitle="Pilih simulasi interaktif alur pencatatan aset, penyusutan tunggal/massal, detail riwayat, dan kategori aset."
            items={tutorialItems}
            onSelectTutorial={handleSelectTutorial}
            infoNote="💡 Mode simulasi Manajemen Aset aman dan tidak memodifikasi database toko Anda."
        />
    );
}

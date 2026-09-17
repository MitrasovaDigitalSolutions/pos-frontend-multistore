"use client";

import React, { useMemo } from "react";
import { FeatureTutorialDialog, type FeatureTutorialItem } from "@/components/shared/feature-tutorial-dialog";
import { useSettingsTutorialStore } from "@/stores/settings-tutorial-store";
import { SETTINGS_TUTORIAL_LIST } from "../constants/settings-tutorial-constants";
import type { SettingsTutorialId } from "../types/settings-tutorial";
import {
    IconBuildingStore,
    IconAdjustments,
    IconPackage,
    IconWallet,
    IconPrinter,
} from "@tabler/icons-react";
import { useAppRouter } from "@/hooks/use-app-router";
import { useSession } from "next-auth/react";

const SETTINGS_TUTORIAL_ICONS: Record<
    SettingsTutorialId,
    React.ComponentType<{ size?: number; className?: string }>
> = {
    ubah_identitas_toko: IconBuildingStore,
    atur_ppn_poin: IconAdjustments,
    atur_hpp_cabang: IconPackage,
    atur_kas: IconWallet,
    atur_printer: IconPrinter,
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

export function SettingsTutorialMenuDialog() {
    const router = useAppRouter();
    const { data: session } = useSession();
    const userRoles = useMemo(() => session?.user?.roles || [], [session?.user?.roles]);
    const isAdmin = useMemo(() => userRoles.includes("admin"), [userRoles]);

    const isMenuOpen = useSettingsTutorialStore((state) => state.isMenuOpen);
    const setMenuOpen = useSettingsTutorialStore((state) => state.setMenuOpen);
    const startTutorial = useSettingsTutorialStore((state) => state.startTutorial);

    const handleSelectTutorial = async (id: string) => {
        setMenuOpen(false);

        if (typeof window !== "undefined" && window.location.pathname !== "/admin/settings") {
            router.push("/admin/settings");
            await waitForElement("#settings-tab-profile", 3500);
        }

        startTutorial(id as SettingsTutorialId);
    };

    const tutorialItems: FeatureTutorialItem[] = useMemo(() => {
        return SETTINGS_TUTORIAL_LIST
            .filter((item) => !item.adminOnly || isAdmin)
            .map((item) => ({
                id: item.id,
                title: item.title,
                description: item.description,
                category: item.category,
                stepCount: item.stepCount,
                badge: item.badge,
                isAvailable: item.isAvailable,
                icon: SETTINGS_TUTORIAL_ICONS[item.id],
            }));
    }, [isAdmin]);

    return (
        <FeatureTutorialDialog
            open={isMenuOpen}
            onOpenChange={setMenuOpen}
            title="Pusat Panduan Pengaturan Toko"
            subtitle="Pilih simulasi konfigurasi identitas toko, PPN, poin loyalitas, HPP inventori, pemetaan akun kas, atau printer."
            items={tutorialItems}
            onSelectTutorial={handleSelectTutorial}
            infoNote="💡 Mode simulasi Pengaturan Toko aman: form akan otomatis di-reset saat keluar dari panduan tanpa menyimpan perubahan ke database."
        />
    );
}

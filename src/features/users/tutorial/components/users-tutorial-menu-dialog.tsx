"use client";

import React, { useMemo } from "react";
import { FeatureTutorialDialog, type FeatureTutorialItem } from "@/components/shared/feature-tutorial-dialog";
import { useUsersTutorialStore } from "@/stores/users-tutorial-store";
import { USERS_TUTORIAL_LIST } from "../constants/users-tutorial-constants";
import type { UsersTutorialId } from "../types/users-tutorial";
import {
    IconUserPlus,
    IconEdit,
    IconUserOff,
    IconFilter,
} from "@tabler/icons-react";
import { useAppRouter } from "@/hooks/use-app-router";

const USERS_TUTORIAL_ICONS: Record<
    UsersTutorialId,
    React.ComponentType<{ size?: number; className?: string }>
> = {
    tambah_karyawan: IconUserPlus,
    edit_karyawan: IconEdit,
    nonaktifkan_karyawan: IconUserOff,
    filter_karyawan: IconFilter,
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

export function UsersTutorialMenuDialog() {
    const router = useAppRouter();
    const isMenuOpen = useUsersTutorialStore((state) => state.isMenuOpen);
    const setMenuOpen = useUsersTutorialStore((state) => state.setMenuOpen);
    const startTutorial = useUsersTutorialStore((state) => state.startTutorial);

    const handleSelectTutorial = async (id: string) => {
        setMenuOpen(false);

        if (typeof window !== "undefined" && window.location.pathname !== "/admin/employees") {
            router.push("/admin/employees");
            await waitForElement("#btn-tambah-user", 3500);
        }

        startTutorial(id as UsersTutorialId);
    };

    const tutorialItems: FeatureTutorialItem[] = useMemo(() => {
        return USERS_TUTORIAL_LIST.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category,
            stepCount: item.stepCount,
            badge: item.badge,
            isAvailable: item.isAvailable,
            icon: USERS_TUTORIAL_ICONS[item.id],
        }));
    }, []);

    return (
        <FeatureTutorialDialog
            open={isMenuOpen}
            onOpenChange={setMenuOpen}
            title="Pusat Panduan Kelola Karyawan"
            subtitle="Pilih simulasi interaktif alur pengelolaan akun staf, tingkat peran/hak akses, dan keamanan pengguna."
            items={tutorialItems}
            onSelectTutorial={handleSelectTutorial}
            infoNote="💡 Mode simulasi Kelola Karyawan aman dan tidak memodifikasi data akun di toko Anda."
        />
    );
}

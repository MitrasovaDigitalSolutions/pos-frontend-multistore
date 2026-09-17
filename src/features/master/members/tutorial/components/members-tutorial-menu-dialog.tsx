"use client";

import React, { useMemo } from "react";
import { FeatureTutorialDialog, type FeatureTutorialItem } from "@/components/shared/feature-tutorial-dialog";
import { useMembersTutorialStore } from "@/stores/members-tutorial-store";
import { MEMBERS_TUTORIAL_LIST } from "../constants/members-tutorial-constants";
import type { MembersTutorialId } from "../types/members-tutorial";
import {
    IconUserPlus,
    IconEdit,
    IconAward,
    IconTrash,
    IconFilter,
} from "@tabler/icons-react";
import { useAppRouter } from "@/hooks/use-app-router";

const MEMBERS_TUTORIAL_ICONS: Record<
    MembersTutorialId,
    React.ComponentType<{ size?: number; className?: string }>
> = {
    tambah_member: IconUserPlus,
    edit_member: IconEdit,
    sesuaikan_poin: IconAward,
    hapus_member: IconTrash,
    filter_member: IconFilter,
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

export function MembersTutorialMenuDialog() {
    const router = useAppRouter();
    const isMenuOpen = useMembersTutorialStore((state) => state.isMenuOpen);
    const setMenuOpen = useMembersTutorialStore((state) => state.setMenuOpen);
    const startTutorial = useMembersTutorialStore((state) => state.startTutorial);

    const handleSelectTutorial = async (id: string) => {
        setMenuOpen(false);

        if (typeof window !== "undefined" && window.location.pathname !== "/admin/members") {
            router.push("/admin/members");
            await waitForElement("#member-table-filters", 3500);
        }

        startTutorial(id as MembersTutorialId);
    };

    const tutorialItems: FeatureTutorialItem[] = useMemo(() => {
        return MEMBERS_TUTORIAL_LIST.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category,
            stepCount: item.stepCount,
            badge: item.badge,
            isAvailable: item.isAvailable,
            icon: MEMBERS_TUTORIAL_ICONS[item.id],
        }));
    }, []);

    return (
        <FeatureTutorialDialog
            open={isMenuOpen}
            onOpenChange={setMenuOpen}
            title="Pusat Panduan Master Member"
            subtitle="Pilih simulasi interaktif alur pengelolaan data pelanggan, poin loyalitas, dan keanggotaan."
            items={tutorialItems}
            onSelectTutorial={handleSelectTutorial}
            infoNote="💡 Mode simulasi Master Member aman dan tidak memodifikasi database toko Anda."
        />
    );
}

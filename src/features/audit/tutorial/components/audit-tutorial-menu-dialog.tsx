"use client";

import React, { useMemo } from "react";
import { FeatureTutorialDialog, type FeatureTutorialItem } from "@/components/shared/feature-tutorial-dialog";
import { useAuditTutorialStore } from "@/stores/audit-tutorial-store";
import { AUDIT_TUTORIAL_LIST } from "../constants/audit-tutorial-constants";
import type { AuditTutorialId } from "../types/audit-tutorial";
import {
    IconEyeCheck,
    IconFilter,
    IconTimeline,
} from "@tabler/icons-react";
import { useAppRouter } from "@/hooks/use-app-router";

const AUDIT_TUTORIAL_ICONS: Record<
    AuditTutorialId,
    React.ComponentType<{ size?: number; className?: string }>
> = {
    inspeksi_aktivitas: IconEyeCheck,
    filter_aktivitas: IconFilter,
    mode_linimasa: IconTimeline,
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

export function AuditTutorialMenuDialog() {
    const router = useAppRouter();
    const isMenuOpen = useAuditTutorialStore((state) => state.isMenuOpen);
    const setMenuOpen = useAuditTutorialStore((state) => state.setMenuOpen);
    const startTutorial = useAuditTutorialStore((state) => state.startTutorial);

    const handleSelectTutorial = async (id: string) => {
        setMenuOpen(false);

        if (typeof window !== "undefined" && window.location.pathname !== "/admin/audit") {
            router.push("/admin/audit");
            await waitForElement("#btn-view-mode-table", 3500);
        }

        startTutorial(id as AuditTutorialId);
    };

    const tutorialItems: FeatureTutorialItem[] = useMemo(() => {
        return AUDIT_TUTORIAL_LIST.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category,
            stepCount: item.stepCount,
            badge: item.badge,
            isAvailable: item.isAvailable,
            icon: AUDIT_TUTORIAL_ICONS[item.id],
        }));
    }, []);

    return (
        <FeatureTutorialDialog
            open={isMenuOpen}
            onOpenChange={setMenuOpen}
            title="Pusat Panduan Log Aktivitas & Audit"
            subtitle="Pilih panduan interaktif penelusuran rekam jejak sistem, forensik perubahan, dan pemantauan linimasa."
            items={tutorialItems}
            onSelectTutorial={handleSelectTutorial}
            infoNote="💡 Seluruh data log bersifat read-only. Eksplorasi tutorial ini aman dan tidak mempengaruhi data operasional."
        />
    );
}

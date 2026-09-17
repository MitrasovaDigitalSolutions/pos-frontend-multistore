"use client";

import React, { useMemo } from "react";
import { FeatureTutorialDialog, type FeatureTutorialItem } from "@/components/shared/feature-tutorial-dialog";
import { useCentralReportTutorialStore } from "@/stores/central-report-tutorial-store";
import { CENTRAL_REPORT_TUTORIAL_LIST } from "../constants/central-report-tutorial-constants";
import type { CentralReportTutorialId } from "../types/central-report-tutorial";
import { IconBuildingStore } from "@tabler/icons-react";
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

export function CentralReportTutorialDialog() {
    const router = useAppRouter();
    const isMenuOpen = useCentralReportTutorialStore((state) => state.isMenuOpen);
    const setMenuOpen = useCentralReportTutorialStore((state) => state.setMenuOpen);
    const startTutorial = useCentralReportTutorialStore((state) => state.startTutorial);

    const handleSelectTutorial = async (id: string) => {
        setMenuOpen(false);

        if (typeof window !== "undefined" && window.location.pathname !== "/admin/reports/central") {
            router.push("/admin/reports/central");
            await waitForElement("#central-report-header-card", 3500);
        }

        startTutorial(id as CentralReportTutorialId);
    };

    const tutorialItems: FeatureTutorialItem[] = useMemo(() => {
        return CENTRAL_REPORT_TUTORIAL_LIST.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category,
            stepCount: item.stepCount,
            badge: item.badge,
            isAvailable: item.isAvailable,
            icon: IconBuildingStore,
        }));
    }, []);

    return (
        <FeatureTutorialDialog
            open={isMenuOpen}
            onOpenChange={setMenuOpen}
            title="Panduan Laporan Konsolidasi"
            subtitle="Eksklusif Admin Holding: Pelajari analisis multi-cabang, komparasi kinerja toko, dan valuasi aset stok."
            items={tutorialItems}
            onSelectTutorial={handleSelectTutorial}
            infoNote="Tutorial simulasi interaktif ini dikhususkan bagi Administrator Holding dan beroperasi menggunakan simulasi data multi-cabang yang aman."
        />
    );
}

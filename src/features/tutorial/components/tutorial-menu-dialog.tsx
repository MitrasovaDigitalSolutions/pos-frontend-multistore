"use client";

import React, { useMemo } from "react";
import { FeatureTutorialDialog, type FeatureTutorialItem } from "@/components/shared/feature-tutorial-dialog";
import { useTutorialStore } from "@/stores/tutorial-store";
import { TUTORIAL_LIST } from "../constants/tutorial-constants";
import type { TutorialId } from "../types/tutorial";
import {
    IconCashRegister,
    IconShoppingCart,
    IconCreditCard,
    IconPlayerPause,
    IconWifiOff,
    IconReceipt,
    IconHelp,
} from "@tabler/icons-react";

const TUTORIAL_ICONS: Record<TutorialId, React.ComponentType<{ size?: number; className?: string }>> = {
    sesi_kasir: IconCashRegister,
    transaksi_kasir: IconShoppingCart,
    hutang_member: IconCreditCard,
    hold_recall_void: IconPlayerPause,
    transaksi_offline: IconWifiOff,
    cetak_ulang_struk: IconReceipt,
};

export function TutorialMenuDialog() {
    const isMenuOpen = useTutorialStore((state) => state.isMenuOpen);
    const setMenuOpen = useTutorialStore((state) => state.setMenuOpen);
    const startTutorial = useTutorialStore((state) => state.startTutorial);

    const tutorialItems: FeatureTutorialItem[] = useMemo(() => {
        return TUTORIAL_LIST.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category,
            stepCount: item.stepCount,
            badge: item.badge,
            isAvailable: true,
            icon: TUTORIAL_ICONS[item.id] || IconHelp,
        }));
    }, []);

    return (
        <FeatureTutorialDialog
            open={isMenuOpen}
            onOpenChange={setMenuOpen}
            title="Pusat Panduan & Tutorial Kasir"
            subtitle="Pilih modul tutorial interaktif untuk melihat simulasi alur kerja kasir secara langsung"
            items={tutorialItems}
            onSelectTutorial={(id) => startTutorial(id as TutorialId)}
        />
    );
}

"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { IconSparkles } from "@tabler/icons-react";
import { usePurchaseTutorialStore } from "@/stores/purchase-tutorial-store";
import { useConsignmentTutorialStore } from "@/stores/consignment-tutorial-store";
import { useTransferTutorialStore } from "@/stores/transfer-tutorial-store";
import { useStockTutorialStore } from "@/stores/stock-tutorial-store";
import { useProductsTutorialStore } from "@/stores/products-tutorial-store";
import { useMembersTutorialStore } from "@/stores/members-tutorial-store";
import { useAssetsTutorialStore } from "@/stores/assets-tutorial-store";
import { useAccountingTutorialStore } from "@/stores/accounting-tutorial-store";
import { useBalanceSheetTutorialStore } from "@/stores/balance-sheet-tutorial-store";
import { useJournalTutorialStore } from "@/stores/journal-tutorial-store";
import { useSettingsTutorialStore } from "@/stores/settings-tutorial-store";
import { useUsersTutorialStore } from "@/stores/users-tutorial-store";
import { useAuditTutorialStore } from "@/stores/audit-tutorial-store";
import { useTutorialStore } from "@/stores/tutorial-store";
import { toast } from "sonner";

interface AdminTutorialButtonProps {
    className?: string;
    onCustomOpen?: () => void;
}

export function AdminTutorialButton({ className = "", onCustomOpen }: AdminTutorialButtonProps) {
    const pathname = usePathname();

    const handleClick = () => {
        if (onCustomOpen) {
            onCustomOpen();
            return;
        }

        // Feature-specific routing for tutorial dialogs
        if (pathname.startsWith("/admin/purchase")) {
            usePurchaseTutorialStore.getState().setMenuOpen(true);
            return;
        }

        if (pathname.startsWith("/admin/consignment")) {
            useConsignmentTutorialStore.getState().setMenuOpen(true);
            return;
        }

        if (
            pathname.startsWith("/admin/request-transfer") ||
            pathname.startsWith("/admin/stock-transfer") ||
            pathname.startsWith("/admin/inventory/stock-transfer")
        ) {
            useTransferTutorialStore.getState().setMenuOpen(true);
            return;
        }

        if (
            pathname.startsWith("/admin/inventory/stock-opname") ||
            pathname.startsWith("/admin/inventory/stock-ledger") ||
            pathname.startsWith("/admin/inventory/stock")
        ) {
            useStockTutorialStore.getState().setMenuOpen(true);
            return;
        }

        if (pathname.startsWith("/admin/products")) {
            useProductsTutorialStore.getState().setMenuOpen(true);
            return;
        }

        if (pathname.startsWith("/admin/members")) {
            useMembersTutorialStore.getState().setMenuOpen(true);
            return;
        }

        if (pathname.startsWith("/admin/assets")) {
            useAssetsTutorialStore.getState().setMenuOpen(true);
            return;
        }

        if (pathname.startsWith("/admin/accounting/coa")) {
            useAccountingTutorialStore.getState().setMenuOpen(true);
            return;
        }

        if (pathname.includes("/admin/accounting/balance-sheet")) {
            useBalanceSheetTutorialStore.getState().setMenuOpen(true);
            return;
        }

        if (
            pathname.includes("/admin/accounting/general-ledger") ||
            pathname.includes("/admin/accounting/journals") ||
            pathname.includes("/admin/accounting/manual-journal")
        ) {
            useJournalTutorialStore.getState().setMenuOpen(true);
            return;
        }

        if (pathname.startsWith("/admin/settings")) {
            useSettingsTutorialStore.getState().setMenuOpen(true);
            return;
        }

        if (pathname.startsWith("/admin/employees")) {
            useUsersTutorialStore.getState().setMenuOpen(true);
            return;
        }

        if (pathname.startsWith("/admin/audit")) {
            useAuditTutorialStore.getState().setMenuOpen(true);
            return;
        }

        if (pathname.startsWith("/admin/checkout") || pathname === "/admin") {
            useTutorialStore.getState().setMenuOpen(true);
            return;
        }

        // Fallback for other modules not yet implemented
        toast.info("Panduan interaktif untuk modul ini sedang dalam persiapan.");
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/80 hover:bg-emerald-100/90 dark:bg-emerald-950/60 dark:border-emerald-800/80 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 transition-all font-bold text-xs select-none shrink-0 shadow-sm active:scale-95 cursor-pointer group ${className}`}
            title="Pusat Panduan & Tutorial Fitur"
            aria-label="Pusat Panduan & Tutorial"
        >
            <IconSparkles
                size={15}
                className="text-emerald-600 dark:text-emerald-400 group-hover:rotate-12 transition-transform duration-200 animate-pulse"
            />
            <span className="hidden sm:inline font-bold">Panduan</span>
        </button>
    );
}

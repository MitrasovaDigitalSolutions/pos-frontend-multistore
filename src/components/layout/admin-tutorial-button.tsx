"use client";

import React, { useMemo } from "react";
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
import { useReportsTutorialStore } from "@/stores/reports-tutorial-store";
import { useHutangTutorialStore } from "@/stores/hutang-tutorial-store";
import { useSettingsTutorialStore } from "@/stores/settings-tutorial-store";
import { useUsersTutorialStore } from "@/stores/users-tutorial-store";
import { useAuditTutorialStore } from "@/stores/audit-tutorial-store";
import { useSalesTutorialStore } from "@/stores/sales-tutorial-store";
import { useTutorialStore } from "@/stores/tutorial-store";

interface AdminTutorialButtonProps {
    className?: string;
    onCustomOpen?: () => void;
}

export function AdminTutorialButton({ className = "", onCustomOpen }: AdminTutorialButtonProps) {
    const pathname = usePathname();

    const openTutorial = useMemo(() => {
        if (onCustomOpen) {
            return onCustomOpen;
        }

        // Feature-specific routing for tutorial dialogs
        if (pathname.startsWith("/admin/purchase")) {
            return () => usePurchaseTutorialStore.getState().setMenuOpen(true);
        }

        if (pathname.startsWith("/admin/consignment")) {
            return () => useConsignmentTutorialStore.getState().setMenuOpen(true);
        }

        if (
            pathname.startsWith("/admin/request-transfer") ||
            pathname.startsWith("/admin/stock-transfer") ||
            pathname.startsWith("/admin/inventory/stock-transfer")
        ) {
            return () => useTransferTutorialStore.getState().setMenuOpen(true);
        }

        if (
            pathname.startsWith("/admin/inventory/stock-opname") ||
            pathname.startsWith("/admin/inventory/stock-ledger") ||
            pathname.startsWith("/admin/inventory/stock")
        ) {
            return () => useStockTutorialStore.getState().setMenuOpen(true);
        }

        if (pathname.startsWith("/admin/products")) {
            return () => useProductsTutorialStore.getState().setMenuOpen(true);
        }

        if (pathname.startsWith("/admin/members")) {
            return () => useMembersTutorialStore.getState().setMenuOpen(true);
        }

        if (pathname.startsWith("/admin/assets")) {
            return () => useAssetsTutorialStore.getState().setMenuOpen(true);
        }

        if (pathname.startsWith("/admin/accounting/coa")) {
            return () => useAccountingTutorialStore.getState().setMenuOpen(true);
        }

        if (pathname.includes("/admin/accounting/balance-sheet")) {
            return () => useBalanceSheetTutorialStore.getState().setMenuOpen(true);
        }

        if (
            pathname.includes("/admin/accounting/general-ledger") ||
            pathname.includes("/admin/accounting/journals") ||
            pathname.includes("/admin/accounting/manual-journal")
        ) {
            return () => useJournalTutorialStore.getState().setMenuOpen(true);
        }

        if (pathname.startsWith("/admin/settings")) {
            return () => useSettingsTutorialStore.getState().setMenuOpen(true);
        }

        if (pathname.startsWith("/admin/reports")) {
            return () => useReportsTutorialStore.getState().setMenuOpen(true);
        }

        if (pathname.startsWith("/admin/debts")) {
            return () => useHutangTutorialStore.getState().setMenuOpen(true);
        }

        if (pathname.startsWith("/admin/employees") || pathname.startsWith("/admin/users")) {
            return () => useUsersTutorialStore.getState().setMenuOpen(true);
        }

        if (pathname.startsWith("/admin/audit")) {
            return () => useAuditTutorialStore.getState().setMenuOpen(true);
        }

        if (pathname.startsWith("/admin/cash-drawer") || pathname.startsWith("/admin/transactions")) {
            return () => useSalesTutorialStore.getState().setMenuOpen(true);
        }

        if (pathname.startsWith("/admin/checkout") || pathname === "/checkout") {
            return () => useTutorialStore.getState().setMenuOpen(true);
        }

        // Return null if this route has no tutorial available
        return null;
    }, [pathname, onCustomOpen]);

    // Do NOT render the tutorial button if the current menu/page has no tutorial available
    if (!openTutorial) {
        return null;
    }

    return (
        <button
            type="button"
            onClick={openTutorial}
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

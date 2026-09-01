"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import {
    IconArrowsExchange,
    IconCategory,
    IconHierarchy,
    IconNotebook,
    IconRoute,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { CoaPage } from "./coa-page";
import { CoaMappingManager } from "../coa-mapping/coa-mapping-manager";
import { CounterpartMappingPage } from "../counterpart-mapping/counterpart-mapping-page";
import { CategoryMappingManager } from "../category-mapping/category-mapping-manager";

export type CoaManagementTab =
    | "coa"
    | "transaction-mapping"
    | "counterpart-mapping"
    | "category-mapping";

const TAB_ITEMS: {
    id: CoaManagementTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}[] = [
    {
        id: "coa",
        label: "Daftar Akun (CoA)",
        icon: IconHierarchy,
    },
    {
        id: "transaction-mapping",
        label: "Mapping Transaksi",
        icon: IconRoute,
    },
    {
        id: "counterpart-mapping",
        label: "Mapping Lawan Akun",
        icon: IconArrowsExchange,
    },
    {
        id: "category-mapping",
        label: "Mapping Kategori",
        icon: IconCategory,
    },
];

interface CoaManagementViewProps {
    defaultTab?: CoaManagementTab;
}

export function CoaManagementView({ defaultTab = "coa" }: CoaManagementViewProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [, startTransition] = useTransition();

    const currentTab = (searchParams.get("tab") as CoaManagementTab) || defaultTab;

    const handleTabChange = useCallback(
        (newTab: CoaManagementTab) => {
            startTransition(() => {
                const params = new URLSearchParams(searchParams.toString());
                if (newTab === "coa") {
                    params.delete("tab");
                } else {
                    params.set("tab", newTab);
                }
                const queryString = params.toString();
                router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
                    scroll: false,
                });
            });
        },
        [searchParams, pathname, router]
    );

    return (
        <div className="space-y-4 pb-28 sm:pb-8 max-w-7xl mx-auto">
            {/* ── Header Card ── */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center shrink-0 shadow-xs">
                            <IconNotebook className="w-4.5 h-4.5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                                    Manajemen Akun & Pemetaan
                                </h1>
                                <span className="text-[9px] font-extrabold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-200/70 dark:border-indigo-800/80">
                                    CoA Master
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                                Konfigurasi bagan akun standar akuntansi, mapping transaksi otomatis, aturan lawan akun, dan pengelompokan kategori.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Compact Segmented Tabs Bar ── */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 overflow-x-auto scrollbar-none">
                    <div className="inline-flex items-center gap-1 p-1 bg-slate-100/90 dark:bg-slate-800/70 rounded-xl border border-slate-200/70 dark:border-slate-800/80 w-full sm:w-auto">
                        {TAB_ITEMS.map((tab) => {
                            const isActive = currentTab === tab.id;
                            const Icon = tab.icon;

                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => handleTabChange(tab.id)}
                                    className={cn(
                                        "h-7 sm:h-8 px-2.5 sm:px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 whitespace-nowrap transition-all select-none cursor-pointer flex-1 sm:flex-initial",
                                        isActive
                                            ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/80 dark:border-slate-700 font-extrabold"
                                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/50 border border-transparent"
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            "w-3.5 h-3.5 shrink-0 transition-colors",
                                            isActive
                                                ? "text-indigo-600 dark:text-indigo-400"
                                                : "text-slate-400 dark:text-slate-500"
                                        )}
                                    />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Active Tab Content View ── */}
            <div className="transition-all duration-150">
                {currentTab === "coa" && <CoaPage />}
                {currentTab === "transaction-mapping" && <CoaMappingManager />}
                {currentTab === "counterpart-mapping" && <CounterpartMappingPage />}
                {currentTab === "category-mapping" && <CategoryMappingManager />}
            </div>
        </div>
    );
}

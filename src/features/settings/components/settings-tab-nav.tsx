"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, Settings2, Building2, Store as StoreIcon } from "lucide-react";
import type { SettingsTabItem, SettingsTabId } from "../types/settings";
import type { StoreSettingsInput } from "../schemas/settings-schema";
import { SETTINGS_CATEGORY_LABELS } from "../constants/settings-constants";

interface SettingsTabNavProps {
    tabs: readonly SettingsTabItem[];
    activeTab: SettingsTabId;
    onSelectTab: (tabId: SettingsTabId) => void;
    isCentralStore: boolean;
    isTabDirty: (fields: readonly (keyof StoreSettingsInput)[]) => boolean;
    hasTabError: (fields: readonly (keyof StoreSettingsInput)[]) => boolean;
}

export function SettingsTabNav({
    tabs,
    activeTab,
    onSelectTab,
    isCentralStore,
    isTabDirty,
    hasTabError,
}: SettingsTabNavProps) {
    // Group tabs by category
    const storeTabs = tabs.filter((t) => t.category === "store");
    const centralTabs = tabs.filter((t) => t.category === "central");

    const renderTabButton = (tab: SettingsTabItem) => {
        const Icon = tab.icon;
        const dirty = isTabDirty(tab.fields);
        const error = hasTabError(tab.fields);
        const isActive = activeTab === tab.id;

        return (
            <button
                key={tab.id}
                id={`settings-tab-${tab.id}`}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={cn(
                    "group relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 text-left cursor-pointer shrink-0 select-none border w-full",
                    isActive
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-600/25 border-transparent font-semibold"
                        : "bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200/70 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700"
                )}
            >
                <div
                    className={cn(
                        "w-7 h-7 rounded-lg transition-colors flex items-center justify-center shrink-0 border",
                        isActive
                            ? "bg-white/20 text-white border-white/25 shadow-inner"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 border-slate-200/60 dark:border-slate-700"
                    )}
                >
                    <Icon size={15} />
                </div>

                <div className="flex-1 min-w-0 pr-1">
                    <p
                        className={cn(
                            "text-xs tracking-tight truncate",
                            isActive
                                ? "text-white font-bold"
                                : "text-slate-800 dark:text-slate-200 group-hover:text-slate-900 font-medium"
                        )}
                    >
                        {tab.label}
                    </p>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-1.5 ml-auto shrink-0">
                    {error ? (
                        <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500 text-white ring-2 ring-rose-500/20">
                            <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                            <span>Error</span>
                        </span>
                    ) : dirty ? (
                        <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-white ring-2 ring-amber-500/20">
                            <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                            <span>Ubah</span>
                        </span>
                    ) : null}

                    {isActive && (
                        <ChevronRight className="hidden lg:block size-3.5 text-emerald-100 shrink-0" />
                    )}
                </div>
            </button>
        );
    };

    return (
        <div className="w-full space-y-3">
            {/* Store Type Badge Card */}
            <div className="hidden lg:flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                        <Settings2 size={13} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Pengaturan
                    </span>
                </div>
                <div
                    className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide border",
                        isCentralStore
                            ? "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                            : "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                    )}
                >
                    {isCentralStore ? <Building2 size={10} /> : <StoreIcon size={10} />}
                    {isCentralStore ? "Toko Pusat" : "Toko Cabang"}
                </div>
            </div>

            {/* Mobile / Tablet Horizontal Scrollbar */}
            <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none w-full">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const dirty = isTabDirty(tab.fields);
                    const error = hasTabError(tab.fields);
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => onSelectTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all border",
                                isActive
                                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800"
                            )}
                        >
                            <Icon size={14} />
                            <span>{tab.label}</span>
                            {error ? (
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 ring-2 ring-white" />
                            ) : dirty ? (
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ring-2 ring-white" />
                            ) : null}
                        </button>
                    );
                })}
            </div>

            {/* Desktop Vertical Menu grouped by Category */}
            <div className="hidden lg:flex flex-col gap-3">
                {/* Store Level Group */}
                {storeTabs.length > 0 && (
                    <div className="space-y-1.5">
                        <div className="px-2 pt-1 flex items-center justify-between">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                {SETTINGS_CATEGORY_LABELS.store.title}
                            </span>
                        </div>
                        <div className="space-y-1">
                            {storeTabs.map(renderTabButton)}
                        </div>
                    </div>
                )}

                {/* Central / HQ Group (Only visible if central tabs exist) */}
                {centralTabs.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                        <div className="px-2 pt-1 flex items-center justify-between">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                {SETTINGS_CATEGORY_LABELS.central.title}
                            </span>
                            <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.2 rounded border border-purple-200/60 dark:border-purple-800">
                                HQ
                            </span>
                        </div>
                        <div className="space-y-1">
                            {centralTabs.map(renderTabButton)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

"use client";

import { memo } from "react";
import { Scrollable } from "@/components/ui/scrollable";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { CatalogAddon, ProrateItem } from "../../types";
import { LicenseOrderAddonItem } from "./license-order-addon-item";

interface LicenseOrderAddonColumnProps {
    addons: CatalogAddon[];
    selectedAddonIds: string[];
    billingPeriod: "monthly" | "annual";
    onToggleAddon: (id: string) => void;
    onSelectAll: () => void;
    onClearAll: () => void;
    prorateMap: Map<string, ProrateItem>;
    withRenewal: boolean;
    isProrated: boolean;
    addonCustomDays: Record<string, number>;
    onDurationChange: (addonId: string, days: number) => void;
    isCalculating: boolean;
}

export const LicenseOrderAddonColumn = memo(function LicenseOrderAddonColumn({
    addons,
    selectedAddonIds,
    billingPeriod,
    onToggleAddon,
    onSelectAll,
    onClearAll,
    prorateMap,
    withRenewal,
    isProrated,
    addonCustomDays,
    onDurationChange,
    isCalculating,
}: LicenseOrderAddonColumnProps) {
    return (
        <div className="lg:col-span-4 flex flex-col min-h-0 max-h-[380px] md:max-h-[460px] lg:h-[460px] overflow-hidden space-y-2">
            {/* Header Toolbar for Addons */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-black flex items-center justify-center border border-emerald-200">
                        2
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                        Pilih Add-on
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60 ml-0.5">
                        {addons.length}
                    </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                    <button
                        type="button"
                        onClick={onSelectAll}
                        className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                    >
                        Semua
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                        type="button"
                        onClick={onClearAll}
                        className="text-[11px] font-bold text-slate-400 hover:text-slate-600 hover:underline cursor-pointer"
                    >
                        Batal
                    </button>
                </div>
            </div>

            {/* Scrollable Container with Addon Cards wrapped in single TooltipProvider */}
            <TooltipProvider delayDuration={150}>
                <Scrollable
                    className="flex-1 min-h-0 max-h-[340px] md:max-h-[420px] pr-1.5 overflow-hidden"
                    scrollbarClassName="z-20"
                >
                    <div className="flex flex-col gap-2 p-0.5 pb-2">
                        {addons.map((addon) => {
                            const prorateItem = isProrated
                                ? (prorateMap.get(addon.id) ??
                                  prorateMap.get(addon.code))
                                : undefined;
                            return (
                                <LicenseOrderAddonItem
                                    key={addon.id}
                                    addon={addon}
                                    isSelected={selectedAddonIds.includes(
                                        addon.id
                                    )}
                                    billingPeriod={billingPeriod}
                                    onToggle={onToggleAddon}
                                    prorateItem={prorateItem}
                                    withRenewal={withRenewal}
                                    isProrated={isProrated}
                                    currentDays={
                                        addonCustomDays[addon.id] ??
                                        addonCustomDays[addon.code]
                                    }
                                    onDurationChange={onDurationChange}
                                    isLoadingPrice={isCalculating}
                                />
                            );
                        })}
                    </div>
                </Scrollable>
            </TooltipProvider>
        </div>
    );
});

"use client";

import { useFormContext, Controller } from "react-hook-form";
import { IconCheck, IconReceiptTax } from "@tabler/icons-react";
import { BadgePercent, Info, Sparkles, Building2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AppButton } from "@/components/shared/app-button";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/settings-store";
import { SettingsTabCard } from "./settings-tab-card";
import type { StoreSettingsInput } from "../schemas/settings-schema";

interface TabConsignmentProps {
    isSaving: boolean;
}

function LabelWithTooltip({ label, tooltip }: { label: string; tooltip: string }) {
    return (
        <div className="flex items-center gap-1.5 mb-1.5 select-none">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                {label}
            </span>
            <Tooltip>
                <TooltipTrigger asChild>
                    <AppButton
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="p-0 border-none bg-transparent cursor-help text-slate-400 hover:text-slate-500 transition-colors flex items-center h-auto w-auto"
                    >
                        <Info size={12} />
                    </AppButton>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs max-w-xs bg-slate-950 text-white rounded-lg p-2 shadow-lg border border-slate-800">
                    {tooltip}
                </TooltipContent>
            </Tooltip>
        </div>
    );
}

export function TabConsignment({ isSaving }: TabConsignmentProps) {
    const { control } = useFormContext<StoreSettingsInput>();
    const { getSettingMeta } = useSettingsStore();
    const consignmentMeta = getSettingMeta("consignment_commission_mode");

    return (
        <TooltipProvider delayDuration={150}>
            <SettingsTabCard
                icon={IconReceiptTax}
                title="Konsinyasi Cabang"
                subtitle="Perlakuan harga banderol konsumen dan perhitungan komisi konsinyasi internal cabang"
                iconBgClassName="bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/50"
                badge={
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        Pusat Only
                    </span>
                }
            >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* Mode Selector */}
                    <div className="lg:col-span-7 space-y-3">
                        <LabelWithTooltip
                            label={consignmentMeta?.label || "Metode Komisi Cabang"}
                            tooltip={
                                consignmentMeta?.description ||
                                "Pilih mode bagi hasil konsinyasi internal: Cut Revenue (harga ritel seragam) atau Markup Price (cabang menaikkan harga)."
                            }
                        />

                        <Controller
                            control={control}
                            name="consignment_commission_mode"
                            render={({ field }) => (
                                <div className="space-y-2.5">
                                    {/* Option 1: Cut Revenue */}
                                    <div
                                        onClick={() => !isSaving && field.onChange("cut_revenue")}
                                        className={cn(
                                            "group relative flex flex-col p-3.5 rounded-xl border transition-all cursor-pointer select-none",
                                            field.value === "cut_revenue"
                                                ? "bg-purple-50/70 dark:bg-purple-950/30 border-purple-300 dark:border-purple-700 ring-2 ring-purple-500/20 shadow-xs"
                                                : "bg-white dark:bg-slate-900/50 border-slate-200/70 dark:border-slate-800 hover:border-slate-300"
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-2.5">
                                            <div className="space-y-0.5 flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                                        Cut Revenue (Harga Konsumen Tetap)
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded-full border border-emerald-200 dark:border-emerald-800">
                                                        <Sparkles size={9} />
                                                        Rekomendasi
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                                                    Harga jual kasir cabang sama persis dengan banderol pusat. Komisi cabang dipotong dari nilai setoran ke kas pusat.
                                                </p>
                                            </div>

                                            <div
                                                className={cn(
                                                    "w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                                                    field.value === "cut_revenue"
                                                        ? "bg-purple-600 border-purple-600 text-white"
                                                        : "border-slate-300 dark:border-slate-700"
                                                )}
                                            >
                                                {field.value === "cut_revenue" && <IconCheck size={10} strokeWidth={3} />}
                                            </div>
                                        </div>

                                        {/* Simulation Snippet */}
                                        <div className="mt-2.5 pt-2 border-t border-purple-100 dark:border-purple-900/40 grid grid-cols-3 gap-1.5 text-[10px]">
                                            <div className="bg-white/80 dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                                                <span className="text-slate-400 block text-[9px]">Banderol</span>
                                                <strong className="text-slate-700 dark:text-slate-200 font-mono">Rp 100.000</strong>
                                            </div>
                                            <div className="bg-white/80 dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                                                <span className="text-emerald-600 block text-[9px]">Komisi (10%)</span>
                                                <strong className="text-emerald-700 dark:text-emerald-400 font-mono">+Rp 10.000</strong>
                                            </div>
                                            <div className="bg-white/80 dark:bg-slate-800 p-1.5 rounded-lg border border-purple-200/60 dark:border-purple-900/60">
                                                <span className="text-purple-600 block text-[9px]">Wajib Setor</span>
                                                <strong className="text-purple-900 dark:text-purple-300 font-mono">Rp 90.000</strong>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Option 2: Markup Price */}
                                    <div
                                        onClick={() => !isSaving && field.onChange("markup_price")}
                                        className={cn(
                                            "group relative flex flex-col p-3.5 rounded-xl border transition-all cursor-pointer select-none",
                                            field.value === "markup_price"
                                                ? "bg-purple-50/70 dark:bg-purple-950/30 border-purple-300 dark:border-purple-700 ring-2 ring-purple-500/20 shadow-xs"
                                                : "bg-white dark:bg-slate-900/50 border-slate-200/70 dark:border-slate-800 hover:border-slate-300"
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-2.5">
                                            <div className="space-y-0.5 flex-1 min-w-0">
                                                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                                    Markup Price (Cabang Menambah Margin)
                                                </span>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                                                    Wajib setor ke pusat tetap utuh 100% harga pokok. Cabang menaikkan harga jual konsumen di kasir untuk mengambil laba.
                                                </p>
                                            </div>

                                            <div
                                                className={cn(
                                                    "w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                                                    field.value === "markup_price"
                                                        ? "bg-purple-600 border-purple-600 text-white"
                                                        : "border-slate-300 dark:border-slate-700"
                                                )}
                                            >
                                                {field.value === "markup_price" && <IconCheck size={10} strokeWidth={3} />}
                                            </div>
                                        </div>

                                        {/* Simulation Snippet */}
                                        <div className="mt-2.5 pt-2 border-t border-purple-100 dark:border-purple-900/40 grid grid-cols-3 gap-1.5 text-[10px]">
                                            <div className="bg-white/80 dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                                                <span className="text-slate-400 block text-[9px]">Banderol</span>
                                                <strong className="text-slate-700 dark:text-slate-200 font-mono">Rp 110.000</strong>
                                            </div>
                                            <div className="bg-white/80 dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                                                <span className="text-emerald-600 block text-[9px]">Laba Cabang</span>
                                                <strong className="text-emerald-700 dark:text-emerald-400 font-mono">+Rp 10.000</strong>
                                            </div>
                                            <div className="bg-white/80 dark:bg-slate-800 p-1.5 rounded-lg border border-purple-200/60 dark:border-purple-900/60">
                                                <span className="text-purple-600 block text-[9px]">Wajib Setor</span>
                                                <strong className="text-purple-900 dark:text-purple-300 font-mono">Rp 100.000</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        />
                    </div>

                    {/* Explanatory Info Card */}
                    <div className="lg:col-span-5 space-y-2.5">
                        <div className="border border-slate-200/70 dark:border-slate-800 rounded-xl p-3.5 bg-slate-50/60 dark:bg-slate-900/40 space-y-2">
                            <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-400 font-bold text-xs uppercase tracking-wider">
                                <BadgePercent size={13} />
                                Panduan Pemilihan Mode
                            </div>
                            <div className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                                <p>
                                    <strong className="text-slate-700 dark:text-slate-200">Cut Revenue:</strong> Cocok untuk gerai waralaba/cabang yang wajib seragam harga jual nasional.
                                </p>
                                <p>
                                    <strong className="text-slate-700 dark:text-slate-200">Markup Price:</strong> Cocok untuk cabang luar daerah dengan ongkos kirim/operasional berbeda.
                                </p>
                            </div>
                        </div>

                        <div className="border border-emerald-200/60 dark:border-emerald-900/40 rounded-xl p-3.5 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                                <Building2 size={13} />
                                Sinkronisasi Otomatis
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                                Menjadi acuan transfer stok konsinyasi, harga di kasir POS, dan modul <strong>Setoran Cabang (Remittance)</strong>.
                            </p>
                        </div>
                    </div>
                </div>
            </SettingsTabCard>
        </TooltipProvider>
    );
}

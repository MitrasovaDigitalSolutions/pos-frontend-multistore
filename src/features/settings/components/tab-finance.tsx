"use client";

import { useFormContext, Controller } from "react-hook-form";
import { IconAdjustments } from "@tabler/icons-react";
import { Coins, Percent, Info } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { AppButton } from "@/components/shared/app-button";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { useSettingsStore } from "@/stores/settings-store";
import { useSettingsTutorialStore } from "@/stores/settings-tutorial-store";
import { SettingsTabCard } from "./settings-tab-card";
import type { StoreSettingsInput } from "../schemas/settings-schema";

interface TabFinanceProps {
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

export function TabFinance({ isSaving }: TabFinanceProps) {
    const { control, watch } = useFormContext<StoreSettingsInput>();
    const { getSettingMeta } = useSettingsStore();
    const isTutorialRunning = useSettingsTutorialStore((state) => state.isRunning);
    const activeTutorial = useSettingsTutorialStore((state) => state.activeTutorial);
    const pointSystemEnable = watch("point_system_enabled") === "true";
    const showPointRateInput = pointSystemEnable || (isTutorialRunning && activeTutorial === "atur_ppn_poin");

    const taxMeta = getSettingMeta("tax_rate_ppn");
    const pointSysMeta = getSettingMeta("point_system_enabled");
    const pointRateMeta = getSettingMeta("point_rate");

    return (
        <TooltipProvider delayDuration={150}>
            <SettingsTabCard
                icon={IconAdjustments}
                title="Keuangan & Pajak"
                subtitle="Konfigurasi tarif PPN transaksi dan rasio perolehan poin belanja pelanggan"
                iconBgClassName="bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50"
                badge={
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        Pusat Only
                    </span>
                }
            >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* Inputs Column */}
                    <div className="lg:col-span-7 space-y-4">
                        {/* PPN Input */}
                        <div className="flex flex-col">
                            <LabelWithTooltip
                                label={taxMeta?.label || "Tarif PPN Default (%)"}
                                tooltip={taxMeta?.description || "Persentase tarif pajak PPN yang dihitung otomatis pada total transaksi."}
                            />
                            <div className="relative">
                                <FormNumberInput<StoreSettingsInput>
                                    name="tax_rate_ppn"
                                    placeholder="Contoh: 11"
                                    disabled={isSaving}
                                    min={0}
                                    max={100}
                                />
                            </div>
                        </div>

                        {/* Point System Toggle */}
                        <div
                            id="form-settings-point-toggle"
                            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40"
                        >
                            <div className="space-y-0.5 min-w-0 pr-3">
                                <LabelWithTooltip
                                    label={pointSysMeta?.label || "Sistem Poin Member"}
                                    tooltip={pointSysMeta?.description || "Aktifkan atau nonaktifkan fitur loyalitas poin member."}
                                />
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                                    Akumulasikan poin belanja otomatis saat member bertransaksi di kasir POS.
                                </p>
                            </div>
                            <Controller
                                control={control}
                                name="point_system_enabled"
                                render={({ field }) => (
                                    <Switch
                                        checked={field.value === "true"}
                                        onCheckedChange={(checked) => field.onChange(checked ? "true" : "false")}
                                        disabled={isSaving}
                                    />
                                )}
                            />
                        </div>

                        {/* Point Rate Input */}
                        {showPointRateInput && (
                            <div className="flex flex-col animate-in fade-in duration-200">
                                <LabelWithTooltip
                                    label={pointRateMeta?.label || "Rasio Poin (Rp per 1 Poin)"}
                                    tooltip={pointRateMeta?.description || "Nominal kelipatan belanja untuk mendapatkan 1 poin loyalitas."}
                                />
                                <FormNumberInput<StoreSettingsInput>
                                    name="point_rate"
                                    placeholder="Contoh: 1000"
                                    disabled={isSaving}
                                    min={1}
                                />
                            </div>
                        )}
                    </div>

                    {/* Simulation Helper Panel */}
                    <div className="lg:col-span-5 space-y-2.5">
                        <div className="border border-emerald-200/70 dark:border-emerald-900/40 rounded-xl p-3.5 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                                <Percent size={13} />
                                Pajak Pertambahan Nilai (PPN)
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                                Standar umum PPN di Indonesia adalah <strong>11%</strong>. Transaksi kasir cabang otomatis menggunakan tarif ini sebagai basis faktur.
                            </p>
                        </div>

                        <div className="border border-amber-200/70 dark:border-amber-900/40 rounded-xl p-3.5 bg-amber-50/40 dark:bg-amber-950/20 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
                                <Coins size={13} />
                                Konversi Poin Loyalitas
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                                Jika diatur ke <strong>Rp 1.000</strong>, pembelanjaan senilai Rp 50.000 akan otomatis menghasilkan <strong>50 Poin</strong> untuk pelanggan member.
                            </p>
                        </div>
                    </div>
                </div>
            </SettingsTabCard>
        </TooltipProvider>
    );
}

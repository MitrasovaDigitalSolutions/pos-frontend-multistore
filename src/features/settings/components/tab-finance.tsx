"use client";

import { type StoreSettingsInput } from "../schemas/settings-schema";
import { Card, CardContent } from "@/components/ui/card";
import { IconAdjustments } from "@tabler/icons-react";
import { Coins, Percent, Info } from "lucide-react";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { Scrollable } from "@/components/ui/scrollable";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { useFormContext, Controller } from "react-hook-form";
import { Switch } from "@/components/ui/switch";

import { AppButton } from "@/components/shared/app-button";

interface TabFinanceProps {
    isSaving: boolean;
}

function LabelWithTooltip({ label, tooltip }: { label: string; tooltip: string }) {
    return (
        <div className="flex items-center gap-1.5 mb-1.5 select-none">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
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
    const pointSystemEnable = watch("point_system_enabled") === "true";

    return (
        <TooltipProvider delayDuration={150}>
            <Card className="border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.03)] bg-white dark:bg-slate-900 overflow-hidden flex flex-col w-full min-h-[460px]">
                {/* Header (pinned) */}
                <div className="p-5 pb-3 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100/60 shadow-sm">
                            <IconAdjustments size={15} />
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">Keuangan & Pajak</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Pengaturan tarif PPN dan poin loyalitas</p>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <Scrollable className="flex-1 min-h-0 w-full">
                    <CardContent className="p-5 space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Inputs Column */}
                            <div className="lg:col-span-7 space-y-5">
                                <div className="flex flex-col">
                                    <LabelWithTooltip
                                        label="Tarif PPN (%)"
                                        tooltip="Persentase PPN default yang otomatis ditambahkan di kasir saat checkout pajak aktif."
                                    />
                                    <div className="relative flex items-center">
                                        <div className="w-full">
                                            <FormNumberInput<StoreSettingsInput>
                                                name="tax_rate_ppn"
                                                placeholder="Contoh: 11"
                                                disabled={isSaving}
                                                min={0}
                                                max={100}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border border-slate-100/80 rounded-xl p-4 bg-slate-50/30">
                                    <div className="space-y-0.5">
                                        <LabelWithTooltip
                                            label="Sistem Poin Member"
                                            tooltip="Aktifkan atau nonaktifkan sistem akumulasi poin untuk member."
                                        />
                                        <p className="text-[11px] text-slate-400">
                                            Aktifkan loyalitas member dan akumulasi poin transaksi
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

                                {pointSystemEnable && (
                                    <div className="flex flex-col animate-in fade-in duration-200">
                                        <LabelWithTooltip
                                            label="Konversi Poin (Rupiah per Poin)"
                                            tooltip="Kelipatan nominal belanja Rupiah untuk mendapat 1 poin member (dibulatkan kebawah)."
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

                            {/* Help Panel Column */}
                            <div className="lg:col-span-5 space-y-4">
                                <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                                        <Percent size={13} />
                                        Simulasi Pajak (PPN)
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        Tarif PPN default di Indonesia adalah <strong>11%</strong>. Ketika diaktifkan di layar transaksi kasir, sistem akan otomatis menjumlahkan nilai pajak berdasarkan subtotal transaksi Anda.
                                    </p>
                                </div>

                                <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
                                        <Coins size={13} />
                                        Mekanisme Poin Loyalitas
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        Jika diatur ke <strong>1000</strong>, pembelanjaan senilai Rp 10.000 akan otomatis menghasilkan <strong>10 Poin</strong> untuk member. Poin ini dapat dikumpulkan pelanggan untuk promo potongan belanja di kemudian hari.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Scrollable>
            </Card>
        </TooltipProvider>
    );
}

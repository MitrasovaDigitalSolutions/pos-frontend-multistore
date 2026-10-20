"use client";

import { useFormContext } from "react-hook-form";
import { Boxes, Calculator, Info, PackageCheck } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { AppButton } from "@/components/shared/app-button";
import { FormSelect } from "@/components/forms/form-select";
import { useSettingsStore } from "@/stores/settings-store";
import { SettingsTabCard } from "./settings-tab-card";
import type { StoreSettingsInput } from "../schemas/settings-schema";

interface TabInventoryProps {
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

export function TabInventory({ isSaving }: TabInventoryProps) {
    const { watch } = useFormContext<StoreSettingsInput>();
    const { getSettingMeta } = useSettingsStore();
    const currentHppMethod = watch("hpp_adjustment_method");
    const hppMeta = getSettingMeta("hpp_adjustment_method");

    return (
        <TooltipProvider delayDuration={150}>
            <SettingsTabCard
                icon={Boxes}
                title="Inventori & HPP"
                subtitle="Pengaturan kalkulasi HPP otomatis saat transaksi penerimaan barang supplier"
                iconBgClassName="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50"
                badge={
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        Pusat Only
                    </span>
                }
            >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* HPP Select Panel */}
                    <div className="lg:col-span-7 space-y-3">
                        <div
                            id="form-settings-hpp-select"
                            className="flex flex-col border border-slate-200/70 dark:border-slate-800 rounded-xl p-3.5 bg-slate-50/50 dark:bg-slate-900/40 space-y-2"
                        >
                            <LabelWithTooltip
                                label={hppMeta?.label || "Metode Penyesuaian HPP"}
                                tooltip={hppMeta?.description || "Metode penetapan HPP ketika penerimaan barang: Latest (faktur terakhir) atau Average (rata-rata bergerak)."}
                            />
                            <FormSelect<StoreSettingsInput>
                                name="hpp_adjustment_method"
                                options={[
                                    { value: "latest", label: "Harga Beli Terakhir / Faktur (Latest)" },
                                    { value: "average", label: "Harga Rata-Rata Bergerak (Average)" },
                                ]}
                                disabled={isSaving}
                            />

                            <div className="mt-1 p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-2">
                                <PackageCheck className="size-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug font-medium">
                                    {currentHppMethod === "average"
                                        ? "Sistem menghitung HPP rata-rata dari stok eksisting digabung dengan penerimaan barang baru, sehingga fluktuasi harga tidak mengganggu stabilitas margin."
                                        : "Sistem menggunakan harga faktur pembelian terbaru sebagai basis pembaruan HPP produk saat barang diterima."}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Explanatory Info Card */}
                    <div className="lg:col-span-5 space-y-2.5">
                        <div className="border border-indigo-200/70 dark:border-indigo-900/40 rounded-xl p-3.5 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
                                <Calculator size={13} />
                                Rekomendasi Pemilihan
                            </div>
                            <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                                <p>
                                    <strong className="text-slate-800 dark:text-slate-200">Latest:</strong> Ideal untuk bisnis ritel cepat yang langsung menyesuaikan harga jual saat harga modal dari supplier naik.
                                </p>
                                <p>
                                    <strong className="text-slate-800 dark:text-slate-200">Average:</strong> Ideal untuk bisnis dengan frekuensi pembelian tinggi agar nilai persediaan di neraca tidak melonjak drastis.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </SettingsTabCard>
        </TooltipProvider>
    );
}

"use client";

import { type StoreSettingsInput } from "../schemas/settings-schema";
import { Card, CardContent } from "@/components/ui/card";
import { IconPackage } from "@tabler/icons-react";
import { FormSelect } from "@/components/forms/form-select";
import { Scrollable } from "@/components/ui/scrollable";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { useFormContext } from "react-hook-form";
import { Calculator, Info, PackageCheck } from "lucide-react";
import { AppButton } from "@/components/shared/app-button";
import { useSettingsStore } from "@/stores/settings-store";

interface TabInventoryProps {
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

export function TabInventory({ isSaving }: TabInventoryProps) {
    const { watch } = useFormContext<StoreSettingsInput>();
    const { getSettingMeta } = useSettingsStore();
    const currentHppMethod = watch("hpp_adjustment_method");
    const hppMeta = getSettingMeta("hpp_adjustment_method");

    return (
        <TooltipProvider delayDuration={150}>
            <Card className="border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.03)] bg-white dark:bg-slate-900 overflow-hidden flex flex-col w-full min-h-[460px]">
                {/* Header (pinned) */}
                <div className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
                            <IconPackage size={15} />
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">Inventori & HPP</h3>
                            <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">Pengaturan kalkulasi HPP dan persediaan barang toko</p>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <Scrollable className="flex-1 min-h-0 w-full">
                    <CardContent className="p-5 space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Inputs Column */}
                            <div className="lg:col-span-7 space-y-5">
                                <div className="flex flex-col border border-slate-100 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/40 dark:bg-slate-900/40 space-y-2">
                                    <LabelWithTooltip
                                        label={hppMeta?.label || "Metode Penyesuaian HPP"}
                                        tooltip={hppMeta?.description || "Basis harga beli untuk saran harga jual saat penerimaan barang: latest (harga faktur) atau average (harga rata-rata)."}
                                    />
                                    <FormSelect<StoreSettingsInput>
                                        name="hpp_adjustment_method"
                                        options={[
                                            { value: "latest", label: "Harga Beli Terakhir / Faktur (Latest)" },
                                            { value: "average", label: "Harga Rata-Rata (Average)" },
                                        ]}
                                        disabled={isSaving}
                                    />
                                    <div className="mt-3 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-2.5">
                                        <PackageCheck className="size-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                            {currentHppMethod === "average"
                                                ? "Sistem mengkalkulasikan saran harga jual produk saat penerimaan barang berdasarkan HPP rata-rata dari stok yang sudah ada + barang masuk baru."
                                                : "Sistem mengkalkulasikan saran harga jual produk saat penerimaan barang berdasarkan harga faktur/beli paling baru."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Help Panel Column */}
                            <div className="lg:col-span-5 space-y-4">
                                <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                                    <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
                                        <Calculator size={13} />
                                        Metode Penyesuaian HPP
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                        <strong>Latest (Harga Beli Terakhir)</strong>:  Menggunakan harga faktur pemasok terbaru sebagai patokan kalkulasi persentase margin saat barang diterima.
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                        <strong>Average (Rata-Rata)</strong>: Menggabungkan nilai total stok lama dan barang masuk baru untuk mendapatkan HPP rata-rataper unit, sehingga fluktuasi harga beli tidak merusak stabilitas margin.
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

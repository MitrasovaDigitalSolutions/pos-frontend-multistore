"use client";

import { useFormContext, Controller } from "react-hook-form";
import { IconCheck, IconReceiptTax } from "@tabler/icons-react";
import { BadgePercent, Info, Sparkles, Building2 } from "lucide-react";
import { AppButton } from "@/components/shared/app-button";
import { Card, CardContent } from "@/components/ui/card";
import { Scrollable } from "@/components/ui/scrollable";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/settings-store";
import type { StoreSettingsInput } from "../schemas/settings-schema";

interface TabConsignmentProps {
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

export function TabConsignment({ isSaving }: TabConsignmentProps) {
  const { control } = useFormContext<StoreSettingsInput>();
  const { getSettingMeta } = useSettingsStore();

  const consignmentMeta = getSettingMeta("consignment_commission_mode");

  return (
    <TooltipProvider delayDuration={150}>
      <Card className="border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.03)] bg-white dark:bg-slate-900 overflow-hidden flex flex-col w-full min-h-[460px]">
        {/* Header (pinned) */}
        <div className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-900/50 shadow-sm">
              <IconReceiptTax size={16} />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                Konsinyasi & Komisi Cabang
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">
                Pengaturan perlakuan harga dan perhitungan komisi konsinyasi internal antar cabang
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <Scrollable className="flex-1 min-h-0 w-full">
          <CardContent className="p-5 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Inputs Column */}
              <div className="lg:col-span-7 space-y-5">
                <div id="form-settings-consignment-mode" className="space-y-3">
                  <LabelWithTooltip
                    label={consignmentMeta?.label || "Perlakuan Komisi Konsinyasi Cabang"}
                    tooltip={
                      consignmentMeta?.description ||
                      "Mode perhitungan komisi cabang: cut_revenue (potong dari pendapatan/wajib setor, banderol konsumen tetap) atau markup_price (naikkan harga jual di cabang)."
                    }
                  />

                  <Controller
                    control={control}
                    name="consignment_commission_mode"
                    render={({ field }) => (
                      <div className="space-y-3">
                        {/* Option 1: Cut Revenue */}
                        <div
                          onClick={() => !isSaving && field.onChange("cut_revenue")}
                          className={cn(
                            "group relative flex flex-col p-4 rounded-2xl border transition-all cursor-pointer select-none",
                            field.value === "cut_revenue"
                              ? "bg-purple-50/60 dark:bg-purple-950/30 border-purple-300 dark:border-purple-700 ring-2 ring-purple-500/20 shadow-sm"
                              : "bg-slate-50/40 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                  Cut Revenue (Banderol Konsumen Tetap)
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                                  <Sparkles size={10} />
                                  Rekomendasi
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                Harga banderol konsumen di kasir cabang <strong>sama persis</strong> dengan harga master retail pusat. Komisi cabang dipotong dari nilai yang wajib disetorkan ke kas pusat.
                              </p>
                            </div>
                            <div
                              className={cn(
                                "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                                field.value === "cut_revenue"
                                  ? "bg-purple-600 border-purple-600 text-white"
                                  : "border-slate-300 dark:border-slate-700"
                              )}
                            >
                              {field.value === "cut_revenue" && <IconCheck size={12} strokeWidth={3} />}
                            </div>
                          </div>

                          {/* Simulation Pill */}
                          <div className="mt-3 pt-3 border-t border-purple-100 dark:border-purple-900/40 grid grid-cols-3 gap-2 text-[10px]">
                            <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                              <span className="text-slate-400 block font-medium">Banderol Kasir</span>
                              <strong className="text-slate-800 dark:text-slate-200 font-mono">Rp 100.000</strong>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                              <span className="text-emerald-600 block font-medium">Komisi (10%)</span>
                              <strong className="text-emerald-700 dark:text-emerald-400 font-mono">+Rp 10.000</strong>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-purple-200/60 dark:border-purple-900/60">
                              <span className="text-purple-600 block font-medium">Wajib Setor</span>
                              <strong className="text-purple-900 dark:text-purple-300 font-mono">Rp 90.000</strong>
                            </div>
                          </div>
                        </div>

                        {/* Option 2: Markup Price */}
                        <div
                          onClick={() => !isSaving && field.onChange("markup_price")}
                          className={cn(
                            "group relative flex flex-col p-4 rounded-2xl border transition-all cursor-pointer select-none",
                            field.value === "markup_price"
                              ? "bg-purple-50/60 dark:bg-purple-950/30 border-purple-300 dark:border-purple-700 ring-2 ring-purple-500/20 shadow-sm"
                              : "bg-slate-50/40 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                Markup Price (Naikkan Harga Banderol di Cabang)
                              </span>
                              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                Harga banderol konsumen di cabang <strong>dinaikkan</strong> di atas harga pusat sebesar nilai komisi. Nilai yang disetorkan ke pusat tetap utuh sesuai harga dasar pusat.
                              </p>
                            </div>
                            <div
                              className={cn(
                                "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                                field.value === "markup_price"
                                  ? "bg-purple-600 border-purple-600 text-white"
                                  : "border-slate-300 dark:border-slate-700"
                              )}
                            >
                              {field.value === "markup_price" && <IconCheck size={12} strokeWidth={3} />}
                            </div>
                          </div>

                          {/* Simulation Pill */}
                          <div className="mt-3 pt-3 border-t border-purple-100 dark:border-purple-900/40 grid grid-cols-3 gap-2 text-[10px]">
                            <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                              <span className="text-slate-400 block font-medium">Banderol Kasir</span>
                              <strong className="text-slate-800 dark:text-slate-200 font-mono">Rp 110.000</strong>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                              <span className="text-emerald-600 block font-medium">Komisi (10%)</span>
                              <strong className="text-emerald-700 dark:text-emerald-400 font-mono">+Rp 10.000</strong>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-purple-200/60 dark:border-purple-900/60">
                              <span className="text-purple-600 block font-medium">Wajib Setor</span>
                              <strong className="text-purple-900 dark:text-purple-300 font-mono">Rp 100.000</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  />
                </div>
              </div>

              {/* Help Panel Column */}
              <div className="lg:col-span-5 space-y-4">
                <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                  <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-bold text-xs uppercase tracking-wider">
                    <BadgePercent size={14} />
                    Kapan Menggunakan Masing-masing Mode?
                  </div>
                  <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    <p>
                      <strong className="text-slate-700 dark:text-slate-200">Cut Revenue</strong>: Digunakan bila toko cabang wajib menjual barang dengan harga banderol nasional/resmi yang sama di semua outlet. Cabang tetap mendapatkan keuntungan bagi hasil dari selisih wajib setor.
                    </p>
                    <p>
                      <strong className="text-slate-700 dark:text-slate-200">Markup Price</strong>: Digunakan bila kantor pusat menargetkan penerimaan bersih tetap utuh, dan toko cabang diperbolehkan menaikkan harga jual konsumen untuk menutup biaya operasional lokal.
                    </p>
                  </div>
                </div>

                <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <Building2 size={14} />
                    Sinkronisasi Kasir & Remittance
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Pengaturan ini secara otomatis menjadi basis perhitungan saat transfer stok konsinyasi dibuat, penentuan harga di kasir POS cabang, serta perhitungan nilai setoran di modul <strong>Setoran Cabang (Remittance)</strong>.
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

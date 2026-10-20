"use client";

import { IconPrinter } from "@tabler/icons-react";
import { Loader2, RefreshCw, CheckCircle2, AlertCircle, Info, Download, ExternalLink } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { AppButton } from "@/components/shared/app-button";
import { FormSelect } from "@/components/forms/form-select";
import { useSettingsStore } from "@/stores/settings-store";
import { SettingsTabCard } from "./settings-tab-card";
import type { StoreSettingsInput } from "../schemas/settings-schema";

interface TabPrinterProps {
    isSaving: boolean;
    printerOptions: { value: string; label: string }[];
    isLoadingPrinters: boolean;
    loadPrinters: () => Promise<void>;
    qzError: string | null;
}

function LabelWithTooltip({ label, tooltip }: { label: string; tooltip: string }) {
    return (
        <div className="flex items-center gap-1.5 select-none">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
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
                        <Info size={11} />
                    </AppButton>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs max-w-xs bg-slate-950 text-white rounded-lg p-2 shadow-lg border border-slate-800">
                    {tooltip}
                </TooltipContent>
            </Tooltip>
        </div>
    );
}

export function TabPrinter({
    isSaving,
    printerOptions,
    isLoadingPrinters,
    loadPrinters,
    qzError,
}: TabPrinterProps) {
    const { getSettingMeta } = useSettingsStore();
    const printerMeta = getSettingMeta("printer_id");

    const renderStatusBadge = () => {
        if (isLoadingPrinters) {
            return (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 text-[10px] font-bold animate-pulse">
                    <Loader2 className="animate-spin" size={10} />
                    <span>Memindai...</span>
                </div>
            );
        }
        if (qzError) {
            return (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200/60 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    <span>Service Terputus</span>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Service Aktif</span>
            </div>
        );
    };

    return (
        <TooltipProvider delayDuration={150}>
            <SettingsTabCard
                icon={IconPrinter}
                title="Perangkat Printer"
                subtitle="ID printer thermal default untuk mencetak struk belanja kasir"
                iconBgClassName="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                headerAction={renderStatusBadge()}
            >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                    {/* Left: Printer Selector */}
                    <div className="md:col-span-7 space-y-3.5">
                        {/* Service Status Notice */}
                        <div className="border border-slate-200/70 dark:border-slate-800 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-900/30">
                            {qzError ? (
                                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                                    <AlertCircle size={15} className="shrink-0" />
                                    <span className="text-[11px] font-medium leading-snug">{qzError}</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 size={15} className="shrink-0" />
                                    <span className="text-[11px] font-medium leading-snug">
                                        Printer service terhubung aktif. Siap melakukan cetak struk belanja POS.
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Selector with Refresh Button */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <LabelWithTooltip
                                    label={printerMeta?.label || "Pilih Printer Struk"}
                                    tooltip={printerMeta?.description || "ID printer thermal lokal yang terpasang di komputer/device kasir."}
                                />
                                <AppButton
                                    id="btn-scan-printer"
                                    type="button"
                                    variant="ghost"
                                    size="xs"
                                    onClick={loadPrinters}
                                    isLoading={isLoadingPrinters}
                                    loadingText="Memindai..."
                                    leftIcon={!isLoadingPrinters ? <RefreshCw size={11} /> : null}
                                    disabled={isSaving}
                                    className="text-xs text-emerald-600 hover:text-emerald-700 font-bold transition-colors bg-transparent border-none p-0 h-auto cursor-pointer"
                                >
                                    Pindai Ulang
                                </AppButton>
                            </div>

                            <div id="form-settings-printer-select">
                                <FormSelect<StoreSettingsInput>
                                    name="printer_id"
                                    options={printerOptions}
                                    placeholder={isLoadingPrinters ? "Memuat printer..." : "Pilih Nama Printer"}
                                    disabled={isSaving || isLoadingPrinters}
                                    emptyMessage={qzError ? "Gagal terhubung ke Printer Service." : "Tidak ada printer yang terdeteksi"}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right: Driver & Installation Guide */}
                    <div className="md:col-span-5 space-y-2.5">
                        <div className="border border-slate-200/70 dark:border-slate-800 rounded-xl p-3.5 bg-slate-50/50 dark:bg-slate-900/30 space-y-2.5">
                            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider">
                                <Info size={12} className="text-slate-400" />
                                Panduan Koneksi Printer
                            </div>

                            <a
                                href="https://drive.google.com/drive/folders/1ily8yGout-jtxjvjI3iiCwZoutqR0kKM?usp=drive_link"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between gap-2.5 p-2.5 rounded-lg bg-emerald-50/80 hover:bg-emerald-100/70 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 transition-all group no-underline"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                        <Download size={12} />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="truncate text-slate-800 dark:text-slate-100 font-extrabold text-[11px]">
                                            Unduh Print Service & Driver
                                        </span>
                                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                                            Google Drive Folder
                                        </span>
                                    </div>
                                </div>
                                <ExternalLink size={13} className="shrink-0 text-emerald-600" />
                            </a>

                            <ol className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 list-decimal list-inside pl-0.5 leading-snug">
                                <li>Install Driver printer thermal USB/LAN Anda.</li>
                                <li>Jalankan aplikasi <strong>Print Service</strong> di komputer kasir.</li>
                                <li>Klik <strong>Pindai Ulang</strong> untuk memilih nama printer.</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </SettingsTabCard>
        </TooltipProvider>
    );
}

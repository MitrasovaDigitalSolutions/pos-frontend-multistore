"use client";

import { type StoreSettingsInput } from "../schemas/settings-schema";
import { Card, CardContent } from "@/components/ui/card";
import { IconPrinter } from "@tabler/icons-react";
import { Loader2, RefreshCw, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { FormSelect } from "@/components/forms/form-select";
import { Scrollable } from "@/components/ui/scrollable";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

import { AppButton } from "@/components/shared/app-button";

interface TabPrinterProps {
    isSaving: boolean;
    printerOptions: { value: string; label: string }[];
    isLoadingPrinters: boolean;
    loadPrinters: () => Promise<void>;
    qzError: string | null;
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

export function TabPrinter({
    isSaving,
    printerOptions,
    isLoadingPrinters,
    loadPrinters,
    qzError,
}: TabPrinterProps) {
    const renderStatusBadge = () => {
        if (isLoadingPrinters) {
            return (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100/60 text-[10px] font-bold animate-pulse">
                    <Loader2 className="animate-spin" size={10} />
                    Memindai...
                </div>
            );
        }
        if (qzError) {
            return (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100/60 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    Terputus
                </div>
            );
        }
        return (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100/60 text-[10px] font-bold font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                QZ Tray: Aktif
            </div>
        );
    };

    return (
        <TooltipProvider delayDuration={150}>
            <Card className="border border-slate-100 rounded-2xl shadow-[0_2px_12px_rgba(15,23,42,0.015)] bg-white overflow-hidden h-[500px] flex flex-col w-full">
                {/* Header (pinned) */}
                <div className="p-5 pb-3 border-b border-slate-100 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-100/60 shadow-sm">
                            <IconPrinter size={15} />
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">Perangkat Printer</h3>
                            <p className="text-xs text-slate-400 mt-0.5">ID printer default untuk mencetak struk belanja</p>
                        </div>
                    </div>
                    <div className="shrink-0 self-start sm:self-auto">
                        {renderStatusBadge()}
                    </div>
                </div>

                {/* Scrollable Content */}
                <Scrollable className="flex-1 min-h-0 w-full">
                    <CardContent className="p-5 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                            {/* Left Side: Setup fields */}
                            <div className="md:col-span-7 space-y-4">
                                {/* Device Status Card */}
                                <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/20 space-y-3">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status Layanan</h4>
                                    {qzError ? (
                                        <div className="flex items-center gap-2.5 text-rose-600 bg-rose-50/50 border border-rose-100/50 rounded-xl p-3">
                                            <AlertCircle size={16} className="shrink-0" />
                                            <span className="text-xs font-bold leading-relaxed">{qzError}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2.5 text-emerald-600 bg-emerald-50/50 border border-emerald-100/50 rounded-xl p-3">
                                            <CheckCircle2 size={16} className="shrink-0" />
                                            <span className="text-xs font-bold leading-relaxed">QZ Tray terhubung secara aktif. Siap melakukan cetak struk belanja.</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <LabelWithTooltip
                                            label="Nama / ID Printer"
                                            tooltip="Pilih printer  default yang terhubung ke komputer Anda. Terkoneksi menggunakan aplikasi QZ Tray."
                                        />
                                        <AppButton
                                            type="button"
                                            variant="ghost"
                                            size="xs"
                                            onClick={loadPrinters}
                                            isLoading={isLoadingPrinters}
                                            loadingText="Memindai..."
                                            leftIcon={!isLoadingPrinters ? <RefreshCw size={11} /> : null}
                                            disabled={isSaving}
                                            className="text-xs text-emerald-600 hover:text-emerald-700 font-bold transition-colors bg-transparent border-none p-0 pb-1 h-auto"
                                        >
                                            Pindai Ulang
                                        </AppButton>
                                    </div>
                                    <FormSelect<StoreSettingsInput>
                                        name="printer_id"
                                        options={printerOptions}
                                        placeholder={isLoadingPrinters ? "Memuat printer..." : "Pilih Printer"}
                                        disabled={isSaving || isLoadingPrinters}
                                        emptyMessage={qzError ? "Gagal terhubung ke QZ Tray. Pastikan QZ Tray berjalan." : "Tidak ada printer yang terdeteksi"}
                                    />
                                </div>
                            </div>

                            {/* Right Side: Step-by-step Instructions */}
                            <div className="md:col-span-5 space-y-4">
                                <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
                                        <Info size={13} />
                                        Petunjuk Koneksi Printer
                                    </div>
                                    <ol className="text-xs text-slate-500 space-y-2 list-decimal list-inside pl-1 leading-relaxed">
                                        <li>
                                            Pastikan printer  struk Anda sudah dinyalakan dan terhubung ke komputer via USB/Network.
                                        </li>
                                        <li>
                                            Instal dan jalankan aplikasi pendukung <strong>QZ Tray</strong> di komputer kasir.
                                        </li>
                                        <li>
                                            Klik tombol <strong>Pindai Ulang</strong> untuk memicu pendeteksian nama printer.
                                        </li>
                                        <li>
                                            Pilih nama printer Anda dari menu dropdown dan klik <strong>Simpan Pengaturan</strong> di bawah.
                                        </li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Scrollable>
            </Card>
        </TooltipProvider>
    );
}

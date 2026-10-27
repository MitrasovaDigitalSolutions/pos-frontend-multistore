"use client";

import { useState } from "react";
import { BaseDialog } from "@/components/ui/base-dialog";
import { AppButton } from "@/components/shared/app-button";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconBookmarks, IconCheck, IconPill, IconSearch } from "@tabler/icons-react";
import { usePrescriptionTemplates } from "../../api/pharmacy-api";
import type { PrescriptionTemplate } from "../../types";

interface TemplatePickerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectTemplate: (template: PrescriptionTemplate) => void;
}

export function TemplatePickerDialog({
    open,
    onOpenChange,
    onSelectTemplate,
}: TemplatePickerDialogProps) {
    const [search, setSearch] = useState("");
    const { data: response, isLoading } = usePrescriptionTemplates({
        search,
        per_page: 50,
    });

    const rawData = response?.data;
    const templates: PrescriptionTemplate[] = Array.isArray(rawData)
        ? rawData
        : rawData && "data" in rawData && Array.isArray((rawData as { data: PrescriptionTemplate[] }).data)
            ? (rawData as { data: PrescriptionTemplate[] }).data
            : [];

    const handleSelect = (tmpl: PrescriptionTemplate) => {
        onSelectTemplate(tmpl);
        onOpenChange(false);
    };

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            className="sm:max-w-xl"
            title={
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <IconBookmarks size={18} />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                            Pilih Template Racikan
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Gunakan standar racikan apotek yang telah tersimpan
                        </p>
                    </div>
                </div>
            }
        >
            <div className="space-y-3 pt-2">
                {/* Search Input */}
                <div className="relative">
                    <IconSearch size={16} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari nama racikan, bentuk sediaan, atau aturan pakai..."
                        className="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>

                {/* Templates List */}
                <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                    {isLoading ? (
                        <div className="py-8 text-center text-xs text-slate-400">
                            Memuat daftar template racikan...
                        </div>
                    ) : templates.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-400">
                            {search
                                ? `Tidak ditemukan template yang cocok dengan "${search}"`
                                : "Belum ada template racikan master tersimpan."}
                        </div>
                    ) : (
                        templates.map((tmpl) => {
                            const ingCount = tmpl.ingredients?.length || 0;
                            return (
                                <div
                                    key={tmpl.uid}
                                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex items-center justify-between gap-3 shadow-2xs group"
                                >
                                    <div className="space-y-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                                                {tmpl.nama_racikan}
                                            </span>
                                            <span className="uppercase text-[9.5px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 font-mono shrink-0">
                                                {tmpl.jenis_racikan || "puyer"}
                                            </span>
                                        </div>

                                        {tmpl.aturan_pakai && (
                                            <div className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                                                Signa: {tmpl.aturan_pakai}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                                            <span className="flex items-center gap-1 font-medium">
                                                <IconPill size={12} className="text-emerald-500" />
                                                {ingCount} Bahan obat
                                            </span>
                                            <span>•</span>
                                            <span>Tuslah: {formatRupiah(tmpl.tuslah_fee || 0)}</span>
                                            <span>•</span>
                                            <span>Embalase: {formatRupiah(tmpl.embalase_fee || 0)}</span>
                                        </div>
                                    </div>

                                    <AppButton
                                        type="button"
                                        size="sm"
                                        onClick={() => handleSelect(tmpl)}
                                        className="h-7.5 text-xs font-semibold px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 flex items-center gap-1 cursor-pointer shadow-sm shadow-emerald-600/20"
                                    >
                                        <IconCheck size={13} />
                                        <span>Gunakan</span>
                                    </AppButton>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </BaseDialog>
    );
}

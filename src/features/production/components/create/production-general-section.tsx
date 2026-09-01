"use client";

import { FormDatePicker } from "@/components/forms/form-date-picker";
import { FormInput } from "@/components/forms/form-input";
import { IconCalendarEvent } from "@tabler/icons-react";
import type { ProductionCreateInput } from "../../schemas/production-schema";

interface ProductionGeneralSectionProps {
    disabled?: boolean;
}

export function ProductionGeneralSection({ disabled = false }: ProductionGeneralSectionProps) {
    return (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 px-4 shadow-2xs">
            <div className="flex items-center gap-1.5 pb-2 mb-2.5 border-b border-slate-100">
                <div className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
                    <IconCalendarEvent size={12} />
                </div>
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                    Informasi Dokumen Produksi
                </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                <div className="sm:col-span-4">
                    <FormDatePicker<ProductionCreateInput>
                        name="tanggal"
                        label="Tanggal Produksi *"
                        placeholder="Pilih tanggal"
                        disabled={disabled}
                    />
                </div>
                <div className="sm:col-span-8">
                    <FormInput<ProductionCreateInput>
                        name="catatan"
                        label="Catatan / No. Batch (Opsional)"
                        placeholder="Contoh: Batch 1 - Produksi Kaos Cotton Combed 24s Hitam"
                        disabled={disabled}
                    />
                </div>
            </div>
        </div>
    );
}

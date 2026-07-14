"use client";

import { FormProvider, type UseFormReturn } from "react-hook-form";
import { FormSelect } from "@/components/forms/form-select";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import { Input } from "@/components/ui/input";
import { IconClipboardPlus } from "@tabler/icons-react";
import type { PurchaseOrderHeaderInput } from "@/features/purchase/schemas/order-schema";

interface POHeaderCardProps {
    form: UseFormReturn<PurchaseOrderHeaderInput>;
    supplierOptions: { value: string; label: string }[];
    suppliersLoading: boolean;
    disabled?: boolean;
}

export function POHeaderCard({
    form,
    supplierOptions,
    suppliersLoading,
    disabled = false,
}: POHeaderCardProps) {
    const { register, formState: { errors } } = form;

    return (
        <FormProvider {...form}>
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-50">
                    <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg border border-emerald-100/30">
                        <IconClipboardPlus size={18} />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-slate-900">Informasi PO</h3>
                        <p className="text-[9px] text-slate-400">Silakan lengkapi supplier dan tanggal PO.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {/* Supplier Selector */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Supplier *
                        </label>
                        <FormSelect<PurchaseOrderHeaderInput>
                            name="supplier_uid"
                            options={supplierOptions}
                            placeholder={
                                suppliersLoading
                                    ? "Memuat supplier..."
                                    : "-- Pilih Supplier --"
                            }
                            disabled={disabled || suppliersLoading}
                        />
                    </div>

                    {/* Tanggal PO */}
                    <div className="space-y-1.5">
                        <FormDatePicker<PurchaseOrderHeaderInput>
                            name="tanggal_po"
                            label="Tanggal PO *"
                            disabled={disabled}
                        />
                    </div>
                </div>

                {/* Catatan */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Catatan / Keterangan PO
                    </label>
                    <Input
                        type="text"
                        placeholder="Misal: Harap kirim menggunakan box kayu, termin pembayaran 30 hari..."
                        className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                        disabled={disabled}
                        {...register("catatan")}
                    />
                    {errors.catatan && (
                        <p className="text-[10px] text-rose-500 font-medium">
                            {errors.catatan.message}
                        </p>
                    )}
                </div>
            </div>
        </FormProvider>
    );
}

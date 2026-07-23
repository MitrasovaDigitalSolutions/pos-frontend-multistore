"use client";

import { FormProvider, type UseFormReturn } from "react-hook-form";
import { FormSelect } from "@/components/forms/form-select";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import { Input } from "@/components/ui/input";
import { IconClipboardPlus } from "@tabler/icons-react";
import type { PurchaseReturnHeaderInput } from "@/features/purchase/schemas/return-schema";

interface ReturnHeaderCardProps {
    form: UseFormReturn<PurchaseReturnHeaderInput>;
    supplierOptions: { value: string; label: string }[];
    suppliersLoading: boolean;
    receivingOptions: { value: string; label: string; description?: string }[];
    receivingsLoading: boolean;
    receivingsLoadingMore?: boolean;
    receivingsHasMore?: boolean;
    fetchNextReceivingsPage?: () => void;
    onReceivingSearchChange?: (search: string) => void;
    receivingId?: string | null;
    disabled?: boolean;
}

export function ReturnHeaderCard({
    form,
    supplierOptions,
    suppliersLoading,
    receivingOptions,
    receivingsLoading,
    receivingsLoadingMore,
    receivingsHasMore,
    fetchNextReceivingsPage,
    onReceivingSearchChange,
    receivingId,
    disabled = false,
}: ReturnHeaderCardProps) {
    const { register, formState: { errors } } = form;

    return (
        <FormProvider {...form}>
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-50">
                    <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg border border-emerald-100/30">
                        <IconClipboardPlus size={18} />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-slate-900">Informasi Header Retur</h3>
                        <p className="text-[9px] text-slate-400">Silakan lengkapi referensi faktur dan tanggal retur.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {/* Reference Receiving Invoice */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Referensi Faktur Penerimaan *
                        </label>
                        <FormSelect<PurchaseReturnHeaderInput>
                            name="receiving_uid"
                            options={receivingOptions}
                            placeholder={
                                receivingsLoading
                                    ? "Memuat daftar penerimaan..."
                                    : "-- Pilih Faktur Penerimaan (Completed) --"
                            }
                            disabled={disabled || receivingsLoading}
                            onSearchChange={onReceivingSearchChange}
                            onScrollBottom={fetchNextReceivingsPage}
                            hasMore={receivingsHasMore}
                            isLoadingMore={receivingsLoadingMore}
                        />
                    </div>

                    {/* Supplier Selector */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Supplier *
                        </label>
                        <FormSelect<PurchaseReturnHeaderInput>
                            name="supplier_uid"
                            options={supplierOptions}
                            placeholder={
                                suppliersLoading
                                    ? "Memuat supplier..."
                                    : "-- Pilih Supplier --"
                            }
                            disabled={disabled || suppliersLoading || !!receivingId}
                        />
                    </div>

                    {/* Tanggal Retur */}
                    <div className="space-y-1.5">
                        <FormDatePicker<PurchaseReturnHeaderInput>
                            name="tanggal_retur"
                            label="Tanggal Retur *"
                            disabled={disabled}
                            size="md"
                        />
                    </div>
                </div>

                {/* Catatan */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Catatan / Keterangan Retur
                    </label>
                    <Input
                        type="text"
                        placeholder="Misal: Barang rusak saat diterima, pecah kemasan, atau salah spesifikasi..."
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

"use client";

import { FormDatePicker } from "@/components/forms/form-date-picker";
import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { FormSelect } from "@/components/forms/form-select";
import { Input } from "@/components/ui/input";
import { IconClipboardPlus, IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { useState } from "react";
import { FormProvider, useWatch, type UseFormReturn } from "react-hook-form";
import type { ReceivingHeaderInput } from "../../../schemas/receiving-schema";
import type { useSupplierSelectConfig } from "@/features/master/suppliers/hooks/use-supplier-select";
import type { usePOSelectConfig } from "../../../hooks/use-po-select";
import type { Supplier } from "@/features/master/suppliers/types";
import type { PurchaseOrder } from "../../../types";

interface ReceivingHeaderCardProps {
    form: UseFormReturn<ReceivingHeaderInput>;
    suppliersLoading?: boolean;
    supplierOptions?: { value: string; label: string }[];
    supplierSelectProps?: ReturnType<typeof useSupplierSelectConfig>;
    posLoading?: boolean;
    poOptions?: { value: string; label: string; description: string }[];
    poSelectProps?: ReturnType<typeof usePOSelectConfig>;
    isPending: boolean;
}

export function ReceivingHeaderCard({
    form,
    suppliersLoading = false,
    supplierOptions = [],
    supplierSelectProps,
    posLoading = false,
    poOptions = [],
    poSelectProps,
    isPending,
}: ReceivingHeaderCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const {
        register,
        formState: { errors },
    } = form;

    const purchaseOrderId = useWatch({ name: "purchase_order_uid", control: form.control });

    return (
        <FormProvider {...form}>
            <form
                id="receiving-header-form"
                onSubmit={(e) => e.preventDefault()}
                className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4"
            >
                <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
                    <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg border border-emerald-100/30">
                        <IconClipboardPlus size={18} />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-slate-900">
                            Informasi Penerimaan Barang
                        </h4>
                        <p className="text-[10px] text-slate-400">
                            Lengkapi info supplier & faktur
                        </p>
                    </div>
                </div>

                <div className="space-y-3.5">
                    {/* Supplier */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Supplier {!purchaseOrderId && " *"}
                        </label>
                        {supplierSelectProps ? (
                            <FormSelect<ReceivingHeaderInput, Supplier>
                                name="supplier_uid"
                                {...supplierSelectProps}
                                placeholder="-- Pilih Supplier --"
                                disabled={isPending || !!purchaseOrderId}
                            />
                        ) : (
                            <FormSelect<ReceivingHeaderInput>
                                name="supplier_uid"
                                options={supplierOptions}
                                placeholder={suppliersLoading ? "Memuat supplier..." : "-- Pilih Supplier --"}
                                disabled={isPending || suppliersLoading || !!purchaseOrderId}
                            />
                        )}
                    </div>

                    {/* Tanggal Penerimaan */}
                    <FormDatePicker<ReceivingHeaderInput>
                        name="tanggal_terima"
                        label="Tanggal Penerimaan *"
                        disabled={isPending}
                    />

                    {/* Collapsible toggle button */}
                    <div className="pt-1">
                        <button
                            type="button"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors duration-150 cursor-pointer border-none bg-transparent"
                        >
                            {isExpanded ? (
                                <>
                                    <IconChevronUp size={14} className="text-slate-400" /> Sembunyikan Detail Tambahan
                                </>
                            ) : (
                                <>
                                    <IconChevronDown size={14} className="text-slate-400" /> Tampilkan Detail Tambahan (PO, Faktur, Catatan)
                                </>
                            )}
                        </button>
                    </div>

                    {/* Collapsible content */}
                    {isExpanded && (
                        <div className="space-y-3.5 pt-2 border-t border-slate-50">
                            {/* Purchase Order */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    Referensi Purchase Order (PO)
                                </label>
                                {poSelectProps ? (
                                    <FormSelect<ReceivingHeaderInput, PurchaseOrder>
                                        name="purchase_order_uid"
                                        {...poSelectProps}
                                        placeholder="-- Pembelian Langsung --"
                                        disabled={isPending}
                                    />
                                ) : (
                                    <FormSelect<ReceivingHeaderInput>
                                        name="purchase_order_uid"
                                        options={poOptions}
                                        placeholder={posLoading ? "Memuat daftar PO..." : "-- Pembelian Langsung --"}
                                        disabled={isPending || posLoading}
                                    />
                                )}
                            </div>

                            {/* Nomor Faktur Supplier */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    Nomor Faktur / Nota Supplier
                                </label>
                                <Input
                                    type="text"
                                    placeholder="Misal: INV-2024-001..."
                                    className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                                    disabled={isPending}
                                    {...register("nomor_faktur")}
                                />
                                {errors.nomor_faktur && (
                                    <p className="text-[10px] text-rose-500 font-medium">
                                        {errors.nomor_faktur.message}
                                    </p>
                                )}
                            </div>

                            {/* Nilai Faktur / Tagihan */}
                            <FormNominalInput<ReceivingHeaderInput>
                                name="nilai_faktur"
                                label="Nilai Tagihan / Faktur Supplier (Rp)"
                                placeholder="Total tagihan dari supplier..."
                                disabled={isPending}
                            />

                            {/* Catatan / Keterangan */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    Catatan Penerimaan
                                </label>
                                <Input
                                    type="text"
                                    placeholder="Catatan tambahan untuk penerimaan..."
                                    className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                                    disabled={isPending}
                                    {...register("catatan")}
                                />
                                {errors.catatan && (
                                    <p className="text-[10px] text-rose-500 font-medium">
                                        {errors.catatan.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </form>
        </FormProvider>
    );
}

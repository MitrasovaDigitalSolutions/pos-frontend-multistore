"use client";

import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { FormSelect } from "@/components/forms/form-select";
import { Button } from "@/components/ui/button";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Input } from "@/components/ui/input";
import { Scrollable } from "@/components/ui/scrollable";
import type { Product } from "@/features/products/types";
import { useAllSuppliers } from "@/features/suppliers/api/suppliers-api";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconPlus, IconTruckDelivery } from "@tabler/icons-react";
import { useEffect } from "react";
import {
    FormProvider,
    useFieldArray,
    useForm,
    type Resolver
} from "react-hook-form";
import { toast } from "sonner";
import {
    useCreateReceiving,
    useUpdateReceiving,
    useReceivingDetail,
} from "../../api/purchase-api";
import { Skeleton } from "@/components/ui/skeleton";
import {
    receivingSchema,
    type ReceivingInput,
} from "../../schemas/receiving-schema";
import type { Receiving } from "../../types";
import { ReceivingItemRow } from "./receiving-item-row";
import {
    RECEIVING_STATUS,
    PAYMENT_STATUS,
    type ReceivingStatus,
} from "@/constants/purchase";

interface ReceivingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    products: Product[];
    editingReceiving?: Receiving | null;
}

export function ReceivingDialog({
    open,
    onOpenChange,
    products,
    editingReceiving = null,
}: ReceivingDialogProps) {
    const createReceiving = useCreateReceiving();
    const updateReceiving = useUpdateReceiving();
    const { data: suppliers = [], isLoading: suppliersLoading } =
        useAllSuppliers();

    const isEdit = !!editingReceiving;

    const { data: detailData, isLoading: detailLoading } = useReceivingDetail(
        editingReceiving?.uid || null,
    );

    const productOptions = products.map((p) => ({
        value: p.uid,
        label: p.nama,
    }));

    const supplierOptions = suppliers.map((s) => ({
        value: String(s.uid),
        label: s.nama,
    }));

    const methods = useForm<ReceivingInput>({
        resolver: zodResolver(receivingSchema) as Resolver<ReceivingInput>,
        defaultValues: {
            supplier_uid: null,
            supplier: "",
            nomor_faktur: "",
            nilai_faktur: null,
            status_pembayaran: PAYMENT_STATUS.PENDING,
            status: RECEIVING_STATUS.COMPLETED,
            catatan: "",
            items: [{ product_uid: "", kuantitas: 0, harga_beli: 0, update_harga_jual: false, harga_jual_baru: null, margin_baru: null }],
        },
    });

    const {
        register,
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = methods;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items",
    });

    useEffect(() => {
        if (open) {
            if (editingReceiving) {
                const currentData = detailData || editingReceiving;
                reset({
                    supplier_uid: currentData.supplier_uid ? String(currentData.supplier_uid) : null,
                    supplier: currentData.supplier || "",
                    nomor_faktur: currentData.nomor_faktur || "",
                    nilai_faktur: currentData.nilai_faktur,
                    status_pembayaran: currentData.status_pembayaran,
                    status: currentData.status,
                    catatan: currentData.catatan || "",
                    items: currentData.items?.map((item) => ({
                        product_uid: String(item.product_uid),
                        kuantitas: item.kuantitas,
                        harga_beli: item.product?.harga_beli ?? item.harga_beli ?? 0,
                        update_harga_jual: false,
                        harga_jual_baru: null,
                        margin_baru: null,
                    })) || [{ product_uid: "", kuantitas: 0, harga_beli: 0, update_harga_jual: false, harga_jual_baru: null, margin_baru: null }],
                });
            } else {
                reset({
                    supplier_uid: null,
                    supplier: "",
                    nomor_faktur: "",
                    nilai_faktur: null,
                    status_pembayaran: PAYMENT_STATUS.PENDING,
                    status: RECEIVING_STATUS.COMPLETED,
                    catatan: "",
                    items: [{ product_uid: "", kuantitas: 0, harga_beli: 0, update_harga_jual: false, harga_jual_baru: null, margin_baru: null }],
                });
            }
        }
    }, [open, editingReceiving, reset, detailData]);

    const isPending = createReceiving.isPending || updateReceiving.isPending;
    const showLoading = isEdit && detailLoading;

    const onSubmit = (data: ReceivingInput) => {
        // Find corresponding supplier name from selected id
        if (data.supplier_uid) {
            const selectedSup = suppliers.find(
                (s) => s.uid === data.supplier_uid,
            );
            if (selectedSup) {
                data.supplier = selectedSup.nama;
            }
        }

        if (isEdit && editingReceiving) {
            updateReceiving.mutate(
                { uid: editingReceiving.uid, data },
                {
                    onSuccess: () => {
                        toast.success("Penerimaan barang berhasil diperbarui.");
                        onOpenChange(false);
                    },
                    onError: (err) => {
                        toast.error(
                            err.message || "Gagal memperbarui penerimaan.",
                        );
                    },
                },
            );
        } else {
            createReceiving.mutate(data, {
                onSuccess: () => {
                    toast.success("Penerimaan barang berhasil disimpan.");
                    onOpenChange(false);
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal mencatat penerimaan.");
                },
            });
        }
    };

    const handleFormSubmit = (status: ReceivingStatus) => {
        setValue("status", status);
        handleSubmit(onSubmit)();
    };

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <>
                    <IconTruckDelivery
                        size={20}
                        className="text-emerald-500"
                    />
                    <span>
                        {isEdit
                            ? `Ubah Penerimaan Draft (${editingReceiving.nomor_penerimaan})`
                            : "Penerimaan Barang Dari Supplier"}
                    </span>
                </>
            }
            className="max-w-fit! flex flex-col max-h-[90vh]"
        >
            <FormProvider {...methods}>
                <form
                    onSubmit={(e) => e.preventDefault()}
                    className="flex flex-col flex-1 overflow-hidden min-h-0 pt-4"
                >
                    <Scrollable className="flex-1 pr-1">
                        {showLoading ? (
                            <div className="space-y-4 pb-4 pr-1">
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Supplier Dropdown Skeleton */}
                                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                        <Skeleton className="h-3 w-16 rounded" />
                                        <Skeleton className="h-10 w-full rounded-xl" />
                                    </div>

                                    {/* No. Faktur Skeleton */}
                                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                        <Skeleton className="h-3 w-16 rounded" />
                                        <Skeleton className="h-10 w-full rounded-xl" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Nilai Faktur Skeleton */}
                                    <div className="col-span-2 sm:col-span-1 space-y-1.5">
                                        <Skeleton className="h-3 w-28 rounded" />
                                        <Skeleton className="h-10 w-full rounded-xl" />
                                    </div>

                                    {/* Status Pembayaran Skeleton */}
                                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                        <Skeleton className="h-3 w-28 rounded" />
                                        <Skeleton className="h-10 w-full rounded-xl" />
                                    </div>
                                </div>

                                {/* Catatan Skeleton */}
                                <div className="space-y-1.5">
                                    <Skeleton className="h-3 w-16 rounded" />
                                    <Skeleton className="h-10 w-full rounded-xl" />
                                </div>

                                {/* Items Rows Skeleton */}
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <div className="flex justify-between items-center">
                                        <Skeleton className="h-4 w-28 rounded" />
                                        <Skeleton className="h-7 w-20 rounded-lg" />
                                    </div>
                                    {[...Array(2)].map((_, i) => (
                                        <div key={i} className="bg-slate-50/50 border border-slate-100 p-4 rounded-xl space-y-3">
                                            <div className="grid grid-cols-12 gap-3">
                                                <div className="col-span-12 sm:col-span-6 space-y-1.5">
                                                    <Skeleton className="h-3 w-24 rounded" />
                                                    <Skeleton className="h-10 w-full rounded-xl" />
                                                </div>
                                                <div className="col-span-4 sm:col-span-2 space-y-1.5">
                                                    <Skeleton className="h-3 w-10 rounded" />
                                                    <Skeleton className="h-10 w-full rounded-xl" />
                                                </div>
                                                <div className="col-span-8 sm:col-span-3 space-y-1.5">
                                                    <Skeleton className="h-3 w-16 rounded" />
                                                    <Skeleton className="h-10 w-full rounded-xl" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 pb-4 pr-1">
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Supplier Dropdown */}
                                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            Supplier *
                                        </label>
                                        <FormSelect<ReceivingInput>
                                            name="supplier_uid"
                                            options={supplierOptions}
                                            placeholder={
                                                suppliersLoading
                                                    ? "Memuat supplier..."
                                                    : "-- Pilih Supplier --"
                                            }
                                            disabled={isPending || suppliersLoading}
                                        />
                                        {errors.supplier_uid && (
                                            <p className="text-[10px] text-rose-500 font-medium">
                                                {errors.supplier_uid.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* No. Faktur */}
                                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            No. Faktur
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="FAK-XXXX..."
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
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Nilai Faktur */}
                                    <div className="col-span-2 sm:col-span-1">
                                        <FormNominalInput<ReceivingInput>
                                            name="nilai_faktur"
                                            label="Nilai Faktur / Invoice"
                                            placeholder="Total tagihan Rp..."
                                            disabled={isPending}
                                        />
                                    </div>

                                    {/* Status Pembayaran */}
                                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            Status Pembayaran
                                        </label>
                                        <FormSelect<ReceivingInput>
                                            name="status_pembayaran"
                                            options={[
                                                {
                                                    value: PAYMENT_STATUS.PENDING,
                                                    label: "Pending",
                                                },
                                                {
                                                    value: PAYMENT_STATUS.UNPAID,
                                                    label: "Belum Dibayar / Tempo",
                                                },
                                                {
                                                    value: PAYMENT_STATUS.PAID,
                                                    label: "Paid / Lunas",
                                                },
                                            ]}
                                            placeholder="Pilih status"
                                            disabled={isPending}
                                        />
                                        {errors.status_pembayaran && (
                                            <p className="text-[10px] text-rose-500 font-medium">
                                                {errors.status_pembayaran.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Catatan */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                        Catatan
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="Catatan penerimaan..."
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

                                {/* Items Rows */}
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <div className="flex justify-between items-center">
                                        <h5 className="text-xs font-bold text-slate-800">
                                            Daftar Barang Diterima
                                        </h5>
                                    </div>

                                    <div className="space-y-3">
                                        {fields.map((field, idx) => (
                                            <ReceivingItemRow
                                                key={field.id}
                                                idx={idx}
                                                isPending={isPending}
                                                products={products}
                                                productOptions={productOptions}
                                                remove={remove}
                                                showDelete={fields.length > 1}
                                            />
                                        ))}
                                    </div>

                                    <Button
                                        type="button"
                                        onClick={() =>
                                            append({
                                                product_uid: "",
                                                kuantitas: 0,
                                                harga_beli: 0,
                                                update_harga_jual: false,
                                                harga_jual_baru: null,
                                                margin_baru: null,
                                            })
                                        }
                                        variant="outline"
                                        className="w-full h-10 border-dashed border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 text-slate-500 hover:text-emerald-600 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-white"
                                        disabled={isPending}
                                    >
                                        <IconPlus size={16} />
                                        <span>Tambah Barang</span>
                                    </Button>

                                    {errors.items && (
                                        <p className="text-[10px] text-rose-500 font-medium">
                                            {errors.items.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </Scrollable>

                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-100 shrink-0 bg-white">
                        <Button
                            type="button"
                            onClick={() => handleFormSubmit(RECEIVING_STATUS.DRAFT)}
                            className="w-full sm:w-auto px-6 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                            disabled={isPending || showLoading}
                        >
                            Simpan Draft
                        </Button>
                        <Button
                            type="button"
                            onClick={() => handleFormSubmit(RECEIVING_STATUS.COMPLETED)}
                            className="w-full sm:w-auto px-6 h-11 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                            disabled={isPending || showLoading}
                        >
                            {isPending
                                ? "Menyimpan..."
                                : "Selesai & Tambah Stok"}
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </BaseDialog>
    );
}

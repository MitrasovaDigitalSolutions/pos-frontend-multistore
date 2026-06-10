"use client";

import { FormSelect } from "@/components/forms/form-select";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Scrollable } from "@/components/ui/scrollable";
import type { Product } from "@/features/products/types";
import { useAllSuppliers } from "@/features/suppliers/api/suppliers-api";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconPlus, IconClipboardCheck } from "@tabler/icons-react";
import { useEffect } from "react";
import {
    FormProvider,
    useFieldArray,
    useForm,
    type Resolver
} from "react-hook-form";
import { toast } from "sonner";
import {
    useCreatePurchaseOrder,
    useUpdatePurchaseOrder,
    usePurchaseOrderDetail,
} from "../api/purchase-api";
import { Skeleton } from "@/components/ui/skeleton";
import {
    purchaseOrderSchema,
    type PurchaseOrderInput,
} from "../schemas/order-schema";
import type { PurchaseOrder } from "../types";
import { OrderItemRow } from "./order-item-row";
import { formatRupiah } from "@/hooks/use-format-rupiah";

interface OrderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    products: Product[];
    editingOrder?: PurchaseOrder | null;
}

export function OrderDialog({
    open,
    onOpenChange,
    products,
    editingOrder = null,
}: OrderDialogProps) {
    const createOrder = useCreatePurchaseOrder();
    const updateOrder = useUpdatePurchaseOrder();
    const { data: suppliers = [], isLoading: suppliersLoading } = useAllSuppliers();

    const isEdit = !!editingOrder;

    const { data: detailData, isLoading: detailLoading } = usePurchaseOrderDetail(
        editingOrder?.id || null,
    );

    const productOptions = products.map((p) => ({
        value: String(p.id),
        label: p.nama,
    }));

    const supplierOptions = suppliers.map((s) => ({
        value: String(s.id),
        label: s.nama,
    }));

    const methods = useForm<PurchaseOrderInput>({
        resolver: zodResolver(purchaseOrderSchema) as Resolver<PurchaseOrderInput>,
        defaultValues: {
            supplier_id: null,
            supplier_name: "",
            tanggal_po: new Date().toISOString().split("T")[0],
            catatan: "",
            items: [{ product_id: 0, kuantitas: 0, harga_estimasi: 0 }],
        },
    });

    const {
        register,
        control,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = methods;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items",
    });

    useEffect(() => {
        if (open) {
            if (editingOrder) {
                const currentData = detailData || editingOrder;
                reset({
                    supplier_id: currentData.supplier_id,
                    supplier_name: currentData.supplier_name || "",
                    tanggal_po: currentData.tanggal_po,
                    catatan: currentData.catatan || "",
                    items: currentData.items?.map((item) => ({
                        product_id: item.product_id,
                        kuantitas: item.kuantitas,
                        harga_estimasi: item.harga_estimasi || 0,
                    })) || [{ product_id: 0, kuantitas: 0, harga_estimasi: 0 }],
                });
            } else {
                reset({
                    supplier_id: null,
                    supplier_name: "",
                    tanggal_po: new Date().toISOString().split("T")[0],
                    catatan: "",
                    items: [{ product_id: 0, kuantitas: 0, harga_estimasi: 0 }],
                });
            }
        }
    }, [open, editingOrder, reset, detailData]);

    const isPending = createOrder.isPending || updateOrder.isPending;
    const showLoading = isEdit && detailLoading;

    // Calculate live total estimation
    const itemsWatch = watch("items") || [];
    const liveTotalEstimation = itemsWatch.reduce((acc, curr) => {
        const qty = Number(curr?.kuantitas) || 0;
        const price = Number(curr?.harga_estimasi) || 0;
        return acc + qty * price;
    }, 0);

    const onSubmit = (data: PurchaseOrderInput) => {
        // Find corresponding supplier name from selected id
        if (data.supplier_id) {
            const selectedSup = suppliers.find(
                (s) => s.id === Number(data.supplier_id),
            );
            if (selectedSup) {
                data.supplier_name = selectedSup.nama;
            }
        }

        if (isEdit && editingOrder) {
            updateOrder.mutate(
                { id: editingOrder.id, data },
                {
                    onSuccess: () => {
                        toast.success("Draft Purchase Order berhasil diperbarui.");
                        onOpenChange(false);
                    },
                    onError: (err) => {
                        toast.error(
                            err.message || "Gagal memperbarui draft Purchase Order.",
                        );
                    },
                },
            );
        } else {
            createOrder.mutate(data, {
                onSuccess: () => {
                    toast.success("Draft Purchase Order berhasil disimpan.");
                    onOpenChange(false);
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal membuat Purchase Order.");
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-fit! bg-white rounded-2xl border-slate-100 p-6 flex flex-col max-h-[90vh]">
                <DialogHeader className="pb-4 border-b border-slate-100 shrink-0 flex flex-row justify-between items-center gap-6">
                    <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <IconClipboardCheck
                            size={20}
                            className="text-emerald-500"
                        />
                        <span>
                            {isEdit
                                ? `Ubah Draft PO (${editingOrder.nomor_po})`
                                : "Buat Dokumen Pemesanan (Purchase Order)"}
                        </span>
                    </DialogTitle>

                    {!showLoading && (
                        <div className="bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100/50 flex flex-col items-end mr-4">
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                Nilai Estimasi Total
                            </span>
                            <span className="text-xs font-extrabold text-emerald-600 font-mono">
                                {formatRupiah(liveTotalEstimation)}
                            </span>
                        </div>
                    )}
                </DialogHeader>

                <FormProvider {...methods}>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="flex flex-col flex-1 overflow-hidden min-h-0 pt-4"
                    >
                        <Scrollable className="flex-1 pr-1">
                            {showLoading ? (
                                <div className="space-y-4 pb-4 pr-1">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                            <Skeleton className="h-3 w-16 rounded" />
                                            <Skeleton className="h-10 w-full rounded-xl" />
                                        </div>
                                        <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                            <Skeleton className="h-3 w-16 rounded" />
                                            <Skeleton className="h-10 w-full rounded-xl" />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Skeleton className="h-3 w-16 rounded" />
                                        <Skeleton className="h-10 w-full rounded-xl" />
                                    </div>

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
                                            <FormSelect<PurchaseOrderInput>
                                                name="supplier_id"
                                                options={supplierOptions}
                                                placeholder={
                                                    suppliersLoading
                                                        ? "Memuat supplier..."
                                                        : "-- Pilih Supplier --"
                                                }
                                                disabled={isPending || suppliersLoading}
                                            />
                                            {errors.supplier_id && (
                                                <p className="text-[10px] text-rose-500 font-medium">
                                                    {errors.supplier_id.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* Tanggal PO */}
                                        <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                Tanggal PO *
                                            </label>
                                            <Input
                                                type="date"
                                                className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                                                disabled={isPending}
                                                {...register("tanggal_po")}
                                            />
                                            {errors.tanggal_po && (
                                                <p className="text-[10px] text-rose-500 font-medium">
                                                    {errors.tanggal_po.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Catatan */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            Catatan / Keterangan
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="Catatan pengerjaan atau detail pengiriman..."
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
                                                Daftar Barang yang Dipesan
                                            </h5>
                                        </div>

                                        <div className="space-y-3">
                                            {fields.map((field, idx) => (
                                                <OrderItemRow
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
                                                    product_id: 0,
                                                    kuantitas: 0,
                                                    harga_estimasi: 0,
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
                                onClick={() => onOpenChange(false)}
                                variant="outline"
                                className="w-full sm:w-auto px-6 h-11 border-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center cursor-pointer bg-white"
                                disabled={isPending}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className="w-full sm:w-auto px-6 h-11 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                                disabled={isPending || showLoading}
                            >
                                {isPending ? "Menyimpan..." : "Simpan Draft PO"}
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
}

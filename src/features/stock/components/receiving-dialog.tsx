"use client";

import { useEffect } from "react";
import {
    useForm,
    useFieldArray,
    FormProvider,
    type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/forms/form-select";
import { IconTruckDelivery, IconX } from "@tabler/icons-react";
import { toast } from "sonner";
import {
    receivingSchema,
    type ReceivingInput,
} from "../schemas/receiving-schema";
import {
    useCreateReceiving,
    useUpdateReceiving,
    useAllSuppliers,
} from "../api/stock-api";
import type { Product } from "@/features/products/types";
import type { Receiving } from "../types";

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

    const productOptions = products.map((p) => ({
        value: String(p.id),
        label: p.nama,
    }));

    const supplierOptions = suppliers.map((s) => ({
        value: String(s.id),
        label: s.nama,
    }));

    const methods = useForm<ReceivingInput>({
        resolver: zodResolver(receivingSchema) as Resolver<ReceivingInput>,
        defaultValues: {
            supplier_id: null,
            supplier: "",
            nomor_faktur: "",
            nilai_faktur: null,
            status_pembayaran: "pending",
            status: "completed",
            catatan: "",
            items: [{ product_id: 0, kuantitas: 0 }],
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
                reset({
                    supplier_id: editingReceiving.supplier_id,
                    supplier: editingReceiving.supplier || "",
                    nomor_faktur: editingReceiving.nomor_faktur || "",
                    nilai_faktur: editingReceiving.nilai_faktur,
                    status_pembayaran: editingReceiving.status_pembayaran,
                    status: editingReceiving.status,
                    catatan: editingReceiving.catatan || "",
                    items: editingReceiving.items?.map((item) => ({
                        product_id: item.product_id,
                        kuantitas: item.kuantitas,
                    })) || [{ product_id: 0, kuantitas: 0 }],
                });
            } else {
                reset({
                    supplier_id: null,
                    supplier: "",
                    nomor_faktur: "",
                    nilai_faktur: null,
                    status_pembayaran: "pending",
                    status: "completed",
                    catatan: "",
                    items: [{ product_id: 0, kuantitas: 0 }],
                });
            }
        }
    }, [open, editingReceiving, reset]);

    const isPending = createReceiving.isPending || updateReceiving.isPending;

    const onSubmit = (data: ReceivingInput) => {
        // Find corresponding supplier name from selected id
        if (data.supplier_id) {
            const selectedSup = suppliers.find(
                (s) => s.id === Number(data.supplier_id),
            );
            if (selectedSup) {
                data.supplier = selectedSup.nama;
            }
        }

        if (isEdit && editingReceiving) {
            updateReceiving.mutate(
                { id: editingReceiving.id, data },
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

    const handleFormSubmit = (status: "draft" | "completed") => {
        setValue("status", status);
        handleSubmit(onSubmit)();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-fit! bg-white rounded-2xl border-slate-100 p-6 flex flex-col max-h-[90vh]">
                <DialogHeader className="pb-4 border-b border-slate-100 shrink-0">
                    <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <IconTruckDelivery
                            size={20}
                            className="text-emerald-500"
                        />
                        <span>
                            {isEdit
                                ? `Ubah Penerimaan Draft (${editingReceiving.nomor_penerimaan})`
                                : "Penerimaan Barang Dari Supplier"}
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <FormProvider {...methods}>
                    <form
                        onSubmit={(e) => e.preventDefault()}
                        className="flex flex-col flex-1 overflow-hidden min-h-0 pt-4"
                    >
                        <div className="flex-1 overflow-y-auto pr-1 space-y-4 pb-4">
                            <div className="grid grid-cols-2 gap-4">
                                {/* Supplier Dropdown */}
                                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                        Supplier *
                                    </label>
                                    <FormSelect<ReceivingInput>
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
                                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                        Nilai Faktur / Invoice
                                    </label>
                                    <Input
                                        type="number"
                                        placeholder="Total tagihan Rp..."
                                        className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                                        disabled={isPending}
                                        {...register("nilai_faktur")}
                                    />
                                    {errors.nilai_faktur && (
                                        <p className="text-[10px] text-rose-500 font-medium">
                                            {errors.nilai_faktur.message}
                                        </p>
                                    )}
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
                                                value: "pending",
                                                label: "Pending / Tempo",
                                            },
                                            {
                                                value: "paid",
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
                            <div className="space-y-3 pt-2 border-t border-slate-100">
                                <div className="flex justify-between items-center">
                                    <h5 className="text-xs font-bold text-slate-800">
                                        Daftar Item Masuk
                                    </h5>
                                    <Button
                                        type="button"
                                        onClick={() =>
                                            append({ product_id: 0, kuantitas: 0 })
                                        }
                                        className="h-7 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2 rounded-lg cursor-pointer"
                                        disabled={isPending}
                                    >
                                        + Baris Item
                                    </Button>
                                </div>

                                {fields.length > 0 && (
                                    <div className="hidden sm:flex gap-2 items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">
                                        <div className="grow">Nama Produk</div>
                                        <div className="w-24">Kuantitas</div>
                                        {fields.length > 1 && <div className="w-6.5"></div>}
                                    </div>
                                )}

                                {fields.map((field, idx) => (
                                    <div
                                        key={field.id}
                                        className="flex gap-2 items-center"
                                    >
                                        <div className="grow">
                                            <FormSelect<ReceivingInput>
                                                name={
                                                    `items.${idx}.product_id` as any
                                                }
                                                options={productOptions}
                                                placeholder="-- Pilih Produk --"
                                                disabled={isPending}
                                            />
                                        </div>
                                        <div className="w-24">
                                            <Input
                                                type="number"
                                                placeholder="Qty"
                                                className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                                                disabled={isPending}
                                                {...register(
                                                    `items.${idx}.kuantitas`,
                                                )}
                                            />
                                        </div>
                                        {fields.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => remove(idx)}
                                                className="p-1 text-rose-500 hover:bg-rose-50 rounded transition-colors border-none bg-transparent cursor-pointer"
                                                disabled={isPending}
                                            >
                                                <IconX size={18} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {errors.items && (
                                    <p className="text-[10px] text-rose-500 font-medium">
                                        {errors.items.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-100 shrink-0 bg-white">
                            <Button
                                type="button"
                                onClick={() => handleFormSubmit("draft")}
                                className="w-full sm:w-auto px-6 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                                disabled={isPending}
                            >
                                Simpan Draft
                            </Button>
                            <Button
                                type="button"
                                onClick={() => handleFormSubmit("completed")}
                                className="w-full sm:w-auto px-6 h-11 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                                disabled={isPending}
                            >
                                {isPending
                                    ? "Menyimpan..."
                                    : "Selesai & Tambah Stok"}
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
}

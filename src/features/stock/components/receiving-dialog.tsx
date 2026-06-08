"use client";

import { useEffect } from "react";
import { useForm, useFieldArray, FormProvider, type Resolver } from "react-hook-form";
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
import { useCreateReceiving } from "../api/stock-api";
import type { Product } from "@/features/products/types";

interface ReceivingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    products: Product[];
}

export function ReceivingDialog({
    open,
    onOpenChange,
    products,
}: ReceivingDialogProps) {
    const createReceiving = useCreateReceiving();
    
    const productOptions = products.map((p) => ({
        value: String(p.id),
        label: p.nama,
    }));

    const methods = useForm<ReceivingInput>({
        resolver: zodResolver(receivingSchema) as Resolver<ReceivingInput>,
        defaultValues: {
            supplier: "",
            nomor_faktur: "",
            catatan: "",
            items: [{ product_id: 0, kuantitas: 0 }],
        },
    });

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = methods;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items",
    });

    useEffect(() => {
        if (open) {
            reset({
                supplier: "",
                nomor_faktur: "",
                catatan: "",
                items: [{ product_id: 0, kuantitas: 0 }],
            });
        }
    }, [open, reset]);

    const isPending = createReceiving.isPending;

    const onSubmit = (data: ReceivingInput) => {
        createReceiving.mutate(data, {
            onSuccess: () => {
                toast.success("Penerimaan barang berhasil disimpan.");
                onOpenChange(false);
            },
            onError: (err) => {
                toast.error(err.message || "Gagal mencatat penerimaan.");
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-125 bg-white rounded-2xl border-slate-100 p-6 overflow-y-auto max-h-[90vh]">
                <DialogHeader className="pb-4 border-b border-slate-100">
                    <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <IconTruckDelivery
                            size={20}
                            className="text-emerald-500"
                        />
                        <span>Penerimaan Barang Dari Supplier</span>
                    </DialogTitle>
                </DialogHeader>

                <FormProvider {...methods}>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4 pt-4"
                    >
                        <div className="grid grid-cols-2 gap-3">
                            {/* Supplier */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    Supplier
                                </label>
                                <Input
                                    type="text"
                                    placeholder="Nama supplier/distributor..."
                                    className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                                    disabled={isPending}
                                    {...register("supplier")}
                                />
                                {errors.supplier && (
                                    <p className="text-[10px] text-rose-500 font-medium">
                                        {errors.supplier.message}
                                    </p>
                                )}
                            </div>

                            {/* No. Faktur */}
                            <div className="space-y-1.5">
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

                            {fields.map((field, idx) => (
                                <div
                                    key={field.id}
                                    className="flex gap-2 items-center"
                                >
                                    <div className="grow">
                                        <FormSelect<ReceivingInput>
                                            name={`items.${idx}.product_id` as any}
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
                                            {...register(`items.${idx}.kuantitas`)}
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

                        <Button
                            type="submit"
                            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer mt-4"
                            disabled={isPending}
                        >
                            {isPending ? "Menyimpan..." : "Terima Barang Masuk"}
                        </Button>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
}

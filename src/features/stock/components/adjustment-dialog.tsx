"use client";

import { useEffect } from "react";
import { useForm, FormProvider, type Resolver } from "react-hook-form";
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
import { IconActivity } from "@tabler/icons-react";
import { toast } from "sonner";
import { FormNumberInput } from "@/components/forms/form-number-input";
import {
    adjustmentSchema,
    type AdjustmentInput,
} from "../schemas/adjustment-schema";
import { useCreateAdjustment } from "../api/stock-api";
import type { Product } from "@/features/products/types";

interface AdjustmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    products: Product[];
}

export function AdjustmentDialog({
    open,
    onOpenChange,
    products,
}: AdjustmentDialogProps) {
    const createAdjustment = useCreateAdjustment();
    
    const productOptions = products.map((p) => ({
        value: String(p.id),
        label: `${p.nama} (Stok: ${p.stok})`,
    }));

    const methods = useForm<AdjustmentInput>({
        resolver: zodResolver(adjustmentSchema) as Resolver<AdjustmentInput>,
        defaultValues: {
            product_id: 0,
            kuantitas: 0,
            alasan: "",
        },
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = methods;

    useEffect(() => {
        if (open) {
            reset({
                product_id: 0,
                kuantitas: 0,
                alasan: "",
            });
        }
    }, [open, reset]);

    const isPending = createAdjustment.isPending;

    const onSubmit = (data: AdjustmentInput) => {
        createAdjustment.mutate(data, {
            onSuccess: () => {
                toast.success("Penyesuaian stok manual berhasil disimpan!");
                onOpenChange(false);
            },
            onError: (err) => {
                toast.error(err.message || "Gagal melakukan penyesuaian.");
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-110 bg-white rounded-2xl border-slate-100 p-6">
                <DialogHeader className="pb-4 border-b border-slate-100">
                    <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <IconActivity size={20} className="text-amber-500" />
                        <span>Penyesuaian Stok Manual</span>
                    </DialogTitle>
                </DialogHeader>

                <FormProvider {...methods}>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4 pt-4"
                    >
                        {/* Pilih Produk */}
                        <FormSelect<AdjustmentInput>
                            name="product_id"
                            label="Pilih Produk"
                            options={productOptions}
                            placeholder="-- Pilih Produk --"
                            disabled={isPending}
                        />

                        <FormNumberInput<AdjustmentInput>
                            name="kuantitas"
                            label="Kuantitas Perubahan (+ / -)"
                            placeholder="Contoh: -5 untuk kurangi, 10 untuk tambah..."
                            disabled={isPending}
                            allowNegative={true}
                        />

                        {/* Alasan */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Alasan Penyesuaian
                            </label>
                            <Input
                                type="text"
                                placeholder="Contoh: Barang rusak, display hilang..."
                                className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                                disabled={isPending}
                                {...register("alasan")}
                            />
                            {errors.alasan && (
                                <p className="text-[10px] text-rose-500 font-medium">
                                    {errors.alasan.message}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 bg-amber-600 hover:bg-amber-700 font-bold text-xs text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer mt-4"
                            disabled={isPending}
                        >
                            {isPending ? "Menyimpan..." : "Simpan Penyesuaian"}
                        </Button>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
}

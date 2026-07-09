"use client";

import { useEffect, useState } from "react";
import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BaseDialog } from "@/components/ui/base-dialog";
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
import { useProducts } from "@/features/products/api/products-api";
import { useDebounce } from "@/hooks/use-debounce";
import type { Product } from "@/features/products/types";

interface AdjustmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    products?: Product[];
}

export function AdjustmentDialog({
    open,
    onOpenChange,
}: AdjustmentDialogProps) {
    const createAdjustment = useCreateAdjustment();
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 300);

    const [prevOpen, setPrevOpen] = useState(open);
    if (open !== prevOpen) {
        setPrevOpen(open);
        if (open) {
            setSearch("");
        }
    }

    const { data: productsData, isLoading: isProductsLoading } = useProducts({
        search: debouncedSearch || undefined,
        per_page: 50,
    });

    const productOptions = (productsData?.data || []).map((p) => ({
        value: p.uid,
        label: `${p.nama} (Stok: ${p.stok})`,
        description: p.barcode || undefined,
    }));

    const methods = useForm<AdjustmentInput>({
        resolver: zodResolver(adjustmentSchema) as Resolver<AdjustmentInput>,
        defaultValues: {
            product_uid: "",
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
                product_uid: "",
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
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <>
                    <IconActivity size={20} className="text-amber-500" />
                    <span>Penyesuaian Stok Manual</span>
                </>
            }
            className="max-w-110"
        >
            <FormProvider {...methods}>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4 pt-4"
                >
                    {/* Pilih Produk */}
                    <FormSelect<AdjustmentInput>
                        name="product_uid"
                        label="Pilih Produk"
                        options={productOptions}
                        placeholder="-- Pilih Produk --"
                        disabled={isPending}
                        onSearchChange={setSearch}
                        isLoading={isProductsLoading}
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
        </BaseDialog>
    );
}

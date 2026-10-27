"use client";

import { FormDatePicker } from "@/components/forms/form-date-picker";
import { FormInput } from "@/components/forms/form-input";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { useCreateProductBatch } from "../../api/pharmacy-api";
import { batchFormSchema, type BatchFormValues } from "../../schemas/batch-schema";

interface BatchFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productUid: string;
    productName?: string;
}

export function BatchFormDialog({
    open,
    onOpenChange,
    productUid,
    productName,
}: BatchFormDialogProps) {
    const createBatch = useCreateProductBatch(productUid);

    const methods = useForm<BatchFormValues>({
        resolver: zodResolver(batchFormSchema) as Resolver<BatchFormValues>,
        defaultValues: {
            batch_number: "",
            expired_date: "",
            stock: 0,
            status: "active",
        },
    });

    const {
        handleSubmit,
        reset,
        formState: { isSubmitting },
    } = methods;

    const onSubmit = async (values: BatchFormValues) => {
        try {
            await createBatch.mutateAsync({
                batch_number: values.batch_number.trim(),
                expired_date: values.expired_date,
                stock: values.stock,
                status: values.status,
            });
            toast.success("Nomor batch obat berhasil ditambahkan");
            reset();
            onOpenChange(false);
        } catch (error: unknown) {
            const err = error as { message?: string };
            toast.error(err.message || "Gagal menambahkan nomor batch obat");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                        Tambah Batch Baru
                    </DialogTitle>
                    {productName && (
                        <p className="text-xs text-slate-500 font-medium truncate">
                            Produk: <span className="font-bold text-slate-700 dark:text-slate-300">{productName}</span>
                        </p>
                    )}
                </DialogHeader>

                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <FormInput<BatchFormValues>
                            name="batch_number"
                            label="Nomor Batch"
                            placeholder="Contoh: BTH-2026-X1"
                            required
                        />

                        <FormDatePicker<BatchFormValues>
                            name="expired_date"
                            label="Tanggal Kadaluarsa (Expired Date)"
                            placeholder="Pilih tanggal kadaluarsa"
                        />

                        <FormNumberInput<BatchFormValues>
                            name="stock"
                            label="Stok Masuk / Stok Awal Batch"
                            placeholder="0"
                            min={0}
                        />

                        <DialogFooter className="pt-2 flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting || createBatch.isPending}
                                className="h-8 text-xs"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={isSubmitting || createBatch.isPending}
                                className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                {createBatch.isPending ? "Menyimpan..." : "Simpan Batch"}
                            </Button>
                        </DialogFooter>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
}

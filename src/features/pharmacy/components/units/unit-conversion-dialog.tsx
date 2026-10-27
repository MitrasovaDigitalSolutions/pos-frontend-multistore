"use client";

import { useMemo } from "react";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { FormInput } from "@/components/forms/form-input";
import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconLayersIntersect } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import {
    useCreateProductUnit,
    useDeleteProductUnit,
    useProductUnits,
} from "../../api/pharmacy-api";
import {
    unitConversionSchema,
    type UnitConversionFormValues,
} from "../../schemas/unit-schema";
import type { UnitConversion } from "../../types";

interface UnitConversionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productUid: string;
    productName?: string;
    baseUnit?: string;
}

export function UnitConversionDialog({
    open,
    onOpenChange,
    productUid,
    productName,
    baseUnit = "Satuan Dasar",
}: UnitConversionDialogProps) {
    const { data: unitsData, isLoading, refetch } = useProductUnits(productUid);
    const createUnit = useCreateProductUnit(productUid);
    const deleteUnit = useDeleteProductUnit(productUid);

    const units = Array.isArray(unitsData?.data) ? unitsData.data : [];

    const methods = useForm<UnitConversionFormValues>({
        resolver: zodResolver(unitConversionSchema) as Resolver<UnitConversionFormValues>,
        defaultValues: {
            unit_name: "",
            conversion_factor: 1,
            barcode: "",
            price: null,
        },
    });

    const {
        handleSubmit,
        reset,
        formState: { isSubmitting },
    } = methods;

    const onSubmit = async (values: UnitConversionFormValues) => {
        try {
            await createUnit.mutateAsync({
                unit_name: values.unit_name.trim(),
                conversion_factor: values.conversion_factor,
                barcode: values.barcode?.trim() || null,
                price: values.price || null,
            });
            toast.success("Konversi satuan bertingkat berhasil ditambahkan");
            reset();
            refetch();
        } catch (error: unknown) {
            const err = error as { message?: string };
            toast.error(err.message || "Gagal menambahkan konversi satuan");
        }
    };

    const handleDelete = async (conversionUid: string, unitName: string) => {
        if (!confirm(`Hapus aturan konversi satuan "${unitName}"?`)) return;
        try {
            await deleteUnit.mutateAsync(conversionUid);
            toast.success("Satuan konversi berhasil dihapus");
            refetch();
        } catch (error: unknown) {
            const err = error as { message?: string };
            toast.error(err.message || "Gagal menghapus satuan konversi");
        }
    };

    const columns = useMemo<ColumnDef<UnitConversion, unknown>[]>(
        () => [
            {
                accessorKey: "unit_name",
                header: "Satuan",
                cell: ({ row }) => (
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                        {row.original.unit_name}
                    </span>
                ),
            },
            {
                id: "conversion_factor",
                header: "Rasio Konversi",
                cell: ({ row }) => (
                    <span className="text-slate-600 dark:text-slate-400">
                        1 {row.original.unit_name} = {row.original.conversion_factor} {baseUnit}
                    </span>
                ),
            },
            {
                accessorKey: "barcode",
                header: "Barcode",
                cell: ({ row }) => (
                    <span className="font-mono text-[11px] text-slate-500">
                        {row.original.barcode || "—"}
                    </span>
                ),
            },
            {
                accessorKey: "price",
                header: "Harga",
                meta: {
                    headerClassName: "text-right",
                    cellClassName: "text-right font-bold tabular-nums",
                },
                cell: ({ row }) =>
                    row.original.price ? formatRupiah(row.original.price) : "Sesuai Rasio",
            },
        ],
        [baseUnit]
    );

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div>
                    <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                        Multi-Satuan Bertingkat (Konversi Unit)
                    </span>
                    {productName && (
                        <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                            Produk: <span className="font-bold text-slate-700 dark:text-slate-300">{productName}</span>{" "}
                            (Satuan Dasar: <span className="text-emerald-600 font-bold">{baseUnit}</span>)
                        </p>
                    )}
                </div>
            }
            className="sm:max-w-xl"
            scrollable={true}
        >
            <div className="space-y-4">
                {/* Form Input Satuan Baru */}
                <FormProvider {...methods}>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3"
                    >
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <IconLayersIntersect size={14} className="text-emerald-500" />
                            Tambah Satuan Bertingkat Baru
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <FormInput<UnitConversionFormValues>
                                name="unit_name"
                                label="Nama Satuan Baru"
                                placeholder="Contoh: Strip / Box"
                                required
                            />

                            <FormNumberInput<UnitConversionFormValues>
                                name="conversion_factor"
                                label="Isi per Satuan (Konversi)"
                                placeholder="Contoh: 10"
                                min={1}
                            />

                            <FormNominalInput<UnitConversionFormValues>
                                name="price"
                                label="Harga Jual Satuan Ini (Opsional)"
                                placeholder="Rp 0"
                            />

                            <FormInput<UnitConversionFormValues>
                                name="barcode"
                                label="Barcode Khusus Satuan Ini (Opsional)"
                                placeholder="Barcode kemasan..."
                            />
                        </div>

                        <div className="flex justify-end pt-1">
                            <Button
                                type="submit"
                                size="sm"
                                disabled={isSubmitting || createUnit.isPending}
                                className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                            >
                                {createUnit.isPending ? "Menyimpan..." : "Tambah Satuan"}
                            </Button>
                        </div>
                    </form>
                </FormProvider>

                {/* Daftar Satuan Terdaftar */}
                <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Daftar Satuan Bertingkat Aktif
                    </h4>
                    <div className="rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                        <DataTable<UnitConversion, unknown>
                            columns={columns}
                            data={units}
                            isLoading={isLoading}
                            emptyMessage="Belum ada multi-satuan bertingkat yang dikonfigurasi."
                            virtualize={false}
                            showViewToggle={false}
                            onDelete={(unit) => handleDelete(unit.uid, unit.unit_name)}
                        />
                    </div>
                </div>
            </div>
        </BaseDialog>
    );
}

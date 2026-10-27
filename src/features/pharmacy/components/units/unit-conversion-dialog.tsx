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
            multiplier: 1,
            selling_price: null,
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
                multiplier: Number(values.multiplier),
                selling_price: values.selling_price ? Number(values.selling_price) : null,
            });
            toast.success("Konversi satuan bertingkat berhasil ditambahkan");
            reset({
                unit_name: "",
                multiplier: 1,
                selling_price: null,
            });
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
                id: "multiplier",
                header: "Rasio Konversi",
                cell: ({ row }) => (
                    <span className="text-slate-600 dark:text-slate-400 font-mono text-xs">
                        1 {row.original.unit_name} = <strong className="text-slate-800 dark:text-slate-200 font-bold">{row.original.multiplier}</strong> {baseUnit}
                    </span>
                ),
            },
            {
                accessorKey: "selling_price",
                header: "Harga Jual",
                meta: {
                    headerClassName: "text-right",
                    cellClassName: "text-right font-bold tabular-nums",
                },
                cell: ({ row }) =>
                    row.original.selling_price ? (
                        <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">
                            {formatRupiah(row.original.selling_price)}
                        </span>
                    ) : (
                        <span className="text-slate-400 text-xs italic">Sesuai Rasio</span>
                    ),
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

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <div className="sm:col-span-1">
                                <FormInput<UnitConversionFormValues>
                                    name="unit_name"
                                    label="Nama Satuan"
                                    placeholder="Contoh: Strip / Box"
                                    required
                                />
                            </div>

                            <div className="sm:col-span-1">
                                <FormNumberInput<UnitConversionFormValues>
                                    name="multiplier"
                                    label={`Isi per ${baseUnit}`}
                                    placeholder="Contoh: 10"
                                    min={0.001}
                                    allowDecimal={true}
                                />
                            </div>

                            <div className="sm:col-span-1">
                                <FormNominalInput<UnitConversionFormValues>
                                    name="selling_price"
                                    label="Harga Jual (Opsional)"
                                    placeholder="Rp 0"
                                />
                            </div>
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

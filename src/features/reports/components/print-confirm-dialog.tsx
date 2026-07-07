"use client";

import React, { useEffect } from "react";
import { FormProvider, useForm, type FieldValues, type DefaultValues, type Path } from "react-hook-form";
import { BaseDialog } from "@/components/ui/base-dialog";
import { FormSelect } from "@/components/forms/form-select";
import { Button } from "@/components/ui/button";
import { IconPrinter } from "@tabler/icons-react";

export interface BasePrintFilterValues {
    paperSize: string;
    orientation: string;
}

interface PrintConfirmDialogProps<TFieldValues extends FieldValues & BasePrintFilterValues = BasePrintFilterValues> {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (data: TFieldValues) => void;
    defaultValues: DefaultValues<TFieldValues>;
    children?: React.ReactNode;
}

export function PrintConfirmDialog<TFieldValues extends FieldValues & BasePrintFilterValues = BasePrintFilterValues>({
    open,
    onOpenChange,
    onConfirm,
    defaultValues,
    children,
}: PrintConfirmDialogProps<TFieldValues>) {
    const methods = useForm<TFieldValues>({
        defaultValues,
    });

    useEffect(() => {
        if (open) {
            methods.reset(defaultValues);
        }
    }, [open, defaultValues, methods]);

    const handleConfirm = (data: TFieldValues) => {
        onConfirm(data);
        onOpenChange(false);
    };

    const paperOptions = [
        { value: "A4", label: "A4" },
        { value: "F4", label: "F4" },
        { value: "Letter", label: "Letter" },
        { value: "A3", label: "A3" },
    ];

    const orientationOptions = [
        { value: "portrait", label: "Tegak (Portrait)" },
        { value: "landscape", label: "Mendatar (Landscape)" },
    ];

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div className="flex items-center gap-2">
                    <IconPrinter className="text-emerald-600" size={18} />
                    <span>Konfigurasi Cetak PDF</span>
                </div>
            }
            className="max-w-md sm:max-w-md"
        >
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(handleConfirm)} className="space-y-4 text-slate-800">
                    <p className="text-xs text-slate-400">
                        Silakan tentukan konfigurasi halaman dan filter laporan untuk pencetakan.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect<TFieldValues>
                            name={"paperSize" as Path<TFieldValues>}
                            label="Ukuran Kertas"
                            options={paperOptions}
                            placeholder="Pilih Ukuran"
                        />

                        <FormSelect<TFieldValues>
                            name={"orientation" as Path<TFieldValues>}
                            label="Orientasi Halaman"
                            options={orientationOptions}
                            placeholder="Pilih Orientasi"
                        />
                    </div>

                    {children && (
                        <div className="border-t border-slate-100 pt-4 space-y-4">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Filter Laporan
                            </h4>
                            {children}
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="h-10 border-slate-200 text-slate-600 rounded-xl text-xs font-bold px-4"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold px-4 border-none cursor-pointer"
                        >
                            Cetak Laporan
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </BaseDialog>
    );
}

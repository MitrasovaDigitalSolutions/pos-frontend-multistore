"use client";

import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { BaseDialog } from "@/components/ui/base-dialog";
import { FormSelect } from "@/components/forms/form-select";
import { Button } from "@/components/ui/button";
import { IconPrinter } from "@tabler/icons-react";

interface PrintConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (paperSize: string, orientation: string) => void;
}

interface PrintFilterValues {
    paperSize: string;
    orientation: string;
}

export function PrintConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
}: PrintConfirmDialogProps) {
    const methods = useForm<PrintFilterValues>({
        defaultValues: {
            paperSize: "A4",
            orientation: "portrait",
        },
    });

    const handleConfirm = (data: PrintFilterValues) => {
        onConfirm(data.paperSize, data.orientation);
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
                <form onSubmit={methods.handleSubmit(handleConfirm)} className="space-y-4 py-3 text-slate-800">
                    <p className="text-xs text-slate-400">
                        Silakan tentukan ukuran kertas dan orientasi halaman untuk pencetakan laporan ini.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect<PrintFilterValues>
                            name="paperSize"
                            label="Ukuran Kertas"
                            options={paperOptions}
                            placeholder="Pilih Ukuran"
                        />

                        <FormSelect<PrintFilterValues>
                            name="orientation"
                            label="Orientasi Halaman"
                            options={orientationOptions}
                            placeholder="Pilih Orientasi"
                        />
                    </div>

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

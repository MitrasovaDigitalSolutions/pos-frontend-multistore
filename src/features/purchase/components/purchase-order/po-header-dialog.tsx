"use client";

import { useEffect } from "react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { IconClipboard } from "@tabler/icons-react";

import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/forms/form-select";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import { Input } from "@/components/ui/input";

import { useSupplierSelectConfig } from "@/features/master/suppliers/hooks/use-supplier-select";
import type { Supplier } from "@/features/master/suppliers/types";
import { useUpdatePurchaseOrder } from "@/features/purchase/api/purchase-api";
import { purchaseOrderHeaderSchema, type PurchaseOrderHeaderInput } from "@/features/purchase/schemas/order-schema";
import type { PurchaseOrder } from "@/features/purchase/types";
import { formatToISO } from "@/lib/date-utils";

interface POHeaderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    order?: PurchaseOrder;
}

export function POHeaderDialog({ open, onOpenChange, order }: POHeaderDialogProps) {
    const updateHeader = useUpdatePurchaseOrder();
    const supplierSelectConfig = useSupplierSelectConfig({
        targetUid: order?.supplier_uid,
        targetSupplier: order?.supplier,
    });

    const methods = useForm<PurchaseOrderHeaderInput>({
        resolver: zodResolver(purchaseOrderHeaderSchema) as Resolver<PurchaseOrderHeaderInput>,
        defaultValues: {
            supplier_uid: undefined,
            tanggal_po: "",
            catatan: "",
        },
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = methods;

    // Reset default values when order details are loaded or dialog opens
    useEffect(() => {
        if (open && order) {
            reset({
                supplier_uid: order.supplier_uid ? String(order.supplier_uid) : (undefined as unknown as string),
                tanggal_po: order.tanggal_po ? formatToISO(order.tanggal_po) : "",
                catatan: order.catatan || "",
            });
        }
    }, [open, order, reset]);

    const onSubmit = (data: PurchaseOrderHeaderInput) => {
        if (!order) return;

        updateHeader.mutate(
            {
                uid: order.uid,
                data: {
                    supplier_uid: data.supplier_uid,
                    tanggal_po: data.tanggal_po,
                    catatan: data.catatan || null,
                },
            },
            {
                onSuccess: () => {
                    toast.success("Informasi PO berhasil diperbarui.");
                    onOpenChange(false);
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal memperbarui informasi PO.");
                },
            }
        );
    };

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <>
                    <IconClipboard size={20} className="text-emerald-500" />
                    <span>Edit Informasi Purchase Order</span>
                </>
            }
            className="max-w-md flex flex-col max-h-[90vh]"
        >
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    {/* Supplier Dropdown */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Supplier *
                        </label>
                        <FormSelect<PurchaseOrderHeaderInput, Supplier>
                            name="supplier_uid"
                            {...supplierSelectConfig}
                            placeholder="-- Pilih Supplier --"
                            disabled={updateHeader.isPending}
                        />
                        {errors.supplier_uid && (
                            <p className="text-[10px] text-rose-500 font-medium">
                                {errors.supplier_uid.message}
                            </p>
                        )}
                    </div>

                    {/* Tanggal PO */}
                    <FormDatePicker<PurchaseOrderHeaderInput>
                        name="tanggal_po"
                        label="Tanggal PO *"
                        disabled={updateHeader.isPending}
                    />

                    {/* Catatan */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Catatan / Keterangan
                        </label>
                        <Input
                            type="text"
                            placeholder="Keterangan tambahan..."
                            className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                            disabled={updateHeader.isPending}
                            {...register("catatan")}
                        />
                        {errors.catatan && (
                            <p className="text-[10px] text-rose-500 font-medium">
                                {errors.catatan.message}
                            </p>
                        )}
                    </div>

                    {/* Dialog Actions */}
                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={updateHeader.isPending}
                            className="text-xs text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={updateHeader.isPending}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                        >
                            {updateHeader.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </BaseDialog>
    );
}

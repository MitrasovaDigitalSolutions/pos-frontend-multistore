"use client";

import { useEffect } from "react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { BaseDialog } from "@/components/ui/base-dialog";
import { FormSelect } from "@/components/forms/form-select";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconClipboardPlus } from "@tabler/icons-react";
import { useAllSuppliers } from "@/features/suppliers/api/suppliers-api";
import { useUpdatePurchaseOrder } from "../../api/purchase-api";
import { purchaseOrderHeaderSchema, type PurchaseOrderHeaderInput } from "../../schemas/order-schema";
import type { PurchaseOrder } from "../../types";
import { formatToISO } from "@/lib/date-utils";

interface POHeaderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    order: PurchaseOrder;
}

export function POHeaderDialog({ open, onOpenChange, order }: POHeaderDialogProps) {
    const updateHeader = useUpdatePurchaseOrder();
    const { data: suppliers = [], isLoading: suppliersLoading } = useAllSuppliers();

    const supplierOptions = suppliers.map((s) => ({
        value: s.uid,
        label: s.nama,
    }));

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
                supplier_uid: order.supplier_uid || undefined,
                tanggal_po: order.tanggal_po ? formatToISO(order.tanggal_po) : "",
                catatan: order.catatan || "",
            });
        }
    }, [open, order, reset]);

    const onSubmit = (data: PurchaseOrderHeaderInput) => {
        updateHeader.mutate(
            { uid: order.uid, data },
            {
                onSuccess: () => {
                    toast.success("Informasi header Purchase Order berhasil diperbarui!");
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
                    <IconClipboardPlus size={20} className="text-emerald-500" />
                    <span>Edit Informasi Purchase Order</span>
                </>
            }
            className="max-w-md flex flex-col"
        >
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    {/* Supplier Dropdown */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Supplier *
                        </label>
                        <FormSelect<PurchaseOrderHeaderInput>
                            name="supplier_uid"
                            options={supplierOptions}
                            placeholder={
                                suppliersLoading
                                    ? "Memuat supplier..."
                                    : "-- Pilih Supplier --"
                            }
                            disabled={updateHeader.isPending || suppliersLoading}
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

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            variant="outline"
                            className="px-5 h-10 border-slate-200 text-slate-700 font-bold text-xs rounded-xl bg-white"
                            disabled={updateHeader.isPending}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            className="px-5 h-10 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white rounded-xl"
                            disabled={updateHeader.isPending}
                        >
                            {updateHeader.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </BaseDialog>
    );
}

"use client";

import { useEffect } from "react";
import { FormProvider, useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { BaseDialog } from "@/components/ui/base-dialog";
import { FormSelect } from "@/components/forms/form-select";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconClipboardPlus } from "@tabler/icons-react";
import { useAllSuppliers } from "@/features/suppliers/api/suppliers-api";
import { useUpdatePurchaseReturn, useReceivings } from "../../api/purchase-api";
import { purchaseReturnHeaderSchema, type PurchaseReturnHeaderInput } from "../../schemas/return-schema";
import type { PurchaseReturn } from "../../types";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { RECEIVING_STATUS } from "@/constants/purchase";
import { formatToISO } from "@/lib/date-utils";

interface ReturnHeaderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    returnObj: PurchaseReturn;
}

export function ReturnHeaderDialog({ open, onOpenChange, returnObj }: ReturnHeaderDialogProps) {
    const updateReturn = useUpdatePurchaseReturn();
    const { data: suppliers = [], isLoading: suppliersLoading } = useAllSuppliers();
    const { data: receivingsData, isLoading: receivingsLoading } = useReceivings({
        status: RECEIVING_STATUS.COMPLETED,
        per_page: 100,
    });

    const supplierOptions = suppliers.map((s) => ({
        value: String(s.uid),
        label: s.nama,
    }));

    const receivingOptions = (receivingsData?.data || []).map((r) => ({
        value: String(r.uid),
        label: `${r.nomor_penerimaan} - ${r.supplier_relationship?.nama || r.supplier || "Supplier"}`,
        description: `Faktur: ${r.nomor_faktur || "-"} • Total: ${formatRupiah(r.nilai_faktur || 0)}`,
    }));

    // In edit mode, if currently linked receiving is not in the list (e.g. because it's not in the first 100 or has another state), make sure it is added.
    if (returnObj.stock_receiving_uid) {
        const hasCurrentReceiving = (receivingsData?.data || []).some(r => r.uid === returnObj.stock_receiving_uid);
        if (!hasCurrentReceiving) {
            receivingOptions.push({
                value: String(returnObj.stock_receiving_uid),
                label: `${returnObj.stock_receiving?.nomor_penerimaan || `Penerimaan ID: ${returnObj.stock_receiving_uid}`}`,
                description: `Terkait`,
            });
        }
    }

    const methods = useForm<PurchaseReturnHeaderInput>({
        resolver: zodResolver(purchaseReturnHeaderSchema) as Resolver<PurchaseReturnHeaderInput>,
        defaultValues: {
            receiving_uid: undefined,
            supplier_uid: undefined,
            tanggal_retur: "",
            catatan: "",
        },
    });

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = methods;

    const receivingId = useWatch({ name: "receiving_uid", control: methods.control });

    // Reset default values when returnObj is loaded or dialog opens
    useEffect(() => {
        if (open && returnObj) {
            reset({
                receiving_uid: returnObj.stock_receiving_uid || undefined,
                supplier_uid: returnObj.supplier_uid ? String(returnObj.supplier_uid) : undefined,
                tanggal_retur: returnObj.tanggal_retur ? formatToISO(returnObj.tanggal_retur) : "",
                catatan: returnObj.catatan || "",
            });
        }
    }, [open, returnObj, reset]);

    // Auto-select and lock supplier based on selected receiving
    useEffect(() => {
        if (receivingId) {
            const selectedReceiving = (receivingsData?.data || []).find(
                (r) => r.uid === receivingId
            );
            if (selectedReceiving && selectedReceiving.supplier_uid) {
                setValue("supplier_uid", String(selectedReceiving.supplier_uid));
            } else if (returnObj && returnObj.stock_receiving_uid === receivingId) {
                setValue("supplier_uid", String(returnObj.supplier_uid));
            }
        }
    }, [receivingId, receivingsData, setValue, returnObj]);

    const onSubmit = (data: PurchaseReturnHeaderInput) => {
        // Prepare payload including existing items to prevent deletion.
        const itemsPayload = (returnObj.items || []).map((item) => ({
            product_uid: item.product_uid,
            kuantitas: item.kuantitas,
            harga_beli: item.harga_beli,
            alasan: item.alasan || "damaged",
        }));

        const payload = {
            receiving_uid: data.receiving_uid,
            supplier_uid: data.supplier_uid,
            tanggal_retur: data.tanggal_retur,
            catatan: data.catatan,
            status: returnObj.status, // Preserve draft status
            items: itemsPayload,
        };

        updateReturn.mutate(
            { uid: returnObj.uid, data: payload },
            {
                onSuccess: () => {
                    toast.success("Informasi header Retur Pembelian berhasil diperbarui!");
                    onOpenChange(false);
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal memperbarui informasi header retur.");
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
                    <span>Edit Informasi Retur Pembelian</span>
                </>
            }
            className="max-w-md flex flex-col max-h-[90vh]"
        >
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    {/* Referensi Faktur Penerimaan */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Referensi Faktur Penerimaan *
                        </label>
                        <FormSelect<PurchaseReturnHeaderInput>
                            name="receiving_uid"
                            options={receivingOptions}
                            placeholder={
                                receivingsLoading ? "Memuat daftar penerimaan..." : "-- Pilih Faktur Penerimaan (Completed) --"
                            }
                            disabled={updateReturn.isPending || receivingsLoading}
                        />
                        {errors.receiving_uid && (
                            <p className="text-[10px] text-rose-500 font-medium">
                                {errors.receiving_uid.message}
                            </p>
                        )}
                    </div>

                    {/* Supplier Selector */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Supplier *
                        </label>
                        <FormSelect<PurchaseReturnHeaderInput>
                            name="supplier_uid"
                            options={supplierOptions}
                            placeholder={
                                suppliersLoading ? "Memuat supplier..." : "-- Pilih Supplier --"
                            }
                            disabled={updateReturn.isPending || suppliersLoading || !!receivingId}
                        />
                        {errors.supplier_uid && (
                            <p className="text-[10px] text-rose-500 font-medium">
                                {errors.supplier_uid.message}
                            </p>
                        )}
                    </div>

                    {/* Tanggal Retur */}
                    <FormDatePicker<PurchaseReturnHeaderInput>
                        name="tanggal_retur"
                        label="Tanggal Retur *"
                        disabled={updateReturn.isPending}
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
                            disabled={updateReturn.isPending}
                            {...register("catatan")}
                        />
                        {errors.catatan && (
                            <p className="text-[10px] text-rose-500 font-medium">
                                {errors.catatan.message}
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 shrink-0 bg-white">
                        <Button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            variant="outline"
                            className="px-5 h-10 border-slate-200 text-slate-700 font-bold text-xs rounded-xl bg-white"
                            disabled={updateReturn.isPending}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            className="px-5 h-10 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white rounded-xl"
                            disabled={updateReturn.isPending}
                        >
                            {updateReturn.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </BaseDialog>
    );
}

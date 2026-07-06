"use client";

import { FormDatePicker } from "@/components/forms/form-date-picker";
import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { FormSelect } from "@/components/forms/form-select";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scrollable } from "@/components/ui/scrollable";
import {
    PAYMENT_STATUS
} from "@/constants/purchase";
import { useAllSuppliers } from "@/features/suppliers/api/suppliers-api";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconClipboardPlus } from "@tabler/icons-react";
import { useEffect } from "react";
import { FormProvider, useForm, useWatch, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { useOutstandingPurchaseOrders, useUpdateReceiving } from "../../api/purchase-api";
import { receivingHeaderSchema, type ReceivingHeaderInput } from "../../schemas/receiving-schema";
import type { Receiving } from "../../types";
import { formatToISO } from "@/lib/date-utils";

interface ReceivingHeaderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    receiving: Receiving;
}

export function ReceivingHeaderDialog({ open, onOpenChange, receiving }: ReceivingHeaderDialogProps) {
    const updateReceiving = useUpdateReceiving();
    const { data: suppliers = [], isLoading: suppliersLoading } = useAllSuppliers();
    const { data: outstandingPosData, isLoading: posLoading } = useOutstandingPurchaseOrders({
        per_page: 100,
    });

    const supplierOptions = suppliers.map((s) => ({
        value: String(s.uid),
        label: s.nama,
    }));

    // In edit mode, we want to allow selecting the currently linked PO as well.
    // If the receiving already has a purchase_order_uid, let's make sure it is in options.
    const poOptions = [
        { value: "", label: "-- Tanpa PO (Pembelian Langsung) --" },
        ...(outstandingPosData?.data || []).map((po) => ({
            value: String(po.uid),
            label: `${po.nomor_po} - ${po.supplier?.nama || po.supplier_name || "Tanpa Supplier"}`,
            description: `Estimasi: ${formatRupiah(po.nilai_estimasi || 0)}`,
        })),
    ];

    // Ensure currently selected PO is added if it isn't already in list
    if (receiving.purchase_order_uid) {
        const hasCurrentPo = (outstandingPosData?.data || []).some(po => po.uid === receiving.purchase_order_uid);
        if (!hasCurrentPo) {
            poOptions.push({
                value: String(receiving.purchase_order_uid),
                label: `PO ID: ${receiving.purchase_order_uid} (Terkait)`,
            });
        }
    }

    const methods = useForm<ReceivingHeaderInput>({
        resolver: zodResolver(receivingHeaderSchema) as Resolver<ReceivingHeaderInput>,
        defaultValues: {
            purchase_order_uid: null,
            supplier_uid: null,
            nomor_faktur: "",
            nilai_faktur: 0,
            tanggal_terima: "",
            status_pembayaran: PAYMENT_STATUS.PENDING,
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

    const purchaseOrderId = useWatch({ name: "purchase_order_uid", control: methods.control });

    // Reset default values when receiving is loaded or dialog opens
    useEffect(() => {
        if (open && receiving) {
            reset({
                purchase_order_uid: receiving.purchase_order_uid || null,
                supplier_uid: receiving.supplier_uid ? String(receiving.supplier_uid) : null,
                nomor_faktur: receiving.nomor_faktur || "",
                nilai_faktur: receiving.nilai_faktur || 0,
                tanggal_terima: receiving.created_at ? formatToISO(receiving.created_at) : "",
                status_pembayaran: receiving.status_pembayaran || PAYMENT_STATUS.PENDING,
                catatan: receiving.catatan || "",
            });
        }
    }, [open, receiving, reset]);

    // Auto-select and lock supplier if PO is chosen
    useEffect(() => {
        if (purchaseOrderId) {
            const selectedPo = (outstandingPosData?.data || []).find(
                (po) => po.uid === purchaseOrderId
            );
            if (selectedPo && selectedPo.supplier_uid) {
                setValue("supplier_uid", String(selectedPo.supplier_uid));
            } else if (receiving && receiving.purchase_order_uid === purchaseOrderId) {
                setValue("supplier_uid", receiving.supplier_uid ? String(receiving.supplier_uid) : null);
            }
        }
    }, [purchaseOrderId, outstandingPosData, setValue, receiving]);

    const onSubmit = (data: ReceivingHeaderInput) => {
        // Send the update. We must also include existing items to avoid deletion.
        const itemsPayload = (receiving.items || []).map((item) => ({
            product_uid: item.product_uid,
            kuantitas: item.kuantitas,
            harga_beli: item.harga_beli,
        }));

        const payload = {
            purchase_order_uid: data.purchase_order_uid || null,
            supplier_uid: data.supplier_uid,
            nomor_faktur: data.nomor_faktur,
            nilai_faktur: Number(data.nilai_faktur),
            tanggal_terima: data.tanggal_terima,
            status_pembayaran: data.status_pembayaran,
            catatan: data.catatan,
            status: receiving.status, // Preserve draft status
            items: itemsPayload,
        };

        updateReceiving.mutate(
            { uid: receiving.uid, data: payload },
            {
                onSuccess: () => {
                    toast.success("Informasi header Penerimaan Barang berhasil diperbarui!");
                    onOpenChange(false);
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal memperbarui informasi header penerimaan.");
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
                    <span>Edit Informasi Penerimaan Barang</span>
                </>
            }
            className="sm:max-w-2xl flex flex-col max-h-[90vh]"
        >
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden min-h-0 pt-4">
                    <Scrollable className="flex-1 pr-1 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Referensi PO */}
                            <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    Referensi Purchase Order (PO)
                                </label>
                                <FormSelect<ReceivingHeaderInput>
                                    name="purchase_order_uid"
                                    options={poOptions}
                                    placeholder={
                                        posLoading ? "Memuat daftar PO..." : "-- Pilih PO (Kosongkan jika beli langsung) --"
                                    }
                                    disabled={updateReceiving.isPending || posLoading}
                                />
                                {errors.purchase_order_uid && (
                                    <p className="text-[10px] text-rose-500 font-medium">
                                        {errors.purchase_order_uid.message}
                                    </p>
                                )}
                            </div>

                            {/* Supplier Dropdown */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    Supplier {!purchaseOrderId && " *"}
                                </label>
                                <FormSelect<ReceivingHeaderInput>
                                    name="supplier_uid"
                                    options={supplierOptions}
                                    placeholder={
                                        suppliersLoading ? "Memuat supplier..." : "-- Pilih Supplier --"
                                    }
                                    disabled={updateReceiving.isPending || suppliersLoading || !!purchaseOrderId}
                                />
                                {errors.supplier_uid && (
                                    <p className="text-[10px] text-rose-500 font-medium">
                                        {errors.supplier_uid.message}
                                    </p>
                                )}
                            </div>

                            {/* Tanggal Terima */}
                            <FormDatePicker<ReceivingHeaderInput>
                                name="tanggal_terima"
                                label="Tanggal Penerimaan *"
                                disabled={updateReceiving.isPending}
                            />

                            {/* No. Faktur */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    No. Faktur *
                                </label>
                                <Input
                                    type="text"
                                    placeholder="FAK-XXXX..."
                                    className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                                    disabled={updateReceiving.isPending}
                                    {...register("nomor_faktur")}
                                />
                                {errors.nomor_faktur && (
                                    <p className="text-[10px] text-rose-500 font-medium">
                                        {errors.nomor_faktur.message}
                                    </p>
                                )}
                            </div>

                            {/* Nilai Faktur */}
                            <div>
                                <FormNominalInput<ReceivingHeaderInput>
                                    name="nilai_faktur"
                                    label="Nilai Total Faktur / Invoice *"
                                    placeholder="Total tagihan Rp..."
                                    disabled={updateReceiving.isPending}
                                />
                            </div>

                            {/* Status Pembayaran */}
                            {/* <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    Status Pembayaran
                                </label>
                                <FormSelect<ReceivingHeaderInput>
                                    name="status_pembayaran"
                                    options={[
                                        { value: PAYMENT_STATUS.PENDING, label: PAYMENT_STATUS_LABELS[PAYMENT_STATUS.PENDING] },
                                        { value: PAYMENT_STATUS.UNPAID, label: PAYMENT_STATUS_LABELS[PAYMENT_STATUS.UNPAID] },
                                        { value: PAYMENT_STATUS.PARTIAL, label: PAYMENT_STATUS_LABELS[PAYMENT_STATUS.PARTIAL] },
                                        { value: PAYMENT_STATUS.PAID, label: PAYMENT_STATUS_LABELS[PAYMENT_STATUS.PAID] },
                                    ]}
                                    placeholder="Pilih status"
                                    disabled={updateReceiving.isPending}
                                />
                                {errors.status_pembayaran && (
                                    <p className="text-[10px] text-rose-500 font-medium">
                                        {errors.status_pembayaran.message}
                                    </p>
                                )}
                            </div> */}
                        </div>

                        {/* Catatan */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Catatan
                            </label>
                            <Input
                                type="text"
                                placeholder="Keterangan tambahan..."
                                className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                                disabled={updateReceiving.isPending}
                                {...register("catatan")}
                            />
                            {errors.catatan && (
                                <p className="text-[10px] text-rose-500 font-medium">
                                    {errors.catatan.message}
                                </p>
                            )}
                        </div>
                    </Scrollable>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 shrink-0 bg-white">
                        <Button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            variant="outline"
                            className="px-5 h-10 border-slate-200 text-slate-700 font-bold text-xs rounded-xl bg-white"
                            disabled={updateReceiving.isPending}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            className="px-5 h-10 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white rounded-xl"
                            disabled={updateReceiving.isPending}
                        >
                            {updateReceiving.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </BaseDialog>
    );
}

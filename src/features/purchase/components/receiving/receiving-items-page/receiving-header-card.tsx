"use client";

import { FormDatePicker } from "@/components/forms/form-date-picker";
import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { FormSelect } from "@/components/forms/form-select";
import { Input } from "@/components/ui/input";
import { useAllSuppliers } from "@/features/suppliers/api/suppliers-api";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconClipboardPlus, IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { useEffect, useState, useRef } from "react";
import { FormProvider, useForm, useWatch, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { useOutstandingPurchaseOrders, useCreateReceivingHeader, useUpdateReceiving, useBulkReplaceReceivingItems } from "../../../api/purchase-api";
import { receivingHeaderSchema, type ReceivingHeaderInput } from "../../../schemas/receiving-schema";
import type { Receiving, PurchaseItemLocal } from "../../../types";
import { formatToISO, todayStr } from "@/lib/date-utils";
import { PAYMENT_STATUS } from "@/constants/purchase";
import { clearPurchaseItemsStore, getPurchaseItemsStore } from "@/stores/purchase-items-store";

interface ReceivingHeaderCardProps {
    receiving?: Receiving;
    receivingId?: string; // "new" or uuid
    localItems?: PurchaseItemLocal[];
    onSaveSuccess?: (uid: string, receiving?: Receiving) => void;
    onHeaderValidated?: (data: ReceivingHeaderInput) => void;
    saveMode?: "save" | "process";
}

export function ReceivingHeaderCard({
    receiving,
    receivingId,
    localItems = [],
    onSaveSuccess,
    onHeaderValidated,
    saveMode = "process",
}: ReceivingHeaderCardProps) {
    const isNew = !receivingId || receivingId === "new";
    const createHeader = useCreateReceivingHeader();
    const updateReceiving = useUpdateReceiving();
    const bulkReplace = useBulkReplaceReceivingItems();

    const [isExpanded, setIsExpanded] = useState(false);

    const store = getPurchaseItemsStore(receivingId || "new", "receiving");
    const headerData = store((state) => state.headerData);
    const setHeaderData = store((state) => state.setHeaderData);

    const { data: suppliers = [], isLoading: suppliersLoading } = useAllSuppliers();
    const { data: outstandingPosData, isLoading: posLoading } = useOutstandingPurchaseOrders({
        per_page: 100,
    });

    const supplierOptions = suppliers.map((s) => ({
        value: String(s.uid),
        label: s.nama,
    }));

    const poOptions = [
        { value: "", label: "-- Tanpa PO (Pembelian Langsung) --" },
        ...(outstandingPosData?.data || []).map((po) => ({
            value: String(po.uid),
            label: `${po.nomor_po} - ${po.supplier?.nama || po.supplier_name || "Tanpa Supplier"}`,
            description: `Estimasi: ${formatRupiah(po.nilai_estimasi || 0)}`,
        })),
    ];

    // Ensure currently selected PO is in options if editing
    if (receiving?.purchase_order_uid) {
        const hasCurrentPo = (outstandingPosData?.data || []).some(
            (po) => po.uid === receiving.purchase_order_uid
        );
        if (!hasCurrentPo) {
            poOptions.push({
                value: String(receiving.purchase_order_uid),
                label: `PO Terkait (ID: ${receiving.purchase_order_uid.substring(0, 8)})`,
                description: "",
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
            tanggal_terima: todayStr(),
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

    const watchedValues = useWatch({ control: methods.control });

    const hasInitializedRef = useRef(false);
    // Prevents re-writing stale form values back to the store after clearAll() is called
    const isClearedRef = useRef(false);

    // Detect when headerData is cleared externally (after we've initialized once)
    // and block further auto-saves so the cleared state is not overwritten
    useEffect(() => {
        if (isNew && headerData === null && hasInitializedRef.current) {
            isClearedRef.current = true;
        }
    }, [isNew, headerData]);

    // Save to Zustand store on any change to form values (only when document is new/unsaved and not yet cleared)
    useEffect(() => {
        if (isNew && !isClearedRef.current) {
            setHeaderData(watchedValues);
        }
    }, [watchedValues, isNew, setHeaderData]);

    // Load initial defaults from Zustand store (if they exist) when creating a new receiving
    useEffect(() => {
        if (isNew && headerData && !hasInitializedRef.current) {
            hasInitializedRef.current = true;
            reset({
                purchase_order_uid: headerData.purchase_order_uid || null,
                supplier_uid: headerData.supplier_uid || null,
                nomor_faktur: headerData.nomor_faktur || "",
                nilai_faktur: headerData.nilai_faktur || 0,
                tanggal_terima: headerData.tanggal_terima || todayStr(),
                status_pembayaran: headerData.status_pembayaran || PAYMENT_STATUS.PENDING,
                catatan: headerData.catatan || "",
            });
        }
    }, [isNew, headerData, reset]);

    // Synchronize default values when receiving loads/changes
    useEffect(() => {
        if (!isNew && receiving) {
            reset({
                purchase_order_uid: receiving.purchase_order_uid || null,
                supplier_uid: receiving.supplier_uid ? String(receiving.supplier_uid) : null,
                nomor_faktur: receiving.nomor_faktur || "",
                nilai_faktur: receiving.nilai_faktur || 0,
                tanggal_terima: receiving.created_at ? formatToISO(receiving.created_at) : todayStr(),
                status_pembayaran: receiving.status_pembayaran || PAYMENT_STATUS.PENDING,
                catatan: receiving.catatan || "",
            });
        }
    }, [isNew, receiving, reset]);

    // Auto-select and lock supplier if PO is chosen
    useEffect(() => {
        if (purchaseOrderId) {
            const selectedPo = (outstandingPosData?.data || []).find(
                (po) => String(po.uid) === purchaseOrderId
            );
            if (selectedPo && selectedPo.supplier_uid) {
                setValue("supplier_uid", String(selectedPo.supplier_uid));
            } else if (receiving && String(receiving.purchase_order_uid) === purchaseOrderId) {
                setValue("supplier_uid", receiving.supplier_uid ? String(receiving.supplier_uid) : null);
            }
        }
    }, [purchaseOrderId, outstandingPosData, setValue, receiving]);

    const isPending = createHeader.isPending || updateReceiving.isPending || bulkReplace.isPending;

    const onSubmit = (data: ReceivingHeaderInput) => {
        const payload = {
            ...data,
            purchase_order_uid: data.purchase_order_uid || null,
            supplier_uid: data.supplier_uid || null,
        };

        if (isNew) {
            if (saveMode === "process" && onHeaderValidated) {
                onHeaderValidated(data);
                return;
            }

            createHeader.mutate(payload, {
                onSuccess: async (response) => {
                    const newUid = response.data.uid;

                    if (localItems.length > 0) {
                        const itemsPayload = localItems.map((item) => ({
                            product_uid: item.product_uid,
                            kuantitas: item.kuantitas,
                            harga_beli: item.harga_estimasi,
                        }));

                        try {
                            const replaceRes = await bulkReplace.mutateAsync({
                                uid: newUid,
                                data: {
                                    purchase_order_uid: response.data.purchase_order_uid || null,
                                    supplier_uid: response.data.supplier_uid || "",
                                    nomor_faktur: response.data.nomor_faktur || null,
                                    nilai_faktur: response.data.nilai_faktur ? Number(response.data.nilai_faktur) : 0,
                                    tanggal_terima: response.data.tanggal_terima || todayStr(),
                                    status_pembayaran: response.data.status_pembayaran || PAYMENT_STATUS.PENDING,
                                    catatan: response.data.catatan || null,
                                    items: itemsPayload,
                                },
                            });
                            toast.success("Header & daftar barang penerimaan berhasil disimpan!");
                            // Clear local items for key "new"
                            clearPurchaseItemsStore("new", "receiving");
                            if (onSaveSuccess) {
                                onSaveSuccess(newUid, replaceRes.data);
                            }
                            return;
                        } catch {
                            toast.error("Header berhasil disimpan, namun gagal menyimpan daftar barang.");
                        }
                    } else {
                        toast.success("Header Penerimaan Barang berhasil disimpan!");
                    }

                    // Clear local items for key "new"
                    clearPurchaseItemsStore("new", "receiving");
                    if (onSaveSuccess) {
                        onSaveSuccess(newUid, response.data);
                    }
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal menyimpan header penerimaan.");
                },
            });
        } else if (receiving) {
            // Map either local (unsaved) items or existing DB items to protect changes
            const itemsPayload = localItems.length > 0
                ? localItems.map((item) => ({
                    product_uid: item.product_uid,
                    kuantitas: item.kuantitas,
                    harga_beli: item.harga_estimasi,
                }))
                : (receiving.items || []).map((item) => ({
                    product_uid: item.product_uid,
                    kuantitas: item.kuantitas,
                    harga_beli: item.harga_beli,
                }));

            const updatePayload = {
                purchase_order_uid: data.purchase_order_uid || null,
                supplier_uid: data.supplier_uid,
                nomor_faktur: data.nomor_faktur || null,
                nilai_faktur: Number(data.nilai_faktur),
                tanggal_terima: data.tanggal_terima,
                status_pembayaran: data.status_pembayaran,
                catatan: data.catatan,
                status: receiving.status,
                items: itemsPayload,
            };

            updateReceiving.mutate(
                { uid: receiving.uid, data: updatePayload },
                {
                    onSuccess: (response) => {
                        if (onSaveSuccess) {
                            onSaveSuccess(receiving.uid, response.data);
                        }
                    },
                    onError: (err) => {
                        toast.error(err.message || "Gagal memperbarui header penerimaan.");
                    },
                }
            );
        }
    };

    return (
        <FormProvider {...methods}>
            <form
                id="receiving-header-form"
                onSubmit={handleSubmit(onSubmit)}
                className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4"
            >
                <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
                    <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg border border-emerald-100/30">
                        <IconClipboardPlus size={18} />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-slate-900">
                            {isNew ? "Informasi Header" : "Edit Informasi Header"}
                        </h4>
                        <p className="text-[10px] text-slate-400">
                            {isNew ? "Lengkapi info supplier & faktur" : "Data tersimpan & dapat diubah"}
                        </p>
                    </div>
                </div>

                <div className="space-y-3.5">
                    {/* Supplier */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Supplier {!purchaseOrderId && " *"}
                        </label>
                        <FormSelect<ReceivingHeaderInput>
                            name="supplier_uid"
                            options={supplierOptions}
                            placeholder={suppliersLoading ? "Memuat supplier..." : "-- Pilih Supplier --"}
                            disabled={isPending || suppliersLoading || !!purchaseOrderId}
                        />
                    </div>

                    {/* Tanggal Penerimaan */}
                    <FormDatePicker<ReceivingHeaderInput>
                        name="tanggal_terima"
                        label="Tanggal Penerimaan *"
                        disabled={isPending}
                    />

                    {/* Collapsible toggle button */}
                    <div className="pt-1">
                        <button
                            type="button"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors duration-150 cursor-pointer border-none bg-transparent"
                        >
                            {isExpanded ? (
                                <>
                                    <IconChevronUp size={14} className="text-slate-400" /> Sembunyikan Detail Tambahan
                                </>
                            ) : (
                                <>
                                    <IconChevronDown size={14} className="text-slate-400" /> Tampilkan Detail Tambahan (PO, Faktur, Catatan)
                                </>
                            )}
                        </button>
                    </div>

                    {/* Collapsible content */}
                    {isExpanded && (
                        <div className="space-y-3.5 pt-2 border-t border-slate-50">
                            {/* Purchase Order */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    Referensi Purchase Order (PO)
                                </label>
                                <FormSelect<ReceivingHeaderInput>
                                    name="purchase_order_uid"
                                    options={poOptions}
                                    placeholder={posLoading ? "Memuat daftar PO..." : "-- Pembelian Langsung --"}
                                    disabled={isPending || posLoading}
                                />
                                {errors.purchase_order_uid && (
                                    <p className="text-[9px] text-rose-500 font-medium">
                                        {errors.purchase_order_uid.message}
                                    </p>
                                )}
                            </div>

                            {/* No. Faktur */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    No. Faktur (Opsional)
                                </label>
                                <Input
                                    type="text"
                                    placeholder="FAK-XXXX..."
                                    className="h-9 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                                    disabled={isPending}
                                    {...register("nomor_faktur")}
                                />
                                {errors.nomor_faktur && (
                                    <p className="text-[9px] text-rose-500 font-medium">
                                        {errors.nomor_faktur.message}
                                    </p>
                                )}
                            </div>

                            {/* Nilai Faktur */}
                            <div>
                                <FormNominalInput<ReceivingHeaderInput>
                                    name="nilai_faktur"
                                    label="Nilai Total Faktur *"
                                    placeholder="Total tagihan Rp..."
                                    disabled={isPending}
                                />
                            </div>

                            {/* Catatan */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    Catatan
                                </label>
                                <Input
                                    type="text"
                                    placeholder="Keterangan tambahan..."
                                    className="h-9 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                                    disabled={isPending}
                                    {...register("catatan")}
                                />
                                {errors.catatan && (
                                    <p className="text-[9px] text-rose-500 font-medium">
                                        {errors.catatan.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </form>
        </FormProvider>
    );
}

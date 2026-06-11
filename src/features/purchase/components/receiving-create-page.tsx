"use client";

import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { FormSelect } from "@/components/forms/form-select";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAllSuppliers } from "@/features/suppliers/api/suppliers-api";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconArrowLeft, IconClipboardPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FormProvider, useForm, useWatch, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { useCreateReceivingHeader, useOutstandingPurchaseOrders } from "../api/purchase-api";
import { receivingHeaderSchema, type ReceivingHeaderInput } from "../schemas/receiving-schema";

export function ReceivingCreatePage() {
    const router = useRouter();
    const createHeader = useCreateReceivingHeader();
    const { data: suppliers = [], isLoading: suppliersLoading } = useAllSuppliers();
    const { data: outstandingPosData, isLoading: posLoading } = useOutstandingPurchaseOrders({
        per_page: 100,
    });

    const supplierOptions = suppliers.map((s) => ({
        value: String(s.id),
        label: s.nama,
    }));

    const poOptions = [
        { value: "", label: "-- Tanpa PO (Pembelian Langsung) --" },
        ...(outstandingPosData?.data || []).map((po) => ({
            value: String(po.id),
            label: `${po.nomor_po} - ${po.supplier?.nama || po.supplier_name || "Tanpa Supplier"}`,
        })),
    ];

    const methods = useForm<ReceivingHeaderInput>({
        resolver: zodResolver(receivingHeaderSchema) as Resolver<ReceivingHeaderInput>,
        defaultValues: {
            purchase_order_id: null,
            supplier_id: null,
            nomor_faktur: "",
            nilai_faktur: 0,
            tanggal_terima: new Date().toISOString().split("T")[0],
            status_pembayaran: "pending",
            catatan: "",
        },
    });

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = methods;

    const purchaseOrderId = useWatch({ name: "purchase_order_id", control: methods.control });

    // Auto-select and lock supplier if PO is chosen
    useEffect(() => {
        if (purchaseOrderId) {
            const selectedPo = (outstandingPosData?.data || []).find(
                (po) => po.id === Number(purchaseOrderId)
            );
            if (selectedPo && selectedPo.supplier_id) {
                setValue("supplier_id", selectedPo.supplier_id);
            }
        } else {
            setValue("supplier_id", null);
        }
    }, [purchaseOrderId, outstandingPosData, setValue]);

    const onSubmit = (data: ReceivingHeaderInput) => {
        // Prepare payload, convert empty strings to null or correct types
        const payload: ReceivingHeaderInput = {
            ...data,
            purchase_order_id: data.purchase_order_id ? Number(data.purchase_order_id) : null,
            supplier_id: data.supplier_id ? Number(data.supplier_id) : null,
        };

        createHeader.mutate(payload, {
            onSuccess: (response) => {
                toast.success("Header Penerimaan Barang berhasil dibuat!");
                // Redirect to Step 2 page
                router.push(`/admin/purchase/receiving/${response.data.id}/items`);
            },
            onError: (err) => {
                toast.error(err.message || "Gagal membuat penerimaan header.");
            },
        });
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header / Breadcrumb */}
            <div className="flex items-center gap-4">
                <Button
                    type="button"
                    onClick={() => router.push("/admin/purchase/receiving")}
                    variant="outline"
                    className="p-2 h-9 w-9 rounded-xl border-slate-200 text-slate-500 hover:text-slate-900 bg-white"
                >
                    <IconArrowLeft size={18} />
                </Button>
                <div>
                    <h2 className="text-base font-bold text-slate-900">
                        Buat Penerimaan Baru — Langkah 1 dari 2
                    </h2>
                    <p className="text-xs text-slate-400">
                        Lengkapi informasi faktur dan supplier barang masuk terlebih dahulu.
                    </p>
                </div>
            </div>

            {/* Form Card */}
            <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-2.5 pb-4 border-b border-slate-50 mb-6">
                    <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl border border-emerald-100/30">
                        <IconClipboardPlus size={20} />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-slate-900">Informasi Header Dokumen</h3>
                        <p className="text-[10px] text-slate-400">Semua field bertanda bintang (*) wajib diisi.</p>
                    </div>
                </div>

                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Purchase Order Dropdown */}
                            <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    Referensi Purchase Order (PO)
                                </label>
                                <FormSelect<ReceivingHeaderInput>
                                    name="purchase_order_id"
                                    options={poOptions}
                                    placeholder={
                                        posLoading
                                            ? "Memuat daftar PO..."
                                            : "-- Pilih PO (Kosongkan jika beli langsung) --"
                                    }
                                    disabled={createHeader.isPending || posLoading}
                                />
                                {errors.purchase_order_id && (
                                    <p className="text-[10px] text-rose-500 font-medium">
                                        {errors.purchase_order_id.message}
                                    </p>
                                )}
                            </div>

                            {/* Supplier Dropdown */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    Supplier {!purchaseOrderId && " *"}
                                </label>
                                <FormSelect<ReceivingHeaderInput>
                                    name="supplier_id"
                                    options={supplierOptions}
                                    placeholder={
                                        suppliersLoading
                                            ? "Memuat supplier..."
                                            : "-- Pilih Supplier --"
                                    }
                                    disabled={createHeader.isPending || suppliersLoading || !!purchaseOrderId}
                                />
                                {errors.supplier_id && (
                                    <p className="text-[10px] text-rose-500 font-medium">
                                        {errors.supplier_id.message}
                                    </p>
                                )}
                            </div>

                            {/* Tanggal Terima */}
                            <FormDatePicker<ReceivingHeaderInput>
                                name="tanggal_terima"
                                label="Tanggal Penerimaan *"
                                disabled={createHeader.isPending}
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
                                    disabled={createHeader.isPending}
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
                                    disabled={createHeader.isPending}
                                />
                            </div>
                        </div>

                        {/* Catatan */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Catatan / Keterangan tambahan
                            </label>
                            <Input
                                type="text"
                                placeholder="Misal: Barang diterima dalam kondisi baik, bonus promo 2 pcs..."
                                className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                                disabled={createHeader.isPending}
                                {...register("catatan")}
                            />
                            {errors.catatan && (
                                <p className="text-[10px] text-rose-500 font-medium">
                                    {errors.catatan.message}
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                            <Button
                                type="button"
                                onClick={() => router.push("/admin/purchase/receiving")}
                                variant="outline"
                                className="px-6 h-11 border-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center cursor-pointer bg-white"
                                disabled={createHeader.isPending}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className="px-6 h-11 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                                disabled={createHeader.isPending}
                            >
                                {createHeader.isPending ? "Menyimpan..." : "Lanjut ke Input Barang"}
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </section>
        </div>
    );
}

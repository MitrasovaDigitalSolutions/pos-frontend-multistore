"use client";

import { FormSelect } from "@/components/forms/form-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAllSuppliers } from "@/features/suppliers/api/suppliers-api";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCreatePurchaseOrderHeader } from "../api/purchase-api";
import { purchaseOrderHeaderSchema, type PurchaseOrderHeaderInput } from "../schemas/order-schema";
import { IconArrowLeft, IconClipboardPlus } from "@tabler/icons-react";

export function POCreatePage() {
    const router = useRouter();
    const createHeader = useCreatePurchaseOrderHeader();
    const { data: suppliers = [], isLoading: suppliersLoading } = useAllSuppliers();

    const supplierOptions = suppliers.map((s) => ({
        value: String(s.id),
        label: s.nama,
    }));

    const methods = useForm<PurchaseOrderHeaderInput>({
        resolver: zodResolver(purchaseOrderHeaderSchema) as Resolver<PurchaseOrderHeaderInput>,
        defaultValues: {
            supplier_id: undefined,
            tanggal_po: new Date().toISOString().split("T")[0],
            catatan: "",
        },
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = methods;

    const onSubmit = (data: PurchaseOrderHeaderInput) => {
        createHeader.mutate(data, {
            onSuccess: (response) => {
                toast.success("Header Purchase Order berhasil dibuat!");
                // Redirect to the items input page (Step 2)
                router.push(`/admin/purchase/order/${response.data.id}/items`);
            },
            onError: (err) => {
                toast.error(err.message || "Gagal membuat Purchase Order header.");
            },
        });
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header / Breadcrumb */}
            <div className="flex items-center gap-4">
                <Button
                    type="button"
                    onClick={() => router.push("/admin/purchase/order")}
                    variant="outline"
                    className="p-2 h-9 w-9 rounded-xl border-slate-200 text-slate-500 hover:text-slate-900 bg-white"
                >
                    <IconArrowLeft size={18} />
                </Button>
                <div>
                    <h2 className="text-base font-bold text-slate-900">
                        Buat Purchase Order Baru — Langkah 1 dari 2
                    </h2>
                    <p className="text-xs text-slate-400">
                        Lengkapi informasi header supplier dan tanggal pemesanan terlebih dahulu.
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
                            {/* Supplier Dropdown */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    Supplier *
                                </label>
                                <FormSelect<PurchaseOrderHeaderInput>
                                    name="supplier_id"
                                    options={supplierOptions}
                                    placeholder={
                                        suppliersLoading
                                            ? "Memuat supplier..."
                                            : "-- Pilih Supplier --"
                                    }
                                    disabled={createHeader.isPending || suppliersLoading}
                                />
                                {errors.supplier_id && (
                                    <p className="text-[10px] text-rose-500 font-medium">
                                        {errors.supplier_id.message}
                                    </p>
                                )}
                            </div>

                            {/* Tanggal PO */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    Tanggal PO *
                                </label>
                                <Input
                                    type="date"
                                    className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                                    disabled={createHeader.isPending}
                                    {...register("tanggal_po")}
                                />
                                {errors.tanggal_po && (
                                    <p className="text-[10px] text-rose-500 font-medium">
                                        {errors.tanggal_po.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Catatan */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Catatan / Keterangan tambahan
                            </label>
                            <Input
                                type="text"
                                placeholder="Misal: Harap kirim menggunakan box kayu, atau termin pembayaran 30 hari..."
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
                                onClick={() => router.push("/admin/purchase/order")}
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

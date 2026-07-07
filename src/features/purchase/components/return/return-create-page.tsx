"use client";

import { FormSelect } from "@/components/forms/form-select";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAllSuppliers } from "@/features/suppliers/api/suppliers-api";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconArrowLeft, IconClipboardPlus } from "@tabler/icons-react";
import { useAppRouter } from "@/hooks/use-app-router";
import { useEffect } from "react";
import { FormProvider, useForm, useWatch, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { useCreatePurchaseReturnHeader, useReceivings } from "../../api/purchase-api";
import { purchaseReturnHeaderSchema, type PurchaseReturnHeaderInput } from "../../schemas/return-schema";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { RECEIVING_STATUS } from "@/constants/purchase";
import { todayStr } from "@/lib/date-utils";

export function ReturnCreatePage() {
    const router = useAppRouter();
    const createHeader = useCreatePurchaseReturnHeader();
    const { data: suppliers = [], isLoading: suppliersLoading } = useAllSuppliers();

    // Fetch completed receivings to return items from
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

    const methods = useForm<PurchaseReturnHeaderInput>({
        resolver: zodResolver(purchaseReturnHeaderSchema) as Resolver<PurchaseReturnHeaderInput>,
        defaultValues: {
            receiving_uid: undefined,
            supplier_uid: undefined,
            tanggal_retur: todayStr(),
            catatan: "",
        },
    });

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = methods;

    const receivingId = useWatch({ name: "receiving_uid", control: methods.control });

    // Auto-select and lock supplier based on selected receiving
    useEffect(() => {
        if (receivingId) {
            const selectedReceiving = (receivingsData?.data || []).find(
                (r) => r.uid === receivingId
            );
            if (selectedReceiving && selectedReceiving.supplier_uid) {
                setValue("supplier_uid", String(selectedReceiving.supplier_uid));
            }
        } else {
            setValue("supplier_uid", undefined as unknown as string);
        }
    }, [receivingId, receivingsData, setValue]);

    const onSubmit = (data: PurchaseReturnHeaderInput) => {
        createHeader.mutate(data, {
            onSuccess: (response) => {
                toast.success("Header Retur Pembelian berhasil dibuat!");
                // Redirect to Step 2 page
                router.push(`/admin/purchase/return/${response.data.uid}/items`);
            },
            onError: (err) => {
                toast.error(err.message || "Gagal membuat retur header.");
            },
        });
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header / Breadcrumb */}
            <div className="flex items-center gap-4">
                <Button
                    type="button"
                    onClick={() => router.push("/admin/purchase/return")}
                    variant="outline"
                    className="p-2 h-9 w-9 rounded-xl border-slate-200 text-slate-500 hover:text-slate-900 bg-white cursor-pointer"
                >
                    <IconArrowLeft size={18} />
                </Button>
                <div>
                    <h2 className="text-base font-bold text-slate-900">
                        Buat Retur Pembelian Baru — Langkah 1 dari 2
                    </h2>
                    <p className="text-xs text-slate-400">
                        Lengkapi informasi faktur penerimaan dan detail tanggal retur terlebih dahulu.
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
                        <h3 className="text-xs font-bold text-slate-900">Informasi Header Retur</h3>
                        <p className="text-[10px] text-slate-400">Semua field bertanda bintang (*) wajib diisi.</p>
                    </div>
                </div>

                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Receiving Selector */}
                            <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    Referensi Faktur Penerimaan *
                                </label>
                                <FormSelect<PurchaseReturnHeaderInput>
                                    name="receiving_uid"
                                    options={receivingOptions}
                                    placeholder={
                                        receivingsLoading
                                            ? "Memuat daftar penerimaan..."
                                            : "-- Pilih Faktur Penerimaan (Completed) --"
                                    }
                                    disabled={createHeader.isPending || receivingsLoading}
                                />
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
                                        suppliersLoading
                                            ? "Memuat supplier..."
                                            : "-- Pilih Supplier --"
                                    }
                                    disabled={createHeader.isPending || suppliersLoading || !!receivingId}
                                />
                            </div>

                            {/* Tanggal Retur */}
                            <div className="space-y-1.5">
                                <FormDatePicker<PurchaseReturnHeaderInput>
                                    name="tanggal_retur"
                                    label="Tanggal Retur *"
                                    disabled={createHeader.isPending}
                                />
                            </div>
                        </div>

                        {/* Catatan */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Catatan / Keterangan Retur
                            </label>
                            <Input
                                type="text"
                                placeholder="Misal: Barang rusak saat diterima, pecah kemasan, atau salah spesifikasi..."
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
                                onClick={() => router.push("/admin/purchase/return")}
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

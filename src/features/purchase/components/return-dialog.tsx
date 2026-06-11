"use client";

import { FormSelect } from "@/components/forms/form-select";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Scrollable } from "@/components/ui/scrollable";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/features/products/types";
import { useAllSuppliers } from "@/features/suppliers/api/suppliers-api";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconArrowBackUp, IconPlus } from "@tabler/icons-react";
import { useEffect } from "react";
import {
    FormProvider,
    useFieldArray,
    useForm,
    useWatch,
    type Resolver
} from "react-hook-form";
import { toast } from "sonner";
import {
    useCreatePurchaseReturn,
    usePurchaseReturnDetail,
    useReceivings,
    useUpdatePurchaseReturn,
} from "../api/purchase-api";
import {
    purchaseReturnSchema,
    type PurchaseReturnInput,
} from "../schemas/return-schema";
import type { PurchaseReturn } from "../types";
import { ReturnItemRow } from "./return-item-row";

interface ReturnDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    products: Product[];
    editingReturn?: PurchaseReturn | null;
}

export function ReturnDialog({
    open,
    onOpenChange,
    products,
    editingReturn = null,
}: ReturnDialogProps) {
    const createReturn = useCreatePurchaseReturn();
    const updateReturn = useUpdatePurchaseReturn();
    const { data: suppliers = [], isLoading: suppliersLoading } = useAllSuppliers();

    const isEdit = !!editingReturn;

    const { data: detailData, isLoading: detailLoading } = usePurchaseReturnDetail(
        editingReturn?.id || null,
    );

    const productOptions = products.map((p) => ({
        value: String(p.id),
        label: p.nama,
    }));

    const supplierOptions = suppliers.map((s) => ({
        value: String(s.id),
        label: s.nama,
    }));

    const methods = useForm<PurchaseReturnInput>({
        resolver: zodResolver(purchaseReturnSchema) as Resolver<PurchaseReturnInput>,
        defaultValues: {
            supplier_id: 0,
            stock_receiving_id: null,
            tanggal_retur: new Date().toISOString().split("T")[0],
            catatan: "",
            items: [{ product_id: 0, kuantitas: 0, harga_beli: 0 }],
        },
    });

    const {
        register,
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = methods;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items",
    });

    const selectedSupplierId = useWatch({ control: methods.control, name: "supplier_id" });

    // Fetch receivings for the selected supplier to link
    const { data: receivingsData, isLoading: receivingsLoading } = useReceivings({
        supplier_id: selectedSupplierId ? Number(selectedSupplierId) : undefined,
        status: "completed",
        per_page: 100,
    });

    const receivingOptions = (receivingsData?.data || []).map((r) => ({
        value: String(r.id),
        label: `${r.nomor_penerimaan} (Faktur: ${r.nomor_faktur || "-"}, Total: ${formatRupiah(r.nilai_faktur || 0)})`,
    }));

    // Load edit values
    useEffect(() => {
        if (open) {
            if (editingReturn) {
                const currentData = detailData || editingReturn;
                reset({
                    supplier_id: currentData.supplier_id,
                    stock_receiving_id: currentData.stock_receiving_id,
                    tanggal_retur: currentData.tanggal_retur,
                    catatan: currentData.catatan || "",
                    items: currentData.items?.map((item) => ({
                        product_id: item.product_id,
                        kuantitas: item.kuantitas,
                        harga_beli: item.harga_beli || 0,
                    })) || [{ product_id: 0, kuantitas: 0, harga_beli: 0 }],
                });
            } else {
                reset({
                    supplier_id: 0,
                    stock_receiving_id: null,
                    tanggal_retur: new Date().toISOString().split("T")[0],
                    catatan: "",
                    items: [{ product_id: 0, kuantitas: 0, harga_beli: 0 }],
                });
            }
        }
    }, [open, editingReturn, reset, detailData]);

    const isPending = createReturn.isPending || updateReturn.isPending;
    const showLoading = isEdit && detailLoading;

    // Calculate live total nominal
    const itemsWatch = useWatch({ control: methods.control, name: "items" }) || [];
    const liveTotalNominal = itemsWatch.reduce((acc, curr) => {
        const qty = Number(curr?.kuantitas) || 0;
        const price = Number(curr?.harga_beli) || 0;
        return acc + qty * price;
    }, 0);

    const onSubmit = (data: PurchaseReturnInput) => {
        if (isEdit && editingReturn) {
            updateReturn.mutate(
                { id: editingReturn.id, data },
                {
                    onSuccess: () => {
                        toast.success("Draft Retur Pembelian berhasil diperbarui.");
                        onOpenChange(false);
                    },
                    onError: (err) => {
                        toast.error(
                            err.message || "Gagal memperbarui draft Retur Pembelian.",
                        );
                    },
                },
            );
        } else {
            createReturn.mutate(data, {
                onSuccess: () => {
                    toast.success("Draft Retur Pembelian berhasil disimpan.");
                    onOpenChange(false);
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal menyimpan draft Retur Pembelian.");
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-fit! bg-white rounded-2xl border-slate-100 p-6 flex flex-col max-h-[90vh]">
                <DialogHeader className="pb-4 border-b border-slate-100 shrink-0 flex flex-row justify-between items-center gap-6">
                    <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <IconArrowBackUp
                            size={20}
                            className="text-emerald-500"
                        />
                        <span>
                            {isEdit
                                ? `Ubah Draft Retur (${editingReturn.nomor_retur})`
                                : "Buat Dokumen Retur Pembelian (Purchase Return)"}
                        </span>
                    </DialogTitle>

                    {!showLoading && (
                        <div className="bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100/50 flex flex-col items-end mr-4">
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                Total Nominal Retur
                            </span>
                            <span className="text-xs font-extrabold text-emerald-600 font-mono">
                                {formatRupiah(liveTotalNominal)}
                            </span>
                        </div>
                    )}
                </DialogHeader>

                <FormProvider {...methods}>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="flex flex-col flex-1 overflow-hidden min-h-0 pt-4"
                    >
                        <Scrollable className="flex-1 pr-1">
                            {showLoading ? (
                                <div className="space-y-4 pb-4 pr-1">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                            <Skeleton className="h-3 w-16 rounded" />
                                            <Skeleton className="h-10 w-full rounded-xl" />
                                        </div>
                                        <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                            <Skeleton className="h-3 w-16 rounded" />
                                            <Skeleton className="h-10 w-full rounded-xl" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Skeleton className="h-3 w-16 rounded" />
                                        <Skeleton className="h-10 w-full rounded-xl" />
                                    </div>
                                    <div className="space-y-4 pt-4 border-t border-slate-100">
                                        <div className="flex justify-between items-center">
                                            <Skeleton className="h-4 w-28 rounded" />
                                            <Skeleton className="h-7 w-20 rounded-lg" />
                                        </div>
                                        {[...Array(2)].map((_, i) => (
                                            <div key={i} className="bg-slate-50/50 border border-slate-100 p-4 rounded-xl space-y-3">
                                                <Skeleton className="h-10 w-full rounded-xl" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 pb-4 pr-1">
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Supplier */}
                                        <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                Supplier *
                                            </label>
                                            <FormSelect<PurchaseReturnInput>
                                                name="supplier_id"
                                                options={supplierOptions}
                                                placeholder={
                                                    suppliersLoading
                                                        ? "Memuat supplier..."
                                                        : "-- Pilih Supplier --"
                                                }
                                                disabled={isPending || suppliersLoading}
                                                onChange={() => {
                                                    // Reset stock receiving ID when supplier changes
                                                    setValue("stock_receiving_id", null);
                                                }}
                                            />
                                            {errors.supplier_id && (
                                                <p className="text-[10px] text-rose-500 font-medium">
                                                    {errors.supplier_id.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* Tanggal Retur */}
                                        <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                Tanggal Retur *
                                            </label>
                                            <Input
                                                type="date"
                                                className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                                                disabled={isPending}
                                                {...register("tanggal_retur")}
                                            />
                                            {errors.tanggal_retur && (
                                                <p className="text-[10px] text-rose-500 font-medium">
                                                    {errors.tanggal_retur.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Stock Receiving Invoice Link (Optional) */}
                                        <div className="space-y-1.5 col-span-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                Hubungkan Penerimaan Barang (Opsional)
                                            </label>
                                            <FormSelect<PurchaseReturnInput>
                                                name="stock_receiving_id"
                                                options={[
                                                    { value: "0", label: "-- Tanpa Hubungan Dokumen --" },
                                                    ...receivingOptions
                                                ]}
                                                placeholder={
                                                    !selectedSupplierId
                                                        ? "Pilih supplier terlebih dahulu"
                                                        : receivingsLoading
                                                            ? "Memuat data penerimaan..."
                                                            : "-- Pilih Dokumen Penerimaan Barang --"
                                                }
                                                disabled={isPending || !selectedSupplierId || receivingsLoading}
                                                onChange={(val) => {
                                                    // Auto-populate return items if user connects a receiving doc
                                                    const receivingId = Number(val);
                                                    if (receivingId > 0 && receivingsData?.data) {
                                                        const receiving = receivingsData.data.find(r => r.id === receivingId);
                                                        if (receiving && receiving.items && receiving.items.length > 0) {
                                                            const items = receiving.items.map(item => ({
                                                                product_id: item.product_id,
                                                                kuantitas: item.kuantitas,
                                                                harga_beli: item.harga_beli,
                                                            }));
                                                            setValue("items", items);
                                                        }
                                                    }
                                                }}
                                            />
                                            {errors.stock_receiving_id && (
                                                <p className="text-[10px] text-rose-500 font-medium">
                                                    {errors.stock_receiving_id.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Catatan */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            Catatan / Alasan Retur
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="Alasan pengembalian barang (misal: barang rusak / salah kirim)..."
                                            className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                                            disabled={isPending}
                                            {...register("catatan")}
                                        />
                                        {errors.catatan && (
                                            <p className="text-[10px] text-rose-500 font-medium">
                                                {errors.catatan.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Items Rows */}
                                    <div className="space-y-4 pt-4 border-t border-slate-100">
                                        <div className="flex justify-between items-center">
                                            <h5 className="text-xs font-bold text-slate-800">
                                                Daftar Barang Retur
                                            </h5>
                                        </div>

                                        <div className="space-y-3">
                                            {fields.map((field, idx) => (
                                                <ReturnItemRow
                                                    key={field.id}
                                                    idx={idx}
                                                    isPending={isPending}
                                                    products={products}
                                                    productOptions={productOptions}
                                                    remove={remove}
                                                    showDelete={fields.length > 1}
                                                />
                                            ))}
                                        </div>

                                        <Button
                                            type="button"
                                            onClick={() =>
                                                append({
                                                    product_id: 0,
                                                    kuantitas: 0,
                                                    harga_beli: 0,
                                                })
                                            }
                                            variant="outline"
                                            className="w-full h-10 border-dashed border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 text-slate-500 hover:text-emerald-600 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-white"
                                            disabled={isPending}
                                        >
                                            <IconPlus size={16} />
                                            <span>Tambah Barang</span>
                                        </Button>

                                        {errors.items && (
                                            <p className="text-[10px] text-rose-500 font-medium">
                                                {errors.items.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </Scrollable>

                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-100 shrink-0 bg-white">
                            <Button
                                type="button"
                                onClick={() => onOpenChange(false)}
                                variant="outline"
                                className="w-full sm:w-auto px-6 h-11 border-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center cursor-pointer bg-white"
                                disabled={isPending}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className="w-full sm:w-auto px-6 h-11 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                                disabled={isPending || showLoading}
                            >
                                {isPending ? "Menyimpan..." : "Simpan Draft Retur"}
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
}

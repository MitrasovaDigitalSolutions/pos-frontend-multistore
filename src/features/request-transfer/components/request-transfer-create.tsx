"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { IconMinus, IconPackage, IconPlus, IconTrash, IconArrowLeft } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { NumberInput } from "@/components/ui/number-input";
import { FormSelect } from "@/components/forms/form-select";
import { BarcodeInput } from "@/components/shared/barcode-input";
import { FormInput } from "@/components/forms/form-input";
import { ROUTES } from "@/constants/routes";
import { useAllSuppliers } from "@/features/master/suppliers/api/suppliers-api";
import { useAllSupplierSales } from "@/features/supplier-sales/api/supplier-sales-api";
import type { Product } from "@/features/master/products/types";
import { useCreateRequestTransfer } from "../api/request-transfer-api";
import type { RequestLineItem } from "../schemas/request-transfer-schema";

export function RequestTransferCreate() {
    const router = useRouter();
    const createRequest = useCreateRequestTransfer();

    const { data: suppliers, isLoading: isLoadingSuppliers } = useAllSuppliers();
    const { data: supplierSales, isLoading: isLoadingSales } = useAllSupplierSales();

    const [supplierUid, setSupplierUid] = useState("");
    const [supplierSalesUid, setSupplierSalesUid] = useState<string | null>(null);
    const [catatan, setCatatan] = useState("");
    const [items, setItems] = useState<RequestLineItem[]>([]);

    const handleSupplierChange = (uid: string) => {
        setSupplierUid(uid);
        setSupplierSalesUid(null);
    };

    const handleCatalogChange = (uid: string) => {
        const sale = supplierSales?.find((s) => s.uid === uid);
        setSupplierSalesUid(uid || null);
        if (sale) {
            // Auto-fill semua item katalog dengan qty 0 (qty 0 diabaikan backend).
            const catalogLines: RequestLineItem[] = (sale.items || []).map((i) => ({
                product_uid: i.product_uid,
                nama: i.product?.nama || i.product_uid,
                barcode: i.product?.barcode || null,
                kuantitas: 0,
            }));
            setItems((prev) => {
                const merged = [...prev];
                for (const line of catalogLines) {
                    if (!merged.some((m) => m.product_uid === line.product_uid)) {
                        merged.push(line);
                    }
                }
                return merged;
            });
        }
    };

    const handleProductFound = (product: Product) => {
        setItems((prev) => {
            if (prev.some((i) => i.product_uid === product.uid)) {
                toast.info("Produk sudah ada di daftar.");
                return prev;
            }
            return [...prev, {
                product_uid: product.uid,
                nama: product.nama,
                barcode: product.barcode || null,
                kuantitas: 1,
            }];
        });
    };

    const handleUpdateQty = (productUid: string, qty: number) => {
        setItems((prev) =>
            prev.map((i) => (i.product_uid === productUid ? { ...i, kuantitas: qty } : i)),
        );
    };

    const handleRemoveItem = (productUid: string) => {
        setItems((prev) => prev.filter((i) => i.product_uid !== productUid));
    };

    const totalQty = items.reduce((acc, curr) => acc + curr.kuantitas, 0);
    const hasValidItems = items.some((i) => i.kuantitas > 0);
    const isPending = createRequest.isPending;

    const handleSubmit = () => {
        if (!supplierUid) {
            toast.error("Supplier wajib dipilih.");
            return;
        }
        if (!hasValidItems) {
            toast.error("Minimal 1 item dengan kuantitas lebih dari 0.");
            return;
        }
        createRequest.mutate(
            {
                supplier_uid: supplierUid,
                supplier_sales_uid: supplierSalesUid,
                catatan: catatan || null,
                items: items.filter((i) => i.kuantitas > 0).map((i) => ({
                    product_uid: i.product_uid,
                    kuantitas: i.kuantitas,
                })),
            },
            {
                onSuccess: () => {
                    toast.success("Request transfer berhasil dikirim.");
                    router.push(ROUTES.ADMIN_REQUEST_TRANSFERS);
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal mengirim request.");
                },
            },
        );
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-bold text-slate-900">Buat Request Transfer</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                        Kirim permintaan stok ke supplier dari toko Anda.
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(ROUTES.ADMIN_REQUEST_TRANSFERS)}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 cursor-pointer"
                >
                    <IconArrowLeft size={14} /> Kembali
                </Button>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <div className="p-1 rounded-md bg-emerald-50 text-emerald-600">
                        <IconPackage size={15} />
                    </div>
                    <span>Detail Permintaan</span>
                </h3>

                <FormSelect
                    name="supplier_uid"
                    label="Supplier *"
                    placeholder="Pilih supplier..."
                    searchPlaceholder="Cari supplier..."
                    isLoading={isLoadingSuppliers}
                    options={(suppliers || []).map((s) => ({ value: s.uid, label: s.nama }))}
                    onChange={handleSupplierChange}
                    disabled={isPending}
                />

                <FormSelect
                    name="supplier_sales_uid"
                    label="Katalog (opsional)"
                    placeholder="Pilih katalog untuk auto-isi produk..."
                    searchPlaceholder="Cari katalog..."
                    isLoading={isLoadingSales}
                    options={(supplierSales || [])
                        .filter((s) => !supplierUid || s.supplier_uid === supplierUid)
                        .map((s) => ({ value: s.uid, label: s.nama }))}
                    onChange={handleCatalogChange}
                    disabled={isPending}
                />

                <FormInput
                    name="catatan"
                    label="Catatan"
                    placeholder="Catatan untuk request..."
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    disabled={isPending}
                />
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-50 pb-2.5">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <div className="p-1 rounded-md bg-emerald-50 text-emerald-600">
                            <IconPackage size={15} />
                        </div>
                        <span>Daftar Barang Request</span>
                    </h3>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                        {items.length} Produk ({totalQty} unit)
                    </span>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Cari / Scan Produk
                    </label>
                    <BarcodeInput
                        onProductFound={handleProductFound}
                        placeholder="Scan barcode SKU atau ketik nama produk..."
                    />
                </div>

                {items.length > 0 ? (
                    <div className="border border-slate-100 rounded-xl overflow-hidden shadow-2xs">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-slate-50/80 border-b border-slate-100 font-bold text-slate-600">
                                <tr>
                                    <th className="px-3.5 py-2.5">Produk</th>
                                    <th className="px-3.5 py-2.5 text-center w-36">Kuantitas</th>
                                    <th className="px-3 py-2.5 text-center w-12">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {items.map((item) => (
                                    <tr key={item.product_uid} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-3.5 py-2.5">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-bold text-slate-900 text-xs">
                                                    {item.nama}
                                                </span>
                                                {item.barcode && (
                                                    <span className="font-mono text-[10px] text-slate-400">
                                                        {item.barcode}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3.5 py-2.5">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => handleUpdateQty(item.product_uid, item.kuantitas - 1)}
                                                    className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-all cursor-pointer"
                                                >
                                                    <IconMinus size={13} />
                                                </button>
                                                <NumberInput
                                                    value={item.kuantitas}
                                                    onChange={(val) => handleUpdateQty(item.product_uid, val || 0)}
                                                    min={0}
                                                    allowNegative={false}
                                                    className="h-7 w-14 text-center text-xs font-bold border-slate-200 rounded-lg px-1"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleUpdateQty(item.product_uid, item.kuantitas + 1)}
                                                    className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-all cursor-pointer"
                                                >
                                                    <IconPlus size={13} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2.5 text-center">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(item.product_uid)}
                                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                                                title="Hapus produk dari daftar"
                                            >
                                                <IconTrash size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-7 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-xl space-y-2">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                            <IconPackage size={22} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-700">Daftar Produk Masih Kosong</p>
                            <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-0.5">
                                Pilih katalog untuk auto-isi produk, atau gunakan pencarian / scanner di atas.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end">
                <Button
                    onClick={handleSubmit}
                    disabled={isPending || !hasValidItems}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-11 rounded-xl flex items-center gap-1.5 cursor-pointer px-6"
                >
                    {isPending ? "Mengirim..." : "Kirim Request"}
                </Button>
            </div>
        </div>
    );
}

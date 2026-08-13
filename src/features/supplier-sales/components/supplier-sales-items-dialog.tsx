"use client";

import { useState } from "react";
import { toast } from "sonner";
import { IconPackage, IconTrash } from "@tabler/icons-react";
import { BaseDialog } from "@/components/ui/base-dialog";
import { BarcodeInput } from "@/components/shared/barcode-input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { Product } from "@/features/master/products/types";
import { useAddSupplierSaleItem, useRemoveSupplierSaleItem } from "../api/supplier-sales-api";
import type { SupplierSale } from "../types";

interface SupplierSaleItemsDialogProps {
    sale: SupplierSale | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SupplierSaleItemsDialog({
    sale,
    open,
    onOpenChange,
}: SupplierSaleItemsDialogProps) {
    const addItem = useAddSupplierSaleItem();
    const removeItem = useRemoveSupplierSaleItem();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [productToRemove, setProductToRemove] = useState<string | null>(null);

    const items = sale?.items || [];

    const handleProductFound = (product: Product) => {
        if (!sale) return;
        if (items.some((i) => i.product_uid === product.uid)) {
            toast.info("Produk sudah ada di katalog.");
            return;
        }
        addItem.mutate(
            {
                uid: sale.uid,
                data: {
                    product_uid: product.uid,
                    harga_estimasi: product.harga_beli ?? 0,
                },
            },
            {
                onSuccess: () => toast.success(`"${product.nama}" ditambahkan ke katalog.`),
                onError: (err) => toast.error(err.message || "Gagal menambahkan produk."),
            },
        );
    };

    const handleConfirmRemove = () => {
        if (!sale || !productToRemove) return;
        removeItem.mutate(
            { uid: sale.uid, productUid: productToRemove },
            {
                onSuccess: () => {
                    toast.success("Produk dihapus dari katalog.");
                    setIsConfirmOpen(false);
                    setProductToRemove(null);
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal menghapus produk.");
                },
            },
        );
    };

    return (
        <>
            <BaseDialog
                open={open}
                onOpenChange={onOpenChange}
                title={
                    <>
                        <IconPackage size={20} className="text-emerald-500" />
                        <span>Kelola Produk — {sale?.nama || ""}</span>
                    </>
                }
                className="max-w-2xl"
            >
                <div className="space-y-4 pt-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Cari / Scan Produk
                        </label>
                        <BarcodeInput
                            onProductFound={handleProductFound}
                            placeholder="Scan barcode SKU atau ketik nama produk..."
                        />
                        <p className="text-[10px] text-slate-400">
                            Harga estimasi default diambil dari harga beli produk.
                        </p>
                    </div>

                    {items.length > 0 ? (
                        <div className="border border-slate-100 rounded-xl overflow-hidden shadow-2xs">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-slate-50/80 border-b border-slate-100 font-bold text-slate-600">
                                    <tr>
                                        <th className="px-3.5 py-2.5">Produk</th>
                                        <th className="px-3.5 py-2.5 text-right w-40">Harga Estimasi</th>
                                        <th className="px-3 py-2.5 text-center w-12">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {items.map((item) => (
                                        <tr key={item.uid} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-3.5 py-2.5">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-bold text-slate-900 text-xs">
                                                        {item.product?.nama}
                                                    </span>
                                                    {item.product?.barcode && (
                                                        <span className="font-mono text-[10px] text-slate-400">
                                                            {item.product.barcode}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3.5 py-2.5 text-right">
                                                <span className="font-semibold text-slate-700">
                                                    Rp {Number(item.harga_estimasi).toLocaleString("id-ID")}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2.5 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setProductToRemove(item.product_uid);
                                                        setIsConfirmOpen(true);
                                                    }}
                                                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                                                    title="Hapus produk dari katalog"
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
                                <p className="text-xs font-bold text-slate-700">Belum Ada Produk</p>
                                <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-0.5">
                                    Gunakan kotak pencarian / scanner di atas untuk menambahkan produk ke katalog.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </BaseDialog>

            <ConfirmDialog
                open={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                title="Hapus Produk dari Katalog"
                description="Apakah Anda yakin ingin menghapus produk ini dari katalog?"
                confirmText="Ya, Hapus"
                cancelText="Batal"
                onConfirm={handleConfirmRemove}
                isLoading={removeItem.isPending}
                variant="danger"
            />
        </>
    );
}

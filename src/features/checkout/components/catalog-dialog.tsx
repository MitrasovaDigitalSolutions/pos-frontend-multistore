"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { IconPackage, IconSearch } from "@tabler/icons-react";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { Product } from "@/features/products/types";

interface CatalogDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    products: Product[];
    onAddProduct: (product: Product) => Promise<void> | void;
}

export function CatalogDialog({
    open,
    onOpenChange,
    products,
    onAddProduct,
}: CatalogDialogProps) {
    const [catalogSearch, setCatalogSearch] = useState("");

    const filteredProducts = products.filter(
        (p) =>
            p.status === "active" &&
            (p.nama.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                (p.barcode
                    ?.toLowerCase()
                    .includes(catalogSearch.toLowerCase()) ??
                    false) ||
                p.merek.toLowerCase().includes(catalogSearch.toLowerCase())),
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-white rounded-2xl border-slate-100 p-6">
                <DialogHeader className="pb-4 border-b border-slate-100">
                    <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <IconPackage size={20} className="text-emerald-500" />
                        <span>Katalog Produk</span>
                    </DialogTitle>
                </DialogHeader>
                <div className="pt-3 space-y-3">
                    <div className="relative">
                        <IconSearch
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            size={15}
                        />
                        <Input
                            placeholder="Cari produk..."
                            className="pl-8 h-9 text-xs border-slate-200 rounded-xl"
                            value={catalogSearch}
                            onChange={(e) => setCatalogSearch(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-3 max-h-87.5 overflow-y-auto pr-1">
                        {filteredProducts.length === 0 ? (
                            <div className="col-span-3 text-center py-8 text-slate-400 text-xs">
                                Tidak ada produk ditemukan.
                            </div>
                        ) : (
                            filteredProducts.map((p) => (
                                <div
                                    key={p.id}
                                    onClick={async () => {
                                        if (p.stok <= 0) return;
                                        await onAddProduct(p);
                                        onOpenChange(false);
                                    }}
                                    className={`border p-4 rounded-xl cursor-pointer text-center group transition-all ${
                                        p.stok <= 0
                                            ? "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed"
                                            : "bg-slate-50 border-slate-100 hover:border-emerald-400 hover:bg-emerald-50/50"
                                    }`}
                                >
                                    <h5 className="font-bold text-slate-800 text-[12px] group-hover:text-emerald-900 line-clamp-2">
                                        {p.nama}
                                    </h5>
                                    <div className="text-emerald-600 font-extrabold text-xs mt-1.5">
                                        {formatRupiah(p.harga)}
                                    </div>
                                    <div
                                        className={`text-[9px] font-bold mt-1 ${
                                            p.stok <= 5
                                                ? "text-rose-500"
                                                : "text-slate-400"
                                        }`}
                                    >
                                        Stok: {p.stok}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

"use client";

import { BaseDialog } from "@/components/ui/base-dialog";
import { Scrollable } from "@/components/ui/scrollable";
import type { Product } from "@/features/products/types";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconPackage } from "@tabler/icons-react";

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
    // const [catalogSearch, setCatalogSearch] = useState("");

    const filteredProducts = products.filter(
        (p) =>
            p.status === "active"
    );

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <>
                    <IconPackage size={20} className="text-emerald-500" />
                    <span>Katalog Produk</span>
                </>
            }
            className="sm:max-w-2xl"
        >
            <div className="space-y-3">
                {/* <div className="relative">
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
                </div> */}
                <Scrollable>

                    <div className="grid grid-cols-3 gap-3 max-h-87.5 overflow-y-auto pr-1">
                        {filteredProducts.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-slate-400 text-xs">
                                Tidak ada produk ditemukan.
                            </div>
                        ) : (
                            filteredProducts.map((p) => (
                                <div
                                    key={p.uid}
                                    onClick={async () => {
                                        if (!p.is_jasa && p.stok <= 0) return;
                                        await onAddProduct(p);
                                        onOpenChange(false);
                                    }}
                                    className={`border p-4 rounded-xl cursor-pointer text-center group transition-all ${!p.is_jasa && p.stok <= 0
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
                                        className={`text-[9px] font-bold mt-1 ${p.is_jasa
                                            ? "text-blue-500"
                                            : p.stok <= 5
                                                ? "text-rose-500"
                                                : "text-slate-400"
                                            }`}
                                    >
                                        {p.is_jasa ? "Layanan / Jasa" : `Stok: ${p.stok}`}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Scrollable>
            </div>
        </BaseDialog>
    );
}

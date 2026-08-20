"use client";

import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconPackage, IconTag, IconPercentage } from "@tabler/icons-react";
import type { CatalogProduct } from "../../types";

interface CatalogAssignProductSummaryProps {
    product: CatalogProduct;
}

export function CatalogAssignProductSummary({ product }: CatalogAssignProductSummaryProps) {
    const masterPrice = product.harga_jual ?? product.harga;
    const hasMasterWholesale = Boolean(
        product.is_grosir &&
        product.harga_grosir &&
        product.min_qty_grosir &&
        product.min_qty_grosir > 0
    );

    return (
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shrink-0 text-slate-500 shadow-xs">
                    <IconPackage size={22} className="text-emerald-600" />
                </div>
                <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-slate-900 leading-tight truncate max-w-md">
                            {product.nama}
                        </span>
                        {product.is_jasa && (
                            <Badge className="text-[9px] px-1.5 py-0 bg-blue-50 text-blue-700 border-blue-100 font-bold">
                                Jasa
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2.5 flex-wrap text-xs text-slate-500">
                        {product.barcode && (
                            <span className="font-mono bg-white border border-slate-200 px-2 py-0.5 rounded-md text-[11px] font-bold text-slate-700">
                                {product.barcode}
                            </span>
                        )}
                        {product.category && (
                            <span className="text-[11px] font-medium text-slate-500">
                                Kategori: <strong className="text-slate-700 font-semibold">{product.category.nama}</strong>
                            </span>
                        )}
                        {product.brand && (
                            <span className="text-[11px] font-medium text-slate-500">
                                Brand: <strong className="text-slate-700 font-semibold">{product.brand.nama}</strong>
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 sm:border-l sm:border-slate-200 sm:pl-4 shrink-0 flex-wrap sm:flex-nowrap">
                <div className="flex flex-col items-start sm:items-end">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <IconTag size={12} />
                        Harga Jual Master
                    </span>
                    <span className="text-sm font-extrabold text-slate-900 font-mono">
                        {formatRupiah(masterPrice)}
                    </span>
                </div>

                {hasMasterWholesale ? (
                    <div className="flex flex-col items-start sm:items-end">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                            <IconPercentage size={12} />
                            Grosir Master
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-mono">
                            {formatRupiah(Number(product.harga_grosir))} (≥{product.min_qty_grosir} pcs)
                        </span>
                    </div>
                ) : (
                    <div className="flex flex-col items-start sm:items-end">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Grosir Master
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">
                            Tidak Aktif
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

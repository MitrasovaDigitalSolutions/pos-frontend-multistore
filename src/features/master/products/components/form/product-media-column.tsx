"use client";

import { FormImageUpload } from "@/components/forms/form-image-upload";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconTrendingUp, IconUpload } from "@tabler/icons-react";
import type { ProductInput } from "../../schemas/product-schema";
import type { ProductType } from "../../hooks/use-product-form-dialog";

interface ProductMediaColumnProps {
    productType: ProductType;
    disabled?: boolean;
    initialImageUrl?: string | null;
    profitPerUnit: number;
    margin?: number | null;
}

export function ProductMediaColumn({
    productType,
    disabled = false,
    initialImageUrl,
    profitPerUnit,
    margin,
}: ProductMediaColumnProps) {
    return (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-2xs space-y-2 flex flex-col justify-between h-full">
            <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100">
                    <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <IconUpload size={12} />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                        Foto Produk
                    </span>
                </div>

                <FormImageUpload<ProductInput>
                    name="image"
                    disabled={disabled}
                    initialUrl={initialImageUrl}
                    dropzoneClassName="h-32 min-h-[125px] max-h-[135px] rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 hover:border-emerald-500 transition-all flex flex-col items-center justify-center p-2"
                />
            </div>

            {/* Live Profit Preview */}
            {productType === "finished_good" && profitPerUnit > 0 ? (
                <div className="p-2 bg-emerald-50/80 border border-emerald-200/80 rounded-xl space-y-0.5">
                    <div className="flex items-center gap-1 text-emerald-800 font-bold text-[10px]">
                        <IconTrendingUp size={12} className="text-emerald-600 shrink-0" />
                        <span className="truncate">Estimasi Laba:</span>
                    </div>
                    <div className="flex items-baseline justify-between pt-0.5 gap-1">
                        <span className="font-extrabold text-emerald-950 text-xs truncate">
                            {formatRupiah(profitPerUnit)}
                        </span>
                        <Badge variant="success" className="text-[8.5px] px-1 py-0 font-bold shrink-0">
                            {margin || 0}%
                        </Badge>
                    </div>
                </div>
            ) : (
                <p className="text-[9.5px] text-slate-400 text-center italic py-0.5">
                    {productType === "finished_good" && "Produk retail fisik"}
                    {productType === "raw_material" && "Bahan baku formulasi"}
                    {productType === "jasa" && "Layanan tanpa persediaan"}
                </p>
            )}
        </div>
    );
}

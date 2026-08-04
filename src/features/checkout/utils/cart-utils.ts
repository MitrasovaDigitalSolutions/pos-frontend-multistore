import type { CartItem } from "../types";
import { formatRupiah } from "@/hooks/use-format-rupiah";

export interface ItemWholesaleBreakdown {
    isWholesaleActive: boolean;
    wholesaleQty: number;
    normalQty: number;
    wholesalePrice: number;
    normalPrice: number;
    wholesaleSubtotal: number;
    normalSubtotal: number;
    totalSavings: number;
    breakdownText: string | null;
}

export function getItemWholesaleBreakdown(item: CartItem): ItemWholesaleBreakdown {
    const qty = item.qty;
    const normalPrice = item.price;
    const minQty = item.min_qty_grosir;
    const wholesalePrice = item.harga_grosir;

    if (
        wholesalePrice !== null &&
        wholesalePrice !== undefined &&
        wholesalePrice > 0 &&
        minQty !== null &&
        minQty !== undefined &&
        minQty > 0 &&
        qty >= minQty
    ) {
        const wholesalePackages = Math.floor(qty / minQty);
        const wholesaleQty = wholesalePackages * minQty;
        const normalQty = qty - wholesaleQty;
        const wholesaleSubtotal = wholesaleQty * wholesalePrice;
        const normalSubtotal = normalQty * normalPrice;
        const actualSubtotal = wholesaleSubtotal + normalSubtotal;
        const regularSubtotal = qty * normalPrice;
        const totalSavings = Math.max(0, regularSubtotal - actualSubtotal);

        const text = normalQty > 0
            ? `Grosir: ${wholesaleQty} Pcs @ ${formatRupiah(wholesalePrice)} + Normal: ${normalQty} Pcs @ ${formatRupiah(normalPrice)}`
            : `Grosir: ${wholesaleQty} Pcs @ ${formatRupiah(wholesalePrice)}`;

        return {
            isWholesaleActive: true,
            wholesaleQty,
            normalQty,
            wholesalePrice,
            normalPrice,
            wholesaleSubtotal,
            normalSubtotal,
            totalSavings,
            breakdownText: text,
        };
    }

    return {
        isWholesaleActive: false,
        wholesaleQty: 0,
        normalQty: qty,
        wholesalePrice: wholesalePrice ?? 0,
        normalPrice,
        wholesaleSubtotal: 0,
        normalSubtotal: qty * normalPrice,
        totalSavings: 0,
        breakdownText: null,
    };
}

export function calculateItemSubtotal(item: CartItem): number {
    const breakdown = getItemWholesaleBreakdown(item);
    if (breakdown.isWholesaleActive) {
        return (breakdown.wholesaleQty * breakdown.wholesalePrice) + (breakdown.normalQty * breakdown.normalPrice);
    }
    return item.qty * item.price;
}

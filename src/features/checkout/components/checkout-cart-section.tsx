"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconScan, IconSearch, IconCategory, IconTrash } from "@tabler/icons-react";
import type { CartItem } from "@/features/checkout/types";

interface CheckoutCartSectionProps {
    barcodeInput: string;
    setBarcodeInput: (val: string) => void;
    isProcessing: boolean;
    cart: CartItem[];
    barcodeInputRef: React.RefObject<HTMLInputElement | null>;
    onBarcodeSubmit: (e: React.FormEvent) => void;
    onCatalogOpen: () => void;
    onUpdateQty: (item: CartItem, qty: number) => void;
    onRemoveItem: (item: CartItem) => void;
}

export function CheckoutCartSection({
    barcodeInput,
    setBarcodeInput,
    isProcessing,
    cart,
    barcodeInputRef,
    onBarcodeSubmit,
    onCatalogOpen,
    onUpdateQty,
    onRemoveItem,
}: CheckoutCartSectionProps) {
    return (
        <div className="bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden">
            {/* Scanner / Search */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex gap-3 items-center">
                <form onSubmit={onBarcodeSubmit} className="grow relative">
                    <IconSearch
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500"
                        size={18}
                    />
                    <Input
                        ref={barcodeInputRef}
                        type="text"
                        placeholder="Scan Barcode atau ketik nama produk... (Enter)"
                        className="w-full h-11 pl-10 pr-4 text-[13px] font-semibold bg-white border-2 border-emerald-500 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-emerald-600 rounded-xl"
                        value={barcodeInput}
                        onChange={(e) => setBarcodeInput(e.target.value)}
                        disabled={isProcessing}
                    />
                </form>
                <Button
                    variant="outline"
                    onClick={onCatalogOpen}
                    className="h-11 border-dashed border-emerald-500 hover:bg-emerald-50 text-emerald-600 font-bold px-4 rounded-xl flex gap-2 cursor-pointer bg-white"
                >
                    <IconCategory size={18} />
                    <span>Katalog (F2)</span>
                </Button>
            </div>

            {/* Cart Table */}
            <div className="grow overflow-y-auto p-4">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                        <IconScan size={48} className="text-slate-200 mb-3" />
                        <h4 className="text-[13px] font-bold text-slate-700">
                            Belum Ada Item Belanja
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-70">
                            Pindai barcode atau gunakan Katalog untuk menambahkan item.
                        </p>
                    </div>
                ) : (
                    <Table className="w-full border-collapse">
                        <TableHeader className="bg-slate-50 border-b border-slate-100">
                            <TableRow>
                                <TableHead className="w-12 text-center text-[10px] font-bold text-slate-500">
                                    #
                                </TableHead>
                                <TableHead className="text-[10px] font-bold text-slate-500">
                                    Nama Produk
                                </TableHead>
                                <TableHead className="text-center w-28 text-[10px] font-bold text-slate-500">
                                    Qty
                                </TableHead>
                                <TableHead className="text-right w-24 text-[10px] font-bold text-slate-500">
                                    Harga
                                </TableHead>
                                <TableHead className="text-right w-28 text-[10px] font-bold text-slate-500">
                                    Total
                                </TableHead>
                                <TableHead className="text-center w-12 text-[10px] font-bold text-slate-500" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cart.map((item, idx) => (
                                <TableRow
                                    key={item.itemId ?? item.product_id}
                                    className="hover:bg-slate-50/50 transition-colors"
                                >
                                    <TableCell className="text-center text-slate-400 font-medium">
                                        {idx + 1}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-bold text-slate-800 text-[12px]">
                                            {item.name}
                                        </div>
                                        {item.barcode && (
                                            <div className="text-[10px] text-slate-400 font-medium">
                                                Barcode: {item.barcode}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => onUpdateQty(item, item.qty - 1)}
                                                disabled={isProcessing}
                                                className="w-6 h-6 border border-slate-200 rounded flex items-center justify-center hover:bg-emerald-50 text-emerald-600 font-bold disabled:opacity-40 cursor-pointer"
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center text-xs font-bold text-slate-800">
                                                {item.qty}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => onUpdateQty(item, item.qty + 1)}
                                                disabled={isProcessing}
                                                className="w-6 h-6 border border-slate-200 rounded flex items-center justify-center hover:bg-emerald-50 text-emerald-600 font-bold disabled:opacity-40 cursor-pointer"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right text-slate-700 font-medium tabular-nums">
                                        {formatRupiah(item.price)}
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-slate-900 tabular-nums">
                                        {formatRupiah(item.price * item.qty)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <button
                                            type="button"
                                            onClick={() => onRemoveItem(item)}
                                            disabled={isProcessing}
                                            className="text-rose-500 hover:bg-rose-50 p-1.5 rounded transition-colors disabled:opacity-40 cursor-pointer border-none bg-transparent"
                                        >
                                            <IconTrash size={16} />
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}

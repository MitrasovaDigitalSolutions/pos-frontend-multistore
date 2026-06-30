"use client";

import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { BarcodeInput } from "@/components/shared/barcode-input";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { CartItem } from "@/features/checkout/types";
import type { Product } from "@/features/products/types";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconScan, IconTrash } from "@tabler/icons-react";
import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { ProductSearchDialog } from "./product-search-dialog";

interface ServicePriceInputProps {
    item: CartItem;
    onUpdatePrice: (item: CartItem, price: number) => void;
    isProcessing: boolean;
    className?: string;
}

function ServicePriceInput({
    item,
    onUpdatePrice,
    isProcessing,
    className,
}: ServicePriceInputProps) {
    const methods = useForm<{ price: number | null }>({
        defaultValues: {
            price: item.price,
        },
    });

    React.useEffect(() => {
        methods.reset({ price: item.price });
    }, [item.price, methods]);

    return (
        <FormProvider {...methods}>
            <FormNominalInput<{ price: number | null }>
                name="price"
                onValueChange={(val) => {
                    onUpdatePrice(item, val ?? 0);
                }}
                disabled={isProcessing}
                className={className}
            />
        </FormProvider>
    );
}

interface CheckoutCartSectionProps {
    isProcessing: boolean;
    cart: CartItem[];
    barcodeInputRef: React.RefObject<HTMLInputElement | null>;
    onCatalogOpen: () => void;
    onUpdateQty: (item: CartItem, qty: number) => void;
    onUpdatePrice: (item: CartItem, price: number) => void;
    onRemoveItem: (item: CartItem) => void;
    onAddProduct: (product: Product) => void;
    products?: Product[];
}

export function CheckoutCartSection({
    isProcessing,
    cart,
    barcodeInputRef,
    onUpdateQty,
    onUpdatePrice,
    onRemoveItem,
    onAddProduct,
    products = [],
}: CheckoutCartSectionProps) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearchSubmit = (query: string) => {
        setSearchQuery(query);
        setIsSearchOpen(true);
    };

    return (
        <div className="bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden min-h-0">
            {/* Scanner / Search */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3 sm:items-start shrink-0">
                <div className="grow w-full">
                    <BarcodeInput
                        ref={barcodeInputRef}
                        onProductFound={onAddProduct}
                        onError={(msg) => toast.error(msg)}
                        disabled={isProcessing}
                        placeholder="Scan Barcode atau ketik nama produk... (Enter)"
                        mode="sell"
                        products={products}
                        searchLabel="Cari Selengkapnya"
                        onSearchSubmit={handleSearchSubmit}
                    />
                </div>
            </div>

            {/* Cart Items (Table on Desktop, Cards on Mobile) */}
            <div className="grow overflow-y-auto p-4 min-h-0">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                        <IconScan size={48} className="text-slate-200 mb-3" />
                        <h4 className="text-[13px] font-bold text-slate-700">
                            Belum Ada Item Belanja
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-70">
                            Pindai barcode atau cari produk untuk menambahkan item.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden sm:block">
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
                                        <TableHead className="text-right w-32 text-[10px] font-bold text-slate-500">
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
                                            key={item.itemId ?? item.product_uid}
                                            className="hover:bg-slate-50/50 transition-colors"
                                        >
                                            <TableCell className="text-center text-slate-400 font-medium">
                                                {idx + 1}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-bold text-slate-800 text-[12px] flex items-center gap-2">
                                                    {item.name}
                                                    {item.is_jasa && (
                                                        <span className="bg-emerald-100 text-emerald-700 text-[9px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                                                            Jasa
                                                        </span>
                                                    )}
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
                                                    <Input
                                                        type="number"
                                                        value={item.qty}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val === "") return;
                                                            const num = parseInt(val, 10);
                                                            if (!isNaN(num) && num > 0) {
                                                                onUpdateQty(item, num);
                                                            }
                                                        }}
                                                        onBlur={(e) => {
                                                            const val = e.target.value;
                                                            const num = parseInt(val, 10);
                                                            if (val === "" || isNaN(num) || num <= 0) {
                                                                onUpdateQty(item, item.qty);
                                                            }
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                e.preventDefault();
                                                                e.currentTarget.blur();
                                                                barcodeInputRef.current?.focus();
                                                            }
                                                        }}
                                                        className="w-12 h-6 text-center text-xs font-bold text-slate-800 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        disabled={isProcessing}
                                                    />
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
                                                {item.is_jasa ? (
                                                    <ServicePriceInput
                                                        item={item}
                                                        onUpdatePrice={onUpdatePrice}
                                                        isProcessing={isProcessing}
                                                        className="w-28 h-7 text-right text-xs font-bold text-slate-800 border border-slate-200 rounded-lg outline-none focus-visible:ring-emerald-500 focus-visible:border-emerald-500 px-2 ml-auto"
                                                    />
                                                ) : (
                                                    formatRupiah(item.price)
                                                )}
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
                        </div>

                        {/* Mobile Card List View */}
                        <div className="block sm:hidden space-y-3">
                            {cart.map((item) => (
                                <div
                                    key={item.itemId ?? item.product_uid}
                                    className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-sm flex flex-col gap-3"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="min-w-0 flex-1 pr-2">
                                            <div className="font-bold text-slate-800 text-xs break-words flex items-center gap-2">
                                                {item.name}
                                                {item.is_jasa && (
                                                    <span className="bg-emerald-100 text-emerald-700 text-[9px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider whitespace-nowrap">
                                                        Jasa
                                                    </span>
                                                )}
                                            </div>
                                            {item.barcode && (
                                                <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                                                    Barcode: {item.barcode}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => onRemoveItem(item)}
                                            disabled={isProcessing}
                                            className="text-rose-500 hover:bg-rose-50 p-1.5 rounded transition-colors disabled:opacity-40 cursor-pointer border-none bg-transparent shrink-0"
                                        >
                                            <IconTrash size={16} />
                                        </button>
                                    </div>

                                    <div className="flex justify-between items-center bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                                        <div className="text-[10px] font-bold text-slate-400 flex items-center">
                                            Harga:
                                            {item.is_jasa ? (
                                                <ServicePriceInput
                                                    item={item}
                                                    onUpdatePrice={onUpdatePrice}
                                                    isProcessing={isProcessing}
                                                    className="w-28 ml-2 h-7 text-right text-xs font-bold text-slate-800 border border-slate-200 rounded-md outline-none focus-visible:ring-emerald-500 focus-visible:border-emerald-500 px-2"
                                                />
                                            ) : (
                                                <span className="text-slate-700 font-semibold ml-1">{formatRupiah(item.price)}</span>
                                            )}
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-400">
                                            Total: <span className="text-emerald-600 font-extrabold ml-1">{formatRupiah(item.price * item.qty)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            Jumlah (Qty)
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => onUpdateQty(item, item.qty - 1)}
                                                disabled={isProcessing}
                                                className="w-7 h-7 border border-slate-200 rounded flex items-center justify-center hover:bg-emerald-50 text-emerald-600 font-bold disabled:opacity-40 cursor-pointer"
                                            >
                                                -
                                            </button>
                                            <Input
                                                type="number"
                                                value={item.qty}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === "") return;
                                                    const num = parseInt(val, 10);
                                                    if (!isNaN(num) && num > 0) {
                                                        onUpdateQty(item, num);
                                                    }
                                                }}
                                                onBlur={(e) => {
                                                    const val = e.target.value;
                                                    const num = parseInt(val, 10);
                                                    if (val === "" || isNaN(num) || num <= 0) {
                                                        onUpdateQty(item, item.qty);
                                                    }
                                                }}
                                                className="w-14 h-7 text-center text-xs font-bold text-slate-800 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                disabled={isProcessing}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => onUpdateQty(item, item.qty + 1)}
                                                disabled={isProcessing}
                                                className="w-7 h-7 border border-slate-200 rounded flex items-center justify-center hover:bg-emerald-50 text-emerald-600 font-bold disabled:opacity-40 cursor-pointer"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {isSearchOpen && (
                <ProductSearchDialog
                    open={isSearchOpen}
                    onOpenChange={(open) => {
                        setIsSearchOpen(open);
                        if (!open) {
                            setTimeout(() => barcodeInputRef.current?.focus(), 100);
                        }
                    }}
                    products={products}
                    onAddProduct={onAddProduct}
                    initialSearchQuery={searchQuery}
                />
            )}
        </div>
    );
}

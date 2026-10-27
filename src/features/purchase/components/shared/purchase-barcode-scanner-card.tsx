"use client";

import React from "react";
import { IconBarcode, IconInfoCircle, IconX } from "@tabler/icons-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { BarcodeInput } from "@/components/shared/barcode-input";
import { cn } from "@/lib/utils";
import type { Product } from "@/features/master/products/types";

interface PurchaseBarcodeScannerCardProps {
    id?: string;
    title?: string;
    inputRef: React.RefObject<HTMLInputElement | null>;
    isContinuousScan: boolean;
    onToggleContinuousScan: (checked: boolean) => void;
    onProductFound: (product: Product) => void;
    onProductNotFound: (query: string) => void;
    notFoundQuery: string;
    onClearNotFoundQuery: () => void;
    onOpenCreateDialog: (query: string) => void;
    disabled?: boolean;
    placeholder?: string;
    extraActions?: React.ReactNode;
}

export function PurchaseBarcodeScannerCard({
    id = "purchase-barcode-box",
    title = "Scan Barcode / Cari Produk",
    inputRef,
    isContinuousScan,
    onToggleContinuousScan,
    onProductFound,
    onProductNotFound,
    notFoundQuery,
    onClearNotFoundQuery,
    onOpenCreateDialog,
    disabled = false,
    placeholder,
    extraActions,
}: PurchaseBarcodeScannerCardProps) {
    const switchId = `${id}-scanner-mode-switch`;
    const inputId = `${id}-barcode-input`;

    return (
        <div id={id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-50">
                <div className="flex items-center gap-2.5">
                    <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg border border-emerald-100/40">
                        <IconBarcode size={18} />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-slate-900 leading-none">{title}</h3>
                        <p className="text-[10px] text-slate-400 mt-1">
                            {isContinuousScan
                                ? "Mode Scanner Cepat: kursor otomatis kembali ke scanner setelah scan"
                                : "Mode Edit Langsung: kursor otomatis fokus ke input kuantitas barang"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                    {/* Switch Fitur Scanner */}
                    <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50/80 border border-slate-200/60 shadow-2xs hover:bg-slate-100/60 transition-colors">
                        <label
                            htmlFor={switchId}
                            className="text-[11px] font-semibold text-slate-700 cursor-pointer select-none flex items-center gap-1.5"
                        >
                            <span>Fitur Scanner</span>
                            <span
                                className={cn(
                                    "px-1.5 py-0.5 rounded text-[9px] font-bold tracking-tight uppercase transition-colors",
                                    isContinuousScan
                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                        : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                                )}
                            >
                                {isContinuousScan ? "Aktif" : "Nonaktif"}
                            </span>
                        </label>
                        <Switch
                            id={switchId}
                            size="sm"
                            checked={isContinuousScan}
                            onCheckedChange={onToggleContinuousScan}
                        />
                    </div>

                    {extraActions}
                </div>
            </div>

            <BarcodeInput
                id={inputId}
                ref={inputRef}
                isJasa={false}
                refocusOnFound={isContinuousScan}
                onProductFound={onProductFound}
                onError={(msg) => toast.error(msg)}
                onProductNotFound={onProductNotFound}
                onInputChange={() => {
                    if (notFoundQuery) {
                        onClearNotFoundQuery();
                    }
                }}
                disabled={disabled}
                placeholder={
                    placeholder ||
                    (isContinuousScan
                        ? "Scan barcode berulang kali (mode cepat aktif)..."
                        : "Scan barcode distributor atau masukkan kode produk...")
                }
            />

            {notFoundQuery && (
                <div className="flex items-center justify-between p-3.5 bg-rose-50/50 border border-rose-100 rounded-xl text-rose-900 text-xs">
                    <div className="flex items-center gap-2">
                        <IconInfoCircle size={16} className="text-rose-500 shrink-0" />
                        <span>
                            Produk <strong>&quot;{notFoundQuery}&quot;</strong> tidak ditemukan.
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                            type="button"
                            onClick={() => onOpenCreateDialog(notFoundQuery)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold h-8 px-3 rounded-lg border-none cursor-pointer"
                        >
                            Tambah Produk
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClearNotFoundQuery}
                            className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-rose-100/50 cursor-pointer border-none flex items-center justify-center shrink-0"
                        >
                            <IconX size={16} />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

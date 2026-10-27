"use client";

import { BarcodeInput } from "@/components/shared/barcode-input";
import type { Product } from "@/features/master/products/types";
import { Button } from "@/components/ui/button";
import { IconBarcode, IconLock, IconLockOpen } from "@tabler/icons-react";
import { toast } from "sonner";

export interface MedicineIngredientPickerProps {
    onSelectProduct: (product: Product) => void;
    inputRef?: React.RefObject<HTMLInputElement | null>;
    title?: string;
    description?: string;
    placeholder?: string;
    disabled?: boolean;
    disabledMessage?: string;
    onUnlock?: () => void;
}

export function MedicineIngredientPicker({
    onSelectProduct,
    inputRef,
    title = "Cari / Pindai Bahan Obat",
    description = "Pindai barcode scanner atau ketik nama obat untuk menambahkan bahan ke racikan",
    placeholder = "Pindai barcode obat atau ketik nama obat racikan... (Enter)",
    disabled = false,
    disabledMessage,
    onUnlock,
}: MedicineIngredientPickerProps) {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-3.5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
                        <IconBarcode size={15} />
                    </div>
                    <div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                            {title}
                        </h3>
                        <p className="text-[10px] text-slate-500">
                            {description}
                        </p>
                    </div>
                </div>
                <span className="hidden sm:inline-block text-[9.5px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                    Scanner Aktif
                </span>
            </div>

            <div className="pt-0.5">
                {disabled ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-900/60">
                        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                            <IconLock size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
                            <span className="text-[11px] font-medium leading-relaxed">
                                {disabledMessage || "Formula menggunakan komposisi standar template yang terkunci. Jumlah obat dihitung otomatis dari jumlah kemasan."}
                            </span>
                        </div>
                        {onUnlock && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onUnlock}
                                className="h-7 px-2.5 rounded-lg text-xs font-bold border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 bg-white/80 dark:bg-slate-900 hover:bg-amber-100 dark:hover:bg-amber-950/80 cursor-pointer flex items-center gap-1 shadow-2xs shrink-0 self-end sm:self-auto"
                            >
                                <IconLockOpen size={13} />
                                <span>Kustomisasi Formula</span>
                            </Button>
                        )}
                    </div>
                ) : (
                    <BarcodeInput
                        ref={inputRef}
                        mode="sell"
                        isRawMaterial={false}
                        placeholder={placeholder}
                        onProductFound={(product) => {
                            onSelectProduct(product);
                        }}
                        onError={(msg) => toast.error(msg)}
                        refocusOnFound={true}
                    />
                )}
            </div>
        </div>
    );
}

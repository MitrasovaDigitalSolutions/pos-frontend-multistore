"use client";

import { AppButton } from "@/components/shared/app-button";
import { NumberInput } from "@/components/ui/number-input";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import React, { useState } from "react";

interface OpnameQtyInputProps {
    itemUid: string;
    productUid: string;
    stokFisik: number;
    onUpdateQty: (itemUid: string, qty: number) => void;
    onFocusBarcode?: () => void;
    size?: "sm" | "md";
}

export function OpnameQtyInput({
    itemUid,
    productUid,
    stokFisik,
    onUpdateQty,
    onFocusBarcode,
    size = "sm",
}: OpnameQtyInputProps) {
    const [prevStokFisik, setPrevStokFisik] = useState<number>(stokFisik);
    const [localQty, setLocalQty] = useState<number>(stokFisik);

    // Adjust state during render when prop changes (avoids useEffect cascading renders)
    if (prevStokFisik !== stokFisik) {
        setPrevStokFisik(stokFisik);
        setLocalQty(stokFisik);
    }

    const handleCommit = (qtyToCommit: number) => {
        const validQty = Math.max(0, qtyToCommit);
        if (validQty !== stokFisik) {
            onUpdateQty(itemUid, validQty);
        }
    };

    const handleBlur = () => {
        handleCommit(localQty);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleCommit(localQty);
            (e.target as HTMLInputElement).blur();
            onFocusBarcode?.();
        }
    };

    const handleDecrement = () => {
        const nextQty = Math.max(0, (localQty ?? stokFisik) - 1);
        setLocalQty(nextQty);
        handleCommit(nextQty);
    };

    const handleIncrement = () => {
        const nextQty = (localQty ?? stokFisik) + 1;
        setLocalQty(nextQty);
        handleCommit(nextQty);
    };

    const isSm = size === "sm";

    return (
        <div className="flex items-center justify-center gap-0.5">
            <AppButton
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={handleDecrement}
                className={
                    isSm
                        ? "w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-bold text-xs cursor-pointer"
                        : "w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-sm cursor-pointer"
                }
            >
                <IconMinus size={isSm ? 11 : 13} />
            </AppButton>
            <div className={isSm ? "w-16" : "flex-1 min-w-0"}>
                <NumberInput
                    id={`opname-qty-${productUid}`}
                    value={localQty}
                    onChange={(val) => {
                        setLocalQty(val === null ? 0 : Math.max(0, val));
                    }}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    allowDecimal={false}
                    allowNegative={false}
                    min={0}
                    className={
                        isSm
                            ? "h-7 w-full text-center rounded-md border border-slate-200 p-0 text-xs font-bold font-mono outline-none focus-visible:border-emerald-600 focus-visible:ring-emerald-600/20"
                            : "h-7 w-full text-center rounded-lg border border-slate-200 p-0 text-xs font-bold font-mono outline-none focus-visible:border-emerald-600"
                    }
                />
            </div>
            <AppButton
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={handleIncrement}
                className={
                    isSm
                        ? "w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-bold text-xs cursor-pointer"
                        : "w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-sm cursor-pointer"
                }
            >
                <IconPlus size={isSm ? 11 : 13} />
            </AppButton>
        </div>
    );
}

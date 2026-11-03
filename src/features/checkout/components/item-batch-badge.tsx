"use client";

import type { ProductBatchInfo } from "@/features/master/products/types";
import { allocateFefoBatches, getBatchExpiryMeta } from "../utils/batch-utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { IconAlertTriangle, IconChevronDown, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface ItemBatchBadgeProps {
    batches?: ProductBatchInfo[] | null;
    qty: number;
    className?: string;
}

export function ItemBatchBadge({ batches, qty, className }: ItemBatchBadgeProps) {
    if (!batches || batches.length === 0 || qty <= 0) {
        return null;
    }

    const { allocations, unallocatedQty } = allocateFefoBatches(batches, qty);
    if (allocations.length === 0) {
        return null;
    }

    const primary = allocations[0];
    const primaryExpiry = getBatchExpiryMeta(primary.expiredDate);
    const isMultiBatch = allocations.length > 1;

    // Pilih status terburuk jika mengambil dari beberapa batch sekaligus
    const worstStatus = allocations.reduce<"expired" | "danger" | "warning" | "safe" | "none">(
        (worst, alloc) => {
            const meta = getBatchExpiryMeta(alloc.expiredDate);
            const rank = { expired: 4, danger: 3, warning: 2, safe: 1, none: 0 };
            return rank[meta.status] > rank[worst] ? meta.status : worst;
        },
        primaryExpiry.status
    );

    const pillTone =
        worstStatus === "expired"
            ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/90 dark:border-rose-800/80 hover:bg-rose-100/80"
            : worstStatus === "danger"
                ? "bg-rose-50/80 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border-rose-200/80 dark:border-rose-900/70 hover:bg-rose-100/60"
                : worstStatus === "warning"
                    ? "bg-amber-50/90 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/70 hover:bg-amber-100/60"
                    : "bg-slate-100/80 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:bg-slate-200/60";

    const dotTone =
        worstStatus === "expired" || worstStatus === "danger"
            ? "bg-rose-500"
            : worstStatus === "warning"
                ? "bg-amber-500"
                : "bg-emerald-500";

    return (
        <Popover>
            <PopoverTrigger
                type="button"
                onClick={(e) => e.stopPropagation()}
                title="Klik untuk melihat rincian pengambilan stok batch (FEFO)"
                className={cn(
                    "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[9px] font-mono leading-none transition-colors cursor-pointer select-none",
                    pillTone,
                    className
                )}
            >
                {worstStatus === "expired" ? (
                    <IconX size={9} className="shrink-0 text-rose-600" />
                ) : worstStatus === "danger" ? (
                    <IconAlertTriangle size={9} className="shrink-0 text-rose-500" />
                ) : (
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotTone)} />
                )}

                {!isMultiBatch ? (
                    <span className="truncate max-w-[180px] sm:max-w-[220px]">
                        <strong className="font-bold">{primary.shortBatchNumber}</strong>
                        {primaryExpiry.shortDate && (
                            <span className="opacity-80">
                                {" · "}
                                {primaryExpiry.status === "expired"
                                    ? `Exp (${primaryExpiry.shortDate})`
                                    : primaryExpiry.status === "danger" && primaryExpiry.diffDays !== null
                                        ? `ED ${primaryExpiry.diffDays}hr (${primaryExpiry.shortDate})`
                                        : `ED ${primaryExpiry.shortDate}`}
                            </span>
                        )}
                    </span>
                ) : (
                    <span className="truncate max-w-[190px] sm:max-w-[240px]">
                        <strong className="font-bold">{allocations.length} Batch:</strong>{" "}
                        {allocations.length === 2
                            ? `${allocations[0].shortBatchNumber}(${allocations[0].allocatedQty}) + ${allocations[1].shortBatchNumber}(${allocations[1].allocatedQty})`
                            : `${primary.shortBatchNumber}(${primary.allocatedQty}) +${allocations.length - 1} batch`}
                    </span>
                )}

                <IconChevronDown size={9} className="shrink-0 opacity-50" />
            </PopoverTrigger>

            <PopoverContent
                side="bottom"
                align="start"
                sideOffset={4}
                onClick={(e) => e.stopPropagation()}
                className="w-64 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg"
            >
                <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <p className="text-[11px] font-bold text-slate-800 dark:text-slate-100 leading-tight">
                            Rincian Batch (FEFO)
                        </p>
                        <p className="text-[9px] text-slate-400 leading-tight mt-0.5">
                            Otomatis diambil dari ED terdekat
                        </p>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60">
                        Qty: {qty}
                    </span>
                </div>

                <div className="space-y-1.5">
                    {allocations.map((alloc, index) => {
                        const meta = getBatchExpiryMeta(alloc.expiredDate);
                        const statusBadgeClass =
                            meta.status === "expired" || meta.status === "danger"
                                ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800"
                                : meta.status === "warning"
                                    ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"
                                    : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800";

                        return (
                            <div
                                key={alloc.batchUid}
                                className="p-1.5 rounded-lg bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-[10px]"
                            >
                                <div className="flex items-center justify-between gap-1">
                                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate">
                                        {index + 1}. {alloc.batchNumber}
                                    </span>
                                    <span
                                        className={cn(
                                            "px-1 py-0.2 rounded border text-[8px] font-bold shrink-0",
                                            statusBadgeClass
                                        )}
                                    >
                                        {meta.statusLabel}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-[9px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                                    <span>
                                        Ambil: <strong className="text-slate-700 dark:text-slate-200">{alloc.allocatedQty}</strong> / {alloc.availableStock}
                                    </span>
                                    <span>ED: {meta.formattedDate || "-"}</span>
                                </div>
                            </div>
                        );
                    })}

                    {unallocatedQty > 0 && (
                        <div className="px-2 py-1 rounded-md bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/50 text-[9px] text-amber-700 dark:text-amber-300">
                            {unallocatedQty} item diambil dari stok reguler (tanpa batch).
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}

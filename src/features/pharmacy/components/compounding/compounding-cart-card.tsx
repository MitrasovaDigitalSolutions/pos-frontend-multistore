"use client";

import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconEdit, IconPill, IconTrash } from "@tabler/icons-react";
import type { CompoundedItem } from "../../types";

interface CompoundingCartCardProps {
    item: CompoundedItem;
    onEdit: (uid: string) => void;
    onRemove: (uid: string) => void;
}

export function CompoundingCartCard({
    item,
    onEdit,
    onRemove,
}: CompoundingCartCardProps) {
    const ingredientNames = item.ingredients.map((i) => i.nama_produk).join(", ");

    return (
        <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/90 dark:border-emerald-800/80 rounded-2xl p-3 shadow-2xs space-y-2 transition-all hover:border-emerald-300">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white px-1.5 py-0.5 rounded">
                            <IconPill size={11} />
                            Racikan
                        </span>
                        <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                            {item.nama_racikan}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.2 rounded font-mono">
                            {item.jumlah_kemasan} {item.jenis_racikan}
                        </span>
                    </div>

                    <div className="text-[11px] text-slate-700 dark:text-slate-300 mt-1 font-semibold flex items-center gap-1">
                        <span className="text-slate-400 font-normal">Signa:</span>
                        <span>{item.aturan_pakai}</span>
                    </div>

                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        <span className="font-semibold">Bahan:</span> {ingredientNames}
                    </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(item.uid)}
                        className="h-7 w-7 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60"
                        title="Edit Racikan"
                    >
                        <IconEdit size={14} />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemove(item.uid)}
                        className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                        title="Hapus Racikan"
                    >
                        <IconTrash size={14} />
                    </Button>
                </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-emerald-100 dark:border-emerald-900/40 text-xs">
                <div className="text-[10px] text-slate-400 font-medium">
                    (Bahan + Tuslah + Embalase)
                </div>
                <div className="font-extrabold text-emerald-700 dark:text-emerald-300 tabular-nums">
                    {formatRupiah(item.total_harga)}
                </div>
            </div>
        </div>
    );
}

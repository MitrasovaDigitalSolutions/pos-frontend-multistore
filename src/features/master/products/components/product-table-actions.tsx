import React from "react";
import { DataTableActionButton, DataTableActionDropdown } from "@/components/ui/data-table-actions";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    IconActivity,
    IconArchiveOff,
    IconCalendarTime,
    IconLayersIntersect,
    IconLock,
} from "@tabler/icons-react";
import type { Product } from "../types";

export interface ProductTableActionsRendererProps {
    row: Product;
    isPharmacy: boolean;
    canManualAdjustment: boolean;
    onUnarchive: (product: Product) => void;
    onOpenBatch: (product: Product) => void;
    onOpenUnits: (product: Product) => void;
    onAdjustmentClick?: (product: Product) => void;
}

export function renderProductTableActions({
    row,
    isPharmacy,
    canManualAdjustment,
    onUnarchive,
    onOpenBatch,
    onOpenUnits,
    onAdjustmentClick,
}: ProductTableActionsRendererProps): React.ReactNode {
    if (row.status === "archived") {
        return (
            <DataTableActionButton
                variant="emerald"
                onClick={() => onUnarchive(row)}
                tooltip="Batalkan Hapus (Unarchive)"
                data-action="unarchive"
                className="table-action-unarchive"
            >
                <IconArchiveOff size={16} />
            </DataTableActionButton>
        );
    }

    // If business type is Pharmacy, show More (⋮) dropdown containing Batch, Units, and Stock Adjustment
    if (isPharmacy) {
        return (
            <DataTableActionDropdown
                label="Aksi Produk"
                tooltip="Aksi Lainnya"
                items={[
                    {
                        id: "batch",
                        label: "Batch & Exp Date",
                        description: "Monitoring stok & FEFO",
                        icon: <IconCalendarTime size={15} className="text-sky-600 dark:text-sky-400" />,
                        onClick: () => onOpenBatch(row),
                    },
                    {
                        id: "units",
                        label: "Multi-Satuan Produk",
                        description: "Konversi Box, Strip, Pcs",
                        icon: <IconLayersIntersect size={15} className="text-indigo-600 dark:text-indigo-400" />,
                        onClick: () => onOpenUnits(row),
                        separatorAfter: Boolean(onAdjustmentClick),
                    },
                    ...(onAdjustmentClick
                        ? [
                              {
                                  id: "adjustment",
                                  label: "Penyesuaian Stok",
                                  description: canManualAdjustment
                                      ? "Adjustment stok manual"
                                      : "Dinonaktifkan oleh Pusat",
                                  icon: canManualAdjustment ? (
                                      <IconActivity size={15} />
                                  ) : (
                                      <IconLock size={15} />
                                  ),
                                  disabled: !canManualAdjustment,
                                  onClick: () =>
                                      canManualAdjustment && onAdjustmentClick(row),
                              },
                          ]
                        : []),
                ]}
            />
        );
    }

    // If business type is NOT Pharmacy (retail, confectionery, etc.), render direct Adjust button (original 3-button behavior)
    if (onAdjustmentClick) {
        if (!canManualAdjustment) {
            return (
                <TooltipProvider delayDuration={150}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span tabIndex={0} className="inline-block cursor-not-allowed">
                                <DataTableActionButton
                                    variant="slate"
                                    disabled
                                    tooltip=""
                                    data-action="adjust-stock"
                                    className="cursor-not-allowed opacity-50 text-slate-300"
                                >
                                    <IconLock size={15} />
                                </DataTableActionButton>
                            </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                            Penyesuaian stok di toko cabang dinonaktifkan oleh Pusat.
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        }

        return (
            <DataTableActionButton
                variant="slate"
                onClick={() => onAdjustmentClick(row)}
                tooltip="Penyesuaian Stok (Adjustment Qty)"
                data-action="adjust-stock"
                className="hover:text-emerald-600 hover:bg-emerald-50"
            >
                <IconActivity size={16} />
            </DataTableActionButton>
        );
    }

    return null;
}

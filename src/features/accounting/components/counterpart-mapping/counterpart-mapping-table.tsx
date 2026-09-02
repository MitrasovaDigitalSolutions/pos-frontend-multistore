"use client";

import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
    IconEdit,
    IconTrash,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { DataTable, DataTableActionButton } from "@/components/ui/data-table";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ACCOUNT_TYPE_CONFIG } from "../../constants/counterpart-constants";
import type { ChartOfAccount, ChartOfAccountType, CoaCounterpartMapping } from "../../types";

interface CounterpartMappingTableProps {
    mappings: CoaCounterpartMapping[];
    accounts: ChartOfAccount[];
    editingUid: string | null;
    onEdit: (mapping: CoaCounterpartMapping) => void;
    onDelete: (mapping: CoaCounterpartMapping) => void;
    canManage?: boolean;
}

export function CounterpartMappingTable({
    mappings,
    editingUid,
    onEdit,
    onDelete,
    canManage = true,
}: CounterpartMappingTableProps) {
    const columns = useMemo<ColumnDef<CoaCounterpartMapping>[]>(() => {
        return [
            {
                id: "index",
                header: "#",
                size: 50,
                cell: ({ row }) => (
                    <span className="text-xs font-semibold text-slate-400">
                        {row.index + 1}
                    </span>
                ),
            },
            {
                accessorKey: "coa",
                header: "Akun Utama (CoA)",
                minSize: 220,
                cell: ({ row }) => {
                    const m = row.original;
                    const isBeingEdited = editingUid === m.uid;
                    const mainCoa = m.coa;
                    const typeConfig = mainCoa?.tipe ? ACCOUNT_TYPE_CONFIG[mainCoa.tipe as ChartOfAccountType] : null;

                    return (
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200/80 dark:border-blue-900 shrink-0">
                                {mainCoa?.kode || "N/A"}
                            </span>
                            <TooltipProvider delayDuration={150}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 truncate min-w-0 cursor-default">
                                            {mainCoa?.nama || "Akun tidak ditemukan"}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs max-w-xs font-medium">
                                        {mainCoa?.kode ? `[${mainCoa.kode}] ${mainCoa.nama}` : (mainCoa?.nama || "Akun tidak ditemukan")}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            {isBeingEdited && (
                                <Badge
                                    variant="outline"
                                    className="text-[9px] px-1.5 py-0 font-bold shrink-0 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700"
                                >
                                    Sedang Diedit
                                </Badge>
                            )}
                            {typeConfig && (
                                <Badge
                                    variant="outline"
                                    className={cn("text-[9px] px-1 py-0 font-medium shrink-0 ml-auto hidden sm:inline-flex", typeConfig.bg, typeConfig.text, typeConfig.border)}
                                >
                                    {typeConfig.label}
                                </Badge>
                            )}
                        </div>
                    );
                },
            },
            {
                id: "direction",
                header: "",
                size: 40,
                cell: () => (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[11px]">
                        ⇄
                    </span>
                ),
            },
            {
                accessorKey: "counterpart",
                header: "Akun Lawan (Penyeimbang)",
                minSize: 220,
                cell: ({ row }) => {
                    const m = row.original;
                    const counterpartCoa = m.counterpart;
                    const typeConfig = counterpartCoa?.tipe ? ACCOUNT_TYPE_CONFIG[counterpartCoa.tipe as ChartOfAccountType] : null;

                    return (
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 px-1.5 py-0.5 rounded border border-violet-200/80 dark:border-violet-900 shrink-0">
                                {counterpartCoa?.kode || "N/A"}
                            </span>
                            <TooltipProvider delayDuration={150}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 truncate min-w-0 cursor-default">
                                            {counterpartCoa?.nama || "Akun tidak ditemukan"}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs max-w-xs font-medium">
                                        {counterpartCoa?.kode ? `[${counterpartCoa.kode}] ${counterpartCoa.nama}` : (counterpartCoa?.nama || "Akun tidak ditemukan")}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            {typeConfig && (
                                <Badge
                                    variant="outline"
                                    className={cn("text-[9px] px-1 py-0 font-medium shrink-0 ml-auto hidden sm:inline-flex", typeConfig.bg, typeConfig.text, typeConfig.border)}
                                >
                                    {typeConfig.label}
                                </Badge>
                            )}
                        </div>
                    );
                },
            },
            {
                accessorKey: "keterangan",
                header: "Keterangan",
                minSize: 160,
                cell: ({ row }) => {
                    const m = row.original;
                    return m.keterangan ? (
                        <span className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-1">
                            {m.keterangan}
                        </span>
                    ) : (
                        <span className="text-xs text-slate-300 dark:text-slate-600">-</span>
                    );
                },
            },
            {
                id: "actions",
                header: () => <span className="sr-only">Aksi</span>,
                size: 80,
                cell: ({ row }) => {
                    const m = row.original;
                    if (!canManage) return null;

                    const isBeingEdited = editingUid === m.uid;
                    const isAnotherRowBeingEdited = !!editingUid && !isBeingEdited;

                    return (
                        <div className="flex items-center justify-end gap-1.5">
                            <DataTableActionButton
                                variant={isBeingEdited ? "amber" : "sky"}
                                tooltip={isBeingEdited ? "Sedang Mengedit" : "Edit Mapping"}
                                disabled={isAnotherRowBeingEdited}
                                onClick={() => onEdit(m)}
                            >
                                <IconEdit size={14} />
                            </DataTableActionButton>

                            <DataTableActionButton
                                variant="rose"
                                tooltip="Hapus Mapping"
                                disabled={isBeingEdited || isAnotherRowBeingEdited}
                                onClick={() => onDelete(m)}
                            >
                                <IconTrash size={14} />
                            </DataTableActionButton>
                        </div>
                    );
                },
            },
        ];
    }, [editingUid, canManage, onEdit, onDelete]);

    return (
        <div className="border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
            <DataTable
                columns={columns}
                data={mappings}
                emptyMessage="Tidak ada data mapping lawan akun."
                className="border-none shadow-none"
            />
        </div>
    );
}

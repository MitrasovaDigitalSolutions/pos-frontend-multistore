"use client";

import { useMemo } from "react";
import { type ColumnDef, type Row } from "@tanstack/react-table";
import {
    IconArrowsExchange,
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
    accounts?: ChartOfAccount[];
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
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs">
                        <IconArrowsExchange size={14} />
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

    const renderCardItem = (row: Row<CoaCounterpartMapping>) => {
        const m = row.original;
        const isBeingEdited = editingUid === m.uid;
        const isAnotherRowBeingEdited = !!editingUid && !isBeingEdited;
        const mainCoa = m.coa;
        const counterpartCoa = m.counterpart;
        const mainTypeConfig = mainCoa?.tipe
            ? ACCOUNT_TYPE_CONFIG[mainCoa.tipe as ChartOfAccountType]
            : null;
        const cpTypeConfig = counterpartCoa?.tipe
            ? ACCOUNT_TYPE_CONFIG[counterpartCoa.tipe as ChartOfAccountType]
            : null;

        return (
            <div
                key={m.uid || row.id}
                className={cn(
                    "rounded-xl border transition-all overflow-hidden bg-white dark:bg-slate-900 shadow-2xs",
                    isBeingEdited
                        ? "border-amber-400 dark:border-amber-600 bg-amber-50/20 dark:bg-amber-950/20 ring-1 ring-amber-400/40"
                        : "border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                )}
            >
                {/* Header: No. + Status + Actions */}
                <div className="flex items-center justify-between px-3 py-2 bg-slate-50/80 dark:bg-slate-850/60 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 font-mono">
                            No. {row.index + 1}
                        </span>
                        {isBeingEdited && (
                            <Badge
                                variant="outline"
                                className="text-[9px] px-1.5 py-0 font-bold bg-amber-100/80 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700"
                            >
                                Sedang Diedit
                            </Badge>
                        )}
                    </div>

                    {canManage && (
                        <div className="flex items-center gap-1 shrink-0">
                            <DataTableActionButton
                                variant={isBeingEdited ? "amber" : "sky"}
                                tooltip={isBeingEdited ? "Sedang Mengedit" : "Edit Mapping"}
                                disabled={isAnotherRowBeingEdited}
                                onClick={() => onEdit(m)}
                            >
                                <IconEdit size={13} />
                            </DataTableActionButton>

                            <DataTableActionButton
                                variant="rose"
                                tooltip="Hapus Mapping"
                                disabled={isBeingEdited || isAnotherRowBeingEdited}
                                onClick={() => onDelete(m)}
                            >
                                <IconTrash size={13} />
                            </DataTableActionButton>
                        </div>
                    )}
                </div>

                {/* Account Pair Body */}
                <div className="p-3 space-y-2.5">
                    {/* Akun Utama */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                            <span className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider text-[9px]">
                                Akun Utama (CoA)
                            </span>
                            {mainTypeConfig && (
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "text-[8px] px-1 py-0 font-bold",
                                        mainTypeConfig.bg,
                                        mainTypeConfig.text,
                                        mainTypeConfig.border
                                    )}
                                >
                                    {mainTypeConfig.label}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 px-1.5 py-0.5 rounded border border-blue-200/80 dark:border-blue-900 shrink-0">
                                {mainCoa?.kode || "N/A"}
                            </span>
                            <TooltipProvider delayDuration={150}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate cursor-default">
                                            {mainCoa?.nama || "Akun tidak ditemukan"}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs max-w-xs font-medium">
                                        {mainCoa?.kode ? `[${mainCoa.kode}] ${mainCoa.nama}` : (mainCoa?.nama || "Akun tidak ditemukan")}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>

                    {/* Centered Relation Divider with Arrows */}
                    <div className="relative flex items-center justify-center my-1 py-1">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200/80 dark:border-slate-800" />
                        </div>
                        <div className="relative flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-2xs text-slate-600 dark:text-slate-300">
                            <IconArrowsExchange size={14} className="text-indigo-600 dark:text-indigo-400" />
                            <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 tracking-wide">
                                Lawan Akun
                            </span>
                        </div>
                    </div>

                    {/* Akun Lawan */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                            <span className="font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider text-[9px]">
                                Akun Lawan (Penyeimbang)
                            </span>
                            {cpTypeConfig && (
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "text-[8px] px-1 py-0 font-bold",
                                        cpTypeConfig.bg,
                                        cpTypeConfig.text,
                                        cpTypeConfig.border
                                    )}
                                >
                                    {cpTypeConfig.label}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-xs font-bold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/70 px-1.5 py-0.5 rounded border border-violet-200/80 dark:border-violet-900 shrink-0">
                                {counterpartCoa?.kode || "N/A"}
                            </span>
                            <TooltipProvider delayDuration={150}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate cursor-default">
                                            {counterpartCoa?.nama || "Akun tidak ditemukan"}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs max-w-xs font-medium">
                                        {counterpartCoa?.kode ? `[${counterpartCoa.kode}] ${counterpartCoa.nama}` : (counterpartCoa?.nama || "Akun tidak ditemukan")}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>

                    {/* Footer Keterangan if exists */}
                    {m.keterangan && (
                        <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-800 flex items-start gap-1.5 text-slate-500 dark:text-slate-400">
                            <span className="text-[10px] font-bold text-slate-400 shrink-0">Ket:</span>
                            <span className="text-[11px] italic leading-tight">
                                {m.keterangan}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
            <DataTable
                columns={columns}
                data={mappings}
                emptyMessage="Tidak ada data mapping lawan akun."
                className="border-none shadow-none"
                renderCardItem={renderCardItem}
                gridClassName="grid-cols-1 sm:grid-cols-2 gap-2.5 p-2.5 sm:p-3.5"
            />
        </div>
    );
}

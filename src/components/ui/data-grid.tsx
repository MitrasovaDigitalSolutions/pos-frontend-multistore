"use client";

import * as React from "react";
import { flexRender, Row, Table as TanstackTable } from "@tanstack/react-table";
import { cn } from "@/lib/utils";

interface DataGridProps<TData> {
    table: TanstackTable<TData>;
    isLoading?: boolean;
    emptyMessage?: string;
    gridClassName?: string;
    renderCardItem?: (row: Row<TData>) => React.ReactNode;
}

export function DataGrid<TData>({
    table,
    isLoading = false,
    emptyMessage = "Tidak ada data ditemukan.",
    gridClassName,
    renderCardItem,
}: DataGridProps<TData>) {
    const { rows } = table.getRowModel();
    const visibleColumns = table.getVisibleFlatColumns();

    // Filter out internal/action columns for body fields
    const contentColumns = visibleColumns.filter(
        (col) => col.id !== "rowNumber" && col.id !== "actions"
    );

    const titleColumn = contentColumns[0];
    const detailColumns = contentColumns.slice(1);
    const actionColumn = visibleColumns.find((col) => col.id === "actions");

    if (isLoading) {
        return (
            <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 p-3.5", gridClassName)}>
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-3 animate-pulse"
                    >
                        <div className="flex justify-between items-center">
                            <div className="h-4 bg-slate-200 rounded-md w-1/2" />
                            <div className="h-6 w-16 bg-slate-100 rounded-lg" />
                        </div>
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                            <div className="h-3 bg-slate-100 rounded-md w-3/4" />
                            <div className="h-3 bg-slate-100 rounded-md w-2/3" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (rows.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400 text-xs font-medium">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 p-3.5", gridClassName)}>
            {rows.map((row) => {
                if (renderCardItem) {
                    return <React.Fragment key={row.id}>{renderCardItem(row)}</React.Fragment>;
                }

                const visibleCells = row.getVisibleCells();
                const titleCell = titleColumn ? visibleCells.find((c) => c.column.id === titleColumn.id) : null;
                const actionCell = actionColumn ? visibleCells.find((c) => c.column.id === actionColumn.id) : null;

                return (
                    <div
                        key={row.id}
                        className="bg-white dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-2xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between gap-3 group"
                    >
                        {/* Header Row: Main Identifier & Action Buttons */}
                        <div className="flex justify-between items-start gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
                            <div className="min-w-0 flex-1">
                                {titleCell ? (
                                    <div className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-sm leading-snug break-words">
                                        {flexRender(titleCell.column.columnDef.cell, titleCell.getContext())}
                                    </div>
                                ) : (
                                    <span className="text-xs font-bold text-slate-500">Item #{row.index + 1}</span>
                                )}
                            </div>

                            {actionCell && (
                                <div className="shrink-0 flex items-center gap-1">
                                    {flexRender(actionCell.column.columnDef.cell, actionCell.getContext())}
                                </div>
                            )}
                        </div>

                        {/* Card Body: Details Grid */}
                        <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-xs">
                            {detailColumns.map((col) => {
                                const cell = visibleCells.find((c) => c.column.id === col.id);
                                if (!cell) return null;

                                const headerText =
                                    typeof col.columnDef.header === "string"
                                        ? col.columnDef.header
                                        : col.id;

                                return (
                                    <div key={col.id} className="flex flex-col gap-0.5 min-w-0 bg-slate-50/50 dark:bg-slate-900/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800/50">
                                        <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate">
                                            {headerText}
                                        </span>
                                        <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs truncate">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

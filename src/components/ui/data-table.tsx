/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/incompatible-library */
import { Input } from "@/components/ui/input";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { IconCheck, IconEdit, IconTrash } from "@tabler/icons-react";
import { DataTableActionButton } from "./data-table-actions";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Eye, InfoIcon, LayoutGrid, LayoutList, Search } from "lucide-react";
import * as React from "react";
import { useDeviceResponsive } from "@/hooks/use-device";
import { DataGrid } from "@/components/ui/data-grid";
import { Row } from "@tanstack/react-table";

import "@tanstack/react-table";

declare module "@tanstack/react-table" {
    interface ColumnMeta<TData, TValue> {
        headerClassName?: string;
        cellClassName?: string;
    }
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    isLoading?: boolean;
    isFetching?: boolean;
    emptyMessage?: string;
    className?: string;
    tableClassName?: string;

    // Responsive View Props
    defaultViewMode?: "table" | "card";
    showViewToggle?: boolean;
    renderCardItem?: (row: Row<TData>) => React.ReactNode;
    gridClassName?: string;

    // Virtualization Props
    virtualize?: boolean;
    estimateRowHeight?: number;
    maxHeight?: string;

    // Pagination Props
    paginationMode?: "client" | "server";
    clientPagination?: boolean;
    page?: number;
    perPage?: number;
    onPageChange?: (page: number) => void;
    onPerPageChange?: (perPage: number) => void;
    meta?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    entityName?: string;

    extraToolbarActions?: React.ReactNode;

    // Default / Server Sorting Props
    defaultSorting?: { id: string; desc: boolean }[];
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    onSortChange?: (sortBy: string | undefined, sortOrder: "asc" | "desc" | undefined) => void;
    enableSortingRemoval?: boolean;

    // Row Actions Props
    onEdit?: (row: TData) => void;
    onDelete?: (row: TData) => void;
    onView?: (row: TData) => void;
    onCheck?: (row: TData) => void;
    hideEdit?: boolean | ((row: TData) => boolean);
    disableEdit?: boolean | ((row: TData) => boolean);
    hideDelete?: boolean | ((row: TData) => boolean);
    disableDelete?: boolean | ((row: TData) => boolean);
    hideView?: boolean | ((row: TData) => boolean);
    disableView?: boolean | ((row: TData) => boolean);
    hideCheck?: boolean | ((row: TData) => boolean);
    disableCheck?: boolean | ((row: TData) => boolean);
    extraActions?: (row: TData) => React.ReactNode;
    getRowClassName?: (row: TData) => string;
    getRowMotionProps?: (row: TData) => React.ComponentProps<typeof motion.tr> | undefined;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    isLoading = false,
    isFetching = false,
    emptyMessage = "Tidak ada data ditemukan.",
    className,
    tableClassName,
    defaultViewMode,
    showViewToggle = true,
    renderCardItem,
    gridClassName,
    virtualize = true,
    estimateRowHeight = 44,
    maxHeight = "450px",
    page = 1,
    perPage,
    onPageChange,
    onPerPageChange,
    meta,
    entityName = "data",
    extraToolbarActions,
    clientPagination = false,
    paginationMode,

    // Default / Server Sorting Props
    defaultSorting,
    sortBy,
    sortOrder,
    onSortChange,
    enableSortingRemoval = true,

    // Row Actions Props destructured
    onEdit,
    onDelete,
    onView,
    onCheck,
    hideEdit,
    disableEdit,
    hideDelete,
    disableDelete,
    hideView,
    disableView,
    hideCheck,
    disableCheck,
    extraActions,
    getRowClassName,
    getRowMotionProps,
}: DataTableProps<TData, TValue>) {
    const { isMobile } = useDeviceResponsive();
    const [viewMode, setViewMode] = React.useState<"table" | "card">(
        defaultViewMode ?? (isMobile ? "card" : "table")
    );

    React.useEffect(() => {
        if (!defaultViewMode) {
            setViewMode(isMobile ? "card" : "table");
        }
    }, [isMobile, defaultViewMode]);

    const [localPage, setLocalPage] = React.useState(1);
    const [localPerPage, setLocalPerPage] = React.useState(perPage ?? 10);

    const isClientPagination = paginationMode === "client" || clientPagination;

    React.useEffect(() => {
        if (isClientPagination) {
            setLocalPage(1);
        }
    }, [data.length, isClientPagination]);

    const currentPageVal = onPageChange ? page : localPage;
    const perPageVal = onPerPageChange ? (perPage ?? 10) : localPerPage;

    const [localSorting, setLocalSorting] = React.useState<SortingState>(defaultSorting ?? []);

    const sorting = React.useMemo<SortingState>(() => {
        if (onSortChange) {
            if (!sortBy) return [];
            return [{ id: sortBy, desc: sortOrder === "desc" }];
        }
        return localSorting;
    }, [onSortChange, sortBy, sortOrder, localSorting]);

    const handleSortingChange = (updater: React.SetStateAction<SortingState>) => {
        if (onSortChange) {
            const nextSorting = typeof updater === "function" ? updater(sorting) : updater;
            if (nextSorting.length > 0) {
                const firstSort = nextSorting[0];
                onSortChange(firstSort.id, firstSort.desc ? "desc" : "asc");
            } else {
                onSortChange(undefined, undefined);
            }
        } else {
            setLocalSorting(updater);
        }
    };

    const sortedData = React.useMemo(() => {
        if (onSortChange || sorting.length === 0) return data;

        const sorted = [...data];
        const sortInfo = sorting[0];
        const isDesc = sortInfo.desc;

        sorted.sort((a, b) => {
            const getVal = (item: unknown, path: string): unknown => {
                return path.split('.').reduce((obj: unknown, p) => {
                    if (obj && typeof obj === 'object') {
                        return (obj as Record<string, unknown>)[p];
                    }
                    return undefined;
                }, item);
            };

            let aVal = getVal(a, sortInfo.id);
            let bVal = getVal(b, sortInfo.id);

            if (typeof aVal === 'string') aVal = aVal.toLowerCase();
            if (typeof bVal === 'string') bVal = bVal.toLowerCase();

            if (aVal === undefined || aVal === null) return isDesc ? -1 : 1;
            if (bVal === undefined || bVal === null) return isDesc ? 1 : -1;

            if (aVal < bVal) return isDesc ? 1 : -1;
            if (aVal > bVal) return isDesc ? -1 : 1;
            return 0;
        });

        return sorted;
    }, [data, sorting, onSortChange]);

    const paginatedData = React.useMemo(() => {
        if (!isClientPagination) return sortedData;
        const start = (currentPageVal - 1) * perPageVal;
        return sortedData.slice(start, start + perPageVal);
    }, [sortedData, isClientPagination, currentPageVal, perPageVal]);

    const computedMeta = React.useMemo(() => {
        if (meta) return meta;
        if (isClientPagination) {
            return {
                current_page: currentPageVal,
                last_page: Math.ceil(data.length / perPageVal),
                per_page: perPageVal,
                total: data.length,
            };
        }
        return undefined;
    }, [meta, isClientPagination, currentPageVal, perPageVal, data.length]);

    const handlePageChange = (p: number) => {
        if (onPageChange) {
            onPageChange(p);
        } else {
            setLocalPage(p);
        }
    };

    const handlePerPageChange = (pp: number) => {
        if (onPerPageChange) {
            onPerPageChange(pp);
        } else {
            setLocalPerPage(pp);
            setLocalPage(1);
        }
    };


    // Dynamically build column list based on whether actions are provided
    const tableColumns = React.useMemo(() => {
        const startIndex = (currentPageVal - 1) * (perPageVal || 0) + 1;
        const noColumn: ColumnDef<TData, unknown> = {
            id: "rowNumber",
            header: "No.",
            enableSorting: false,
            size: 48,
            meta: {
                headerClassName: "text-center w-12",
                cellClassName: "text-center text-slate-500 font-medium text-xs font-mono",
            },
            cell: ({ row, table }) => {
                const sortedIndex = table.getRowModel().rows.findIndex((r) => r.id === row.id);
                return startIndex + (sortedIndex >= 0 ? sortedIndex : 0);
            },
        };

        const baseCols = [noColumn, ...columns];

        const hasActions = !!(onEdit || onDelete || onView || onCheck || extraActions);
        if (!hasActions) return baseCols;

        const actionColumn: ColumnDef<TData, unknown> = {
            id: "actions",
            header: "Aksi",
            enableSorting: false,
            size: 120,
            meta: {
                headerClassName: "text-center w-28 sticky right-0 top-0 bg-slate-50 z-30 shadow-[-1px_0_0_0_rgba(241,245,249,1)] border-l border-slate-100",
                cellClassName: "text-center sticky right-0 bg-white dark:bg-slate-900 [.animate-liquid-fast-row_&]:bg-inherit group-hover:bg-slate-50 [.animate-liquid-fast-row_&]:group-hover:bg-black/[0.03] z-10 shadow-[-1px_0_0_0_rgba(241,245,249,1)] border-l border-slate-100 transition-colors",
            },
            cell: ({ row }) => {
                const item = row.original;
                const isEditHidden = typeof hideEdit === "function" ? hideEdit(item) : !!hideEdit;
                const isDeleteHidden = typeof hideDelete === "function" ? hideDelete(item) : !!hideDelete;
                const isViewHidden = typeof hideView === "function" ? hideView(item) : !!hideView;
                const isCheckHidden = typeof hideCheck === "function" ? hideCheck(item) : !!hideCheck;

                const isEditDisabled = typeof disableEdit === "function" ? disableEdit(item) : !!disableEdit;
                const isDeleteDisabled = typeof disableDelete === "function" ? disableDelete(item) : !!disableDelete;
                const isViewDisabled = typeof disableView === "function" ? disableView(item) : !!disableView;
                const isCheckDisabled = typeof disableCheck === "function" ? disableCheck(item) : !!disableCheck;

                return (
                    <div className="flex justify-center gap-1.5 items-center">
                        {onView && !isViewHidden && (
                            <DataTableActionButton
                                variant="emerald"
                                onClick={() => onView(item)}
                                disabled={isViewDisabled}
                                tooltip="Lihat Detail"
                            >
                                <InfoIcon size={16} />
                            </DataTableActionButton>
                        )}
                        {onEdit && !isEditHidden && (
                            <DataTableActionButton
                                variant="amber"
                                onClick={() => onEdit(item)}
                                disabled={isEditDisabled}
                                tooltip="Ubah"
                            >
                                <IconEdit size={16} />
                            </DataTableActionButton>
                        )}
                        {onCheck && !isCheckHidden && (
                            <DataTableActionButton
                                variant="emerald"
                                onClick={() => onCheck(item)}
                                disabled={isCheckDisabled}
                                tooltip="Finalisasi"
                            >
                                <IconCheck size={16} />
                            </DataTableActionButton>
                        )}
                        {onDelete && !isDeleteHidden && (
                            <DataTableActionButton
                                variant="rose"
                                onClick={() => onDelete(item)}
                                disabled={isDeleteDisabled}
                                tooltip="Hapus"
                            >
                                <IconTrash size={16} />
                            </DataTableActionButton>
                        )}
                        {extraActions?.(item)}
                    </div>
                );
            },
        };

        return [...baseCols, actionColumn];
    }, [
        columns,
        currentPageVal,
        perPageVal,
        onEdit,
        onDelete,
        onView,
        onCheck,
        hideEdit,
        disableEdit,
        hideDelete,
        disableDelete,
        hideView,
        disableView,
        hideCheck,
        disableCheck,
        extraActions,
    ]);

    const table = useReactTable({
        data: paginatedData,
        columns: tableColumns,
        state: {
            sorting,
        },
        getRowId: (row: TData, index: number) => {
            if (row && typeof row === "object" && "uid" in row && row.uid) {
                return String(row.uid);
            }
            if (row && typeof row === "object" && "id" in row && row.id) {
                return String(row.id);
            }
            return String(index);
        },
        onSortingChange: handleSortingChange,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualSorting: !!onSortChange,
        enableSortingRemoval,
    });

    const parentRef = React.useRef<HTMLDivElement>(null);
    const { rows } = table.getRowModel();

    // Initialize Row Virtualizer
    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => estimateRowHeight,
        overscan: 5,
        enabled: virtualize,
    });

    const virtualItems = rowVirtualizer.getVirtualItems();

    // Calculate virtual padding top and bottom
    const [paddingTop, paddingBottom] =
        virtualize && virtualItems.length > 0
            ? [
                Math.max(0, virtualItems[0].start),
                Math.max(
                    0,
                    rowVirtualizer.getTotalSize() -
                    virtualItems[virtualItems.length - 1].end,
                ),
            ]
            : [0, 0];

    // Render pagination numbers list
    const renderPaginationItems = () => {
        const metaToUse = computedMeta;
        if (!metaToUse) return null;

        const pageNumbers: (number | string)[] = [];
        const maxVisiblePages = 5;

        if (metaToUse.last_page <= maxVisiblePages) {
            for (let i = 1; i <= metaToUse.last_page; i++) {
                pageNumbers.push(i);
            }
        } else {
            const startPage = Math.max(1, currentPageVal - 1);
            const endPage = Math.min(metaToUse.last_page, currentPageVal + 1);

            if (startPage > 1) {
                pageNumbers.push(1);
                if (startPage > 2) pageNumbers.push("ellipsis-start");
            }

            for (let i = startPage; i <= endPage; i++) {
                if (i !== 1 && i !== metaToUse.last_page) {
                    pageNumbers.push(i);
                }
            }

            if (endPage < metaToUse.last_page) {
                if (endPage < metaToUse.last_page - 1)
                    pageNumbers.push("ellipsis-end");
                pageNumbers.push(metaToUse.last_page);
            }
        }

        return pageNumbers.map((p, idx) => {
            if (typeof p === "string") {
                return (
                    <PaginationItem key={`${p}-${idx}`}>
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }
            return (
                <PaginationItem key={p}>
                    <PaginationLink
                        isActive={p === currentPageVal}
                        onClick={() => handlePageChange(p)}
                    >
                        {p}
                    </PaginationLink>
                </PaginationItem>
            );
        });
    };

    const hasTopBar = extraToolbarActions !== undefined || showViewToggle !== false;

    return (
        <div className="relative border border-slate-100 rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col">
            {/* Subtle loader bar at the top of the table container for background updates */}
            {isFetching && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-50/50 overflow-hidden z-40">
                    <div className="h-full bg-emerald-500/80 animate-shimmer-loading w-[35%] rounded-full" />
                </div>
            )}

            {/* Internal Search, Filter & View Toggle controls bar */}
            {hasTopBar && (
                <div className="flex justify-between items-center gap-3 p-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/20">
                    <div className="flex items-center gap-2 flex-wrap">
                        {extraToolbarActions}
                    </div>

                    {showViewToggle !== false && (
                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shrink-0 ml-auto">
                            <button
                                type="button"
                                onClick={() => setViewMode("table")}
                                className={cn(
                                    "p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
                                    viewMode === "table"
                                        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-extrabold"
                                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                                )}
                                title="Tampilan Tabel"
                            >
                                <LayoutList size={15} />
                                <span className="hidden xs:inline text-[11px]">Tabel</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode("card")}
                                className={cn(
                                    "p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
                                    viewMode === "card"
                                        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-extrabold"
                                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                                )}
                                title="Tampilan Kartu (Grid)"
                            >
                                <LayoutGrid size={15} />
                                <span className="hidden xs:inline text-[11px]">Kartu</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Viewport: Card Grid or Table */}
            {viewMode === "card" ? (
                <DataGrid
                    table={table}
                    isLoading={isLoading}
                    emptyMessage={emptyMessage}
                    gridClassName={gridClassName}
                    renderCardItem={renderCardItem}
                />
            ) : (
                <div
                    ref={parentRef}
                    className={cn(
                        "w-full overflow-auto max-h-112.5 [&_[data-slot=table-container]]:overflow-visible",
                        virtualize &&
                        "scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent",
                        className,
                    )}
                    style={virtualize ? { maxHeight } : undefined}
                >
                    <Table className={cn("w-full border-collapse relative", tableClassName)}>
                        <TableHeader className="bg-slate-50 sticky top-0 z-20 shadow-[0_1px_0_0_rgba(241,245,249,1)]">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow
                                    key={headerGroup.id}
                                    className="hover:bg-transparent border-b border-slate-100 bg-slate-50"
                                >
                                    {headerGroup.headers.map((header) => {
                                        const isSortable =
                                            header.column.getCanSort();
                                        const sortDirection =
                                            header.column.getIsSorted();

                                        return (
                                            <TableHead
                                                key={header.id}
                                                className={cn(
                                                    "text-[10px] font-bold text-slate-500 py-3 uppercase tracking-wider bg-slate-50",
                                                    header.column.columnDef.meta
                                                        ?.headerClassName,
                                                )}
                                                style={{
                                                    width: header.column.columnDef.size,
                                                    minWidth: header.column.columnDef.size,
                                                    maxWidth: header.column.columnDef.size,
                                                }}
                                            >
                                                {header.isPlaceholder ? null : (
                                                    <div
                                                        className={cn(
                                                            "flex items-center gap-1.5",
                                                            header.column.columnDef.meta?.headerClassName?.includes("text-center") && "justify-center",
                                                            header.column.columnDef.meta?.headerClassName?.includes("text-right") && "justify-end",
                                                            isSortable &&
                                                            "cursor-pointer select-none hover:text-slate-700 transition-colors",
                                                        )}
                                                        onClick={
                                                            isSortable
                                                                ? header.column.getToggleSortingHandler()
                                                                : undefined
                                                        }
                                                    >
                                                        <span>
                                                            {flexRender(
                                                                header.column
                                                                    .columnDef
                                                                    .header,
                                                                header.getContext(),
                                                            )}
                                                        </span>
                                                        {isSortable && (
                                                            <span className="shrink-0 text-slate-400">
                                                                {sortDirection ===
                                                                    "asc" ? (
                                                                    <ArrowUp className="h-3 w-3 text-emerald-600 font-bold" />
                                                                ) : sortDirection ===
                                                                    "desc" ? (
                                                                    <ArrowDown className="h-3 w-3 text-emerald-600 font-bold" />
                                                                ) : (
                                                                    <ArrowUpDown className="h-3 w-3 opacity-40 hover:opacity-100" />
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody className="divide-y divide-slate-100">
                            {isLoading ? (
                                // Skeletal row loading animation
                                Array.from({
                                    length: Math.min(perPage || 5, 5),
                                }).map((_, rowIndex) => (
                                    <TableRow
                                        key={rowIndex}
                                        className="border-b border-slate-100 group"
                                    >
                                        {tableColumns.map((col, colIndex) => (
                                            <TableCell
                                                key={colIndex}
                                                className={cn(
                                                    "py-4 px-4",
                                                    col.meta?.cellClassName
                                                )}
                                                style={{
                                                    width: col.size,
                                                    minWidth: col.size,
                                                }}
                                            >
                                                <div className="h-4 bg-slate-100/80 animate-pulse rounded-lg w-2/3" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : rows.length === 0 ? (
                                // Empty State
                                <TableRow>
                                    <TableCell
                                        colSpan={tableColumns.length}
                                        className="text-center py-12 text-slate-400 text-xs font-medium"
                                    >
                                        {emptyMessage}
                                    </TableCell>
                                </TableRow>
                            ) : virtualize ? (
                                // Virtualized table rows
                                <>
                                    {paddingTop > 0 && (
                                        <tr style={{ height: `${paddingTop}px` }}>
                                            <td
                                                colSpan={tableColumns.length}
                                                style={{ padding: 0 }}
                                            />
                                        </tr>
                                    )}
                                    {virtualItems.map((virtualRow) => {
                                        const row = rows[virtualRow.index];
                                        const motionProps = getRowMotionProps?.(row.original);
                                        return (
                                            <motion.tr
                                                key={row.id}
                                                data-index={virtualRow.index}
                                                ref={rowVirtualizer.measureElement}
                                                className={cn(
                                                    "hover:bg-slate-100/70 border-b border-slate-100 transition-colors group",
                                                    isFetching && "opacity-75",
                                                    getRowClassName?.(row.original)
                                                )}
                                                {...motionProps}
                                            >
                                                {row
                                                    .getVisibleCells()
                                                    .map((cell) => (
                                                        <TableCell
                                                            key={cell.id}
                                                            className={cn(
                                                                "py-3.5 px-4 text-xs font-medium text-slate-700",
                                                                cell.column
                                                                    .columnDef.meta
                                                                    ?.cellClassName,
                                                            )}
                                                            style={{
                                                                width: cell.column.columnDef.size,
                                                                minWidth: cell.column.columnDef.size,
                                                                maxWidth: cell.column.columnDef.size,
                                                            }}
                                                        >
                                                            {flexRender(
                                                                cell.column
                                                                    .columnDef.cell,
                                                                cell.getContext(),
                                                            )}
                                                        </TableCell>
                                                    ))}
                                            </motion.tr>
                                        );
                                    })}
                                    {paddingBottom > 0 && (
                                        <tr
                                            style={{ height: `${paddingBottom}px` }}
                                        >
                                            <td
                                                colSpan={tableColumns.length}
                                                style={{ padding: 0 }}
                                            />
                                        </tr>
                                    )}
                                </>
                            ) : (
                                // Standard non-virtualized rows
                                rows.map((row) => {
                                    const motionProps = getRowMotionProps?.(row.original);
                                    return (
                                        <motion.tr
                                            key={row.id}
                                            className={cn(
                                                "hover:bg-slate-100/70 border-b border-slate-100 transition-colors group",
                                                isFetching && "opacity-75",
                                                getRowClassName?.(row.original)
                                            )}
                                            {...motionProps}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell
                                                    key={cell.id}
                                                    className={cn(
                                                        "py-3.5 px-4 text-xs font-medium text-slate-700",
                                                        cell.column.columnDef.meta
                                                            ?.cellClassName,
                                                    )}
                                                    style={{
                                                        width: cell.column.columnDef.size,
                                                        minWidth: cell.column.columnDef.size,
                                                        maxWidth: cell.column.columnDef.size,
                                                    }}
                                                >
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext(),
                                                    )}
                                                </TableCell>
                                            ))}
                                        </motion.tr>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
            {/* Pagination Controls */}
            {computedMeta && (() => {
                const startItem = computedMeta.total > 0 ? (computedMeta.current_page - 1) * computedMeta.per_page + 1 : 0;
                const endItem = Math.min(computedMeta.current_page * computedMeta.per_page, computedMeta.total);
                const isSinglePage = computedMeta.total <= computedMeta.per_page || computedMeta.last_page <= 1;

                const renderRangeInfo = (isMobile = false) => {
                    if (computedMeta.total <= 0) return `Tidak ada ${entityName}`;
                    if (startItem === 1 && endItem === computedMeta.total) {
                        return (
                            <>
                                Total <span className="text-slate-900 dark:text-slate-100 font-extrabold">{computedMeta.total}</span> {entityName}
                            </>
                        );
                    }
                    if (startItem === endItem) {
                        return (
                            <>
                                {isMobile ? "Item ke-" : "Menampilkan item ke-"}
                                <strong className="text-slate-900 dark:text-slate-100 font-extrabold">{startItem}</strong> dari total <strong className="text-slate-900 dark:text-slate-100 font-extrabold">{computedMeta.total}</strong> {entityName}
                            </>
                        );
                    }
                    return (
                        <>
                            {isMobile ? "" : "Menampilkan "}
                            <strong className="text-slate-900 dark:text-slate-100 font-extrabold">{startItem}–{endItem}</strong> dari total <strong className="text-slate-900 dark:text-slate-100 font-extrabold">{computedMeta.total}</strong> {entityName}
                        </>
                    );
                };

                const renderMobilePaginationItems = () => {
                    const totalPages = computedMeta.last_page;
                    const current = currentPageVal;

                    let start = Math.max(1, current - 1);
                    let end = start + 2;

                    if (end > totalPages) {
                        end = totalPages;
                        start = Math.max(1, end - 2);
                    }

                    const pages = [];
                    for (let i = start; i <= end; i++) {
                        pages.push(i);
                    }

                    return pages.map((page) => (
                        <button
                            key={page}
                            type="button"
                            onClick={() => handlePageChange(page)}
                            className={`w-7 h-7 rounded-lg border text-[11px] font-extrabold flex items-center justify-center transition-all shadow-2xs cursor-pointer ${page === current
                                ? "border-emerald-600 bg-emerald-600 text-white shadow-emerald-500/20"
                                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                                }`}
                        >
                            {page}
                        </button>
                    ));
                };

                return (
                    <div className="border-t border-slate-100 dark:border-slate-800/80 p-3 sm:p-4 bg-slate-50/60 dark:bg-slate-900/40 rounded-b-2xl">
                        {/* Desktop Layout */}
                        <div className="hidden sm:flex justify-between items-center text-xs">
                            {/* Clear Bahasa Indonesia Range Description */}
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                <span>{renderRangeInfo(false)}</span>
                            </div>

                            <div className="flex items-center gap-4">
                                {(onPerPageChange || isClientPagination) && perPageVal !== undefined && (
                                    <div className="flex items-center gap-1.5 text-slate-500 text-xs shrink-0">
                                        <span className="font-semibold text-slate-500 dark:text-slate-400">Tampilkan:</span>
                                        <Select
                                            key={perPageVal}
                                            onValueChange={(value) => handlePerPageChange(Number(value))}
                                            defaultValue={perPageVal.toString()}
                                        >
                                            <SelectTrigger className="h-8 w-24 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-600 rounded-xl bg-white dark:bg-slate-950 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-2xs">
                                                <SelectValue placeholder="10 / hal" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[5, 10, 20, 50, 100].map((option) => (
                                                    <SelectItem key={option} value={option.toString()}>
                                                        {option} / hal
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {!isSinglePage && (
                                    <Pagination className="w-auto mx-0">
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    onClick={() => handlePageChange(currentPageVal - 1)}
                                                    disabled={currentPageVal === 1}
                                                />
                                            </PaginationItem>
                                            {renderPaginationItems()}
                                            <PaginationItem>
                                                <PaginationNext
                                                    onClick={() => handlePageChange(currentPageVal + 1)}
                                                    disabled={currentPageVal === computedMeta.last_page}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                )}
                            </div>
                        </div>

                        {/* Mobile Layout */}
                        <div className="flex sm:hidden flex-col gap-2 text-xs">
                            {/* Baris 1: Deskripsi Jelas Bahasa Indonesia & Select Per Halaman */}
                            <div className="flex items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                                <div className="flex items-center gap-1.5 min-w-0 truncate">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                    <span className="truncate">{renderRangeInfo(true)}</span>
                                </div>

                                {(onPerPageChange || isClientPagination) && perPageVal !== undefined && (
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Select
                                            key={perPageVal}
                                            onValueChange={(value) => handlePerPageChange(Number(value))}
                                            defaultValue={perPageVal.toString()}
                                        >
                                            <SelectTrigger className="h-6.5 w-20 border-slate-200/90 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-[10px] font-bold px-1.5">
                                                <SelectValue placeholder="10 / hal" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[5, 10, 20, 50, 100].map((option) => (
                                                    <SelectItem key={option} value={option.toString()}>
                                                        {option} / hal
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>

                            {/* Baris 2: Navigasi Stepper Mobile dengan Maksimal 3 Bullet Angka */}
                            {!isSinglePage && (
                                <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800/60">
                                    <button
                                        type="button"
                                        onClick={() => handlePageChange(currentPageVal - 1)}
                                        disabled={currentPageVal === 1}
                                        className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold text-[10px] sm:text-[11px] disabled:opacity-30 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer flex items-center gap-0.5 shadow-2xs"
                                    >
                                        <ChevronLeft size={12} />
                                        <span>Sebelumnya</span>
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {renderMobilePaginationItems()}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handlePageChange(currentPageVal + 1)}
                                        disabled={currentPageVal === computedMeta.last_page}
                                        className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold text-[10px] sm:text-[11px] disabled:opacity-30 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer flex items-center gap-0.5 shadow-2xs"
                                    >
                                        <span>Selanjutnya</span>
                                        <ChevronRight size={12} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}


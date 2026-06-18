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
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowDown, ArrowUp, ArrowUpDown, InfoIcon, Search } from "lucide-react";
import * as React from "react";

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

    // Virtualization Props
    virtualize?: boolean;
    estimateRowHeight?: number;
    maxHeight?: string;

    // Pagination Props
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
}

export function DataTable<TData, TValue>({
    columns,
    data,
    isLoading = false,
    isFetching = false,
    emptyMessage = "Tidak ada data ditemukan.",
    className,
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
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);

    // Dynamically build column list based on whether actions are provided
    const tableColumns = React.useMemo(() => {
        const startIndex = (page - 1) * (perPage || 0) + 1;
        const noColumn: ColumnDef<TData, unknown> = {
            id: "rowNumber",
            header: "No.",
            enableSorting: false,
            size: 48,
            meta: {
                headerClassName: "text-center w-12",
                cellClassName: "text-center text-slate-500 font-medium text-xs font-mono",
            },
            cell: ({ row }) => startIndex + row.index,
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
                cellClassName: "text-center sticky right-0 bg-white group-hover:bg-slate-50 z-10 shadow-[-1px_0_0_0_rgba(241,245,249,1)] border-l border-slate-100 transition-colors",
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
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => onView(item)}
                                        disabled={isViewDisabled}
                                        className={cn(
                                            "p-1 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors border-none bg-transparent cursor-pointer",
                                            isViewDisabled && "opacity-40 cursor-not-allowed hover:bg-transparent"
                                        )}
                                    >
                                        <InfoIcon size={16} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>Lihat Detail</TooltipContent>
                            </Tooltip>
                        )}
                        {onEdit && !isEditHidden && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => onEdit(item)}
                                        disabled={isEditDisabled}
                                        className={cn(
                                            "p-1 text-amber-600 hover:bg-amber-50 rounded transition-colors border-none bg-transparent cursor-pointer",
                                            isEditDisabled && "opacity-40 cursor-not-allowed hover:bg-transparent"
                                        )}
                                    >
                                        <IconEdit size={16} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>Ubah</TooltipContent>
                            </Tooltip>
                        )}
                        {onCheck && !isCheckHidden && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => onCheck(item)}
                                        disabled={isCheckDisabled}
                                        className={cn(
                                            "p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors border-none bg-transparent cursor-pointer",
                                            isCheckDisabled && "opacity-40 cursor-not-allowed hover:bg-transparent"
                                        )}
                                    >
                                        <IconCheck size={16} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>Finalisasi</TooltipContent>
                            </Tooltip>
                        )}
                        {onDelete && !isDeleteHidden && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => onDelete(item)}
                                        disabled={isDeleteDisabled}
                                        className={cn(
                                            "p-1 text-rose-500 hover:bg-rose-50 rounded transition-colors border-none bg-transparent cursor-pointer",
                                            isDeleteDisabled && "opacity-40 cursor-not-allowed hover:bg-transparent"
                                        )}
                                    >
                                        <IconTrash size={16} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>Hapus</TooltipContent>
                            </Tooltip>
                        )}
                        {extraActions?.(item)}
                    </div>
                );
            },
        };

        return [...baseCols, actionColumn];
    }, [
        columns,
        page,
        perPage,
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
        data,
        columns: tableColumns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
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
        if (!meta) return null;

        const pageNumbers: (number | string)[] = [];
        const maxVisiblePages = 5;

        if (meta.last_page <= maxVisiblePages) {
            for (let i = 1; i <= meta.last_page; i++) {
                pageNumbers.push(i);
            }
        } else {
            const startPage = Math.max(1, page - 1);
            const endPage = Math.min(meta.last_page, page + 1);

            if (startPage > 1) {
                pageNumbers.push(1);
                if (startPage > 2) pageNumbers.push("ellipsis-start");
            }

            for (let i = startPage; i <= endPage; i++) {
                if (i !== 1 && i !== meta.last_page) {
                    pageNumbers.push(i);
                }
            }

            if (endPage < meta.last_page) {
                if (endPage < meta.last_page - 1)
                    pageNumbers.push("ellipsis-end");
                pageNumbers.push(meta.last_page);
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
                        isActive={p === page}
                        onClick={() => onPageChange?.(p)}
                    >
                        {p}
                    </PaginationLink>
                </PaginationItem>
            );
        });
    };

    const hasTopBar = extraToolbarActions !== undefined;

    return (
        <div className="relative border border-slate-100 rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col">
            {/* Subtle loader bar at the top of the table container for background updates */}
            {isFetching && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-50/50 overflow-hidden z-40">
                    <div className="h-full bg-emerald-500/80 animate-shimmer-loading w-[35%] rounded-full" />
                </div>
            )}

            {/* Internal Search and Filter controls bar */}
            {hasTopBar && (
                <div className="flex flex-col gap-4 p-4 border-b border-slate-100 bg-slate-50/10">
                    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                        {extraToolbarActions && (
                            <div className="flex items-center gap-2 self-start sm:self-auto ml-auto">
                                {extraToolbarActions}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Scrollable table viewport */}
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
                <Table className="w-full border-collapse relative">
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
                                    return (
                                        <TableRow
                                            key={row.id}
                                            data-index={virtualRow.index}
                                            ref={rowVirtualizer.measureElement}
                                            className={cn(
                                                "hover:bg-slate-50/50 border-b border-slate-100 transition-colors group",
                                                isFetching && "opacity-75",
                                            )}
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
                                                        }}
                                                    >
                                                        {flexRender(
                                                            cell.column
                                                                .columnDef.cell,
                                                            cell.getContext(),
                                                        )}
                                                    </TableCell>
                                                ))}
                                        </TableRow>
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
                            rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className={cn(
                                        "hover:bg-slate-50/50 border-b border-slate-100 transition-colors group",
                                        isFetching && "opacity-75",
                                    )}
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
                                            }}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {meta && (
                <div className="flex flex-col sm:flex-row justify-between items-center border-t border-slate-100 p-4 gap-4 text-xs bg-slate-50/30">
                    <div className="flex items-center gap-4 text-slate-500 font-semibold">
                        <span>
                            Menampilkan{" "}
                            {meta.total > 0
                                ? (meta.current_page - 1) * meta.per_page + 1
                                : 0}{" "}
                            -{" "}
                            {Math.min(
                                meta.current_page * meta.per_page,
                                meta.total,
                            )}{" "}
                            dari {meta.total} {entityName}
                        </span>
                        {onPerPageChange && perPage !== undefined && (
                            <div className="flex items-center gap-1.5">
                                <span>Tampilkan:</span>
                                {/* CREATE SELECT PAGINATION */}
                                <Select
                                    onValueChange={(value) =>
                                        onPerPageChange(Number(value))
                                    }
                                    defaultValue={perPage.toString()}
                                >
                                    <SelectTrigger className="h-8 w-24 border-slate-200 focus-visible:ring-emerald-600 rounded-xl bg-white text-xs">
                                        <SelectValue placeholder="Pilih" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[5, 10, 20, 50, 100].map((option) => (
                                            <SelectItem
                                                key={option}
                                                value={option.toString()}
                                            >
                                                {option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    {meta.last_page > 1 && (
                        <Pagination className="w-auto mx-0">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => onPageChange?.(page - 1)}
                                        disabled={page === 1}
                                    />
                                </PaginationItem>
                                {renderPaginationItems()}
                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => onPageChange?.(page + 1)}
                                        disabled={page === meta.last_page}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </div>
            )}
        </div>
    );
}


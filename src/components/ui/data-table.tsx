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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
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

    // Search & Filtering Slots
    search?: string;
    onSearchChange?: (search: string) => void;
    searchPlaceholder?: string;
    filters?: React.ReactNode;
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
    search,
    onSearchChange,
    searchPlaceholder = "Cari data...",
    filters,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);

    const table = useReactTable({
        data,
        columns,
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

    const hasTopBar = onSearchChange !== undefined || filters !== undefined;

    return (
        <div className="relative border border-slate-100 rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col">
            {/* Subtle loader bar at the top of the table container for background updates */}
            {isFetching && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-indigo-50/50 overflow-hidden z-20">
                    <div className="h-full bg-indigo-500/80 animate-shimmer-loading w-[35%] rounded-full" />
                </div>
            )}

            {/* Internal Search and Filter controls bar */}
            {hasTopBar && (
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 border-b border-slate-100 bg-slate-50/20">
                    {onSearchChange !== undefined && (
                        <div className="relative w-full sm:max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <Input
                                type="text"
                                placeholder={searchPlaceholder}
                                className="pl-9 h-9 text-[11px] border-slate-200 focus-visible:ring-indigo-600 rounded-xl bg-white w-full"
                                value={search || ""}
                                onChange={(e) => onSearchChange(e.target.value)}
                            />
                        </div>
                    )}
                    {filters && (
                        <div className="flex gap-2 items-center w-full sm:w-auto justify-end">
                            {filters}
                        </div>
                    )}
                </div>
            )}

            {/* Scrollable table viewport */}
            <div
                ref={parentRef}
                className={cn(
                    "w-full overflow-auto max-h-112.5",
                    virtualize &&
                        "scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent",
                    className,
                )}
                style={virtualize ? { maxHeight } : undefined}
            >
                <Table className="w-full border-collapse relative">
                    <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-[0_1px_0_0_rgba(241,245,249,1)]">
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
                                                width: header.column.columnDef
                                                    .size,
                                            }}
                                        >
                                            {header.isPlaceholder ? null : (
                                                <div
                                                    className={cn(
                                                        "flex items-center gap-1.5",
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
                                                                <ArrowUp className="h-3 w-3 text-indigo-600 font-bold" />
                                                            ) : sortDirection ===
                                                              "desc" ? (
                                                                <ArrowDown className="h-3 w-3 text-indigo-600 font-bold" />
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
                                    className="border-b border-slate-100"
                                >
                                    {columns.map((_, colIndex) => (
                                        <TableCell
                                            key={colIndex}
                                            className="py-4 px-4"
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
                                    colSpan={columns.length}
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
                                            colSpan={columns.length}
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
                                                "hover:bg-slate-50/50 border-b border-slate-100 transition-colors",
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
                                            colSpan={columns.length}
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
                                        "hover:bg-slate-50/50 border-b border-slate-100 transition-colors",
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
                                    <SelectTrigger className="h-8 w-24 border-slate-200 focus-visible:ring-indigo-600 rounded-xl bg-white text-xs">
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

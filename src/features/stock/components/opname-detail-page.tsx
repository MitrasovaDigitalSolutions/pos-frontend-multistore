"use client";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { OPNAME_STATUS, OPNAME_STATUS_CLASSES, OPNAME_STATUS_LABELS } from "@/constants/stock";
import { useAppRouter } from "@/hooks/use-app-router";
import { formatToReadableDateTime } from "@/lib/date-utils";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import {
    IconArrowLeft,
    IconBarcode,
    IconCheck,
    IconClipboard,
    IconClock,
    IconEdit,
    IconFileDescription,
    IconMinus,
    IconPlus,
} from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { useBrands } from "@/features/master/brands/api/brands-api";
import { useCategories } from "@/features/master/categories/api/categories-api";
import { toast } from "sonner";
import {
    useActivityLogs,
    useFinalizeOpname,
    useOpnameDetail,
    useOpnameItems,
    useOpnameProgress,
} from "../api/stock-api";
import type { OpnameItem } from "../types";

interface OpnameDetailPageProps {
    opnameId: string;
}

function OpnameDetailSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-xl" />
                    <div className="space-y-1.5">
                        <Skeleton className="h-4.5 w-64" />
                        <Skeleton className="h-3 w-40" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-36 rounded-xl" />
                    <Skeleton className="h-8 w-40 rounded-xl" />
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, idx) => (
                    <Skeleton key={idx} className="h-16 rounded-xl" />
                ))}
            </div>

            {/* Core Interaction Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                <div className="lg:col-span-8">
                    <Skeleton className="h-96 rounded-xl" />
                </div>
                <div className="lg:col-span-4">
                    <Skeleton className="h-96 rounded-xl" />
                </div>
            </div>
        </div>
    );
}

export function OpnameDetailPage({ opnameId }: OpnameDetailPageProps) {
    const router = useAppRouter();
    const queryClient = useQueryClient();

    const [itemsPage, setItemsPage] = useState(1);
    const [sortBy, setSortBy] = useState<string | undefined>("nama");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>("asc");
    const [isConfirmFinalizeOpen, setIsConfirmFinalizeOpen] = useState(false);

    const { data: opname, isLoading: isDetailLoading, error } = useOpnameDetail(opnameId);

    const { data: itemsData, isLoading: isItemsLoading, isFetching: isItemsFetching } = useOpnameItems(
        opnameId,
        {
            page: itemsPage,
            per_page: 15,
            sort_by: sortBy,
            sort_order: sortOrder,
        }
    );

    const { data: logsData, isLoading: isLogsLoading } = useActivityLogs({
        search: opname?.nomor_opname || undefined,
    });

    const { data: categoriesRes } = useCategories({ per_page: 500 });
    const { data: brandsRes } = useBrands({ per_page: 500 });

    const categoryMap = useMemo(() => {
        const map = new Map<string, string>();
        if (categoriesRes?.data) {
            for (const c of categoriesRes.data) {
                map.set(String(c.uid), c.nama);
            }
        }
        return map;
    }, [categoriesRes]);

    const brandMap = useMemo(() => {
        const map = new Map<string, string>();
        if (brandsRes?.data) {
            for (const b of brandsRes.data) {
                map.set(String(b.uid), b.nama);
            }
        }
        return map;
    }, [brandsRes]);

    const finalizeOpname = useFinalizeOpname();
    const logs = logsData?.data || [];

    const handleFinalize = async () => {
        try {
            await finalizeOpname.mutateAsync(opnameId);
            toast.success("Proses finalisasi stock opname dimulai di latar belakang!");
            queryClient.invalidateQueries({
                queryKey: queryKeys.inventory.opnameDetail(opnameId),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.inventory.opnames(),
            });
        } catch (err: unknown) {
            const error = err as { message?: string };
            toast.error(error.message || "Gagal memfinalisasi stock opname.");
        } finally {
            setIsConfirmFinalizeOpen(false);
        }
    };

    const summary = itemsData?.summary;
    const totalCount = summary?.total_count ?? itemsData?.meta?.total ?? opname?.items_count ?? 0;
    const matchCount = summary?.match_count ?? 0;
    const positiveCount = summary?.positive_count ?? 0;
    const negativeCount = summary?.negative_count ?? 0;

    const columns = useMemo<ColumnDef<OpnameItem>[]>(
        () => [
            {
                accessorKey: "nama",
                header: "Nama Produk",
                enableSorting: true,
                size: 260,
                cell: ({ row }) => {
                    const item = row.original;
                    const name = item.nama || item.product?.nama || `Produk ID: ${item.product_uid}`;
                    const barcode = item.barcode || item.product?.barcode || null;
                    return (
                        <div className="flex flex-col py-0.5 min-w-[170px] max-w-[260px] sm:max-w-[340px]">
                            <span className="text-xs font-bold text-slate-900 leading-tight truncate block" title={name}>
                                {name}
                            </span>
                            {barcode && (
                                <span className="inline-flex items-center gap-0.5 font-mono text-[9.5px] text-slate-400 bg-slate-50 px-1 py-0.2 rounded mt-0.5 w-fit">
                                    <IconBarcode size={11} className="opacity-70" />
                                    {barcode}
                                </span>
                            )}
                        </div>
                    );
                },
            },
            {
                accessorKey: "category_name",
                header: "Kategori",
                enableSorting: false,
                size: 130,
                cell: ({ row }) => {
                    const item = row.original;
                    const catName =
                        item.category_name ||
                        (item.category_uid && categoryMap.get(String(item.category_uid))) ||
                        item.category?.nama ||
                        item.product?.category?.nama;
                    return (
                        <span className="text-xs text-slate-600 truncate block">
                            {catName || "—"}
                        </span>
                    );
                },
            },
            {
                accessorKey: "brand_name",
                header: "Brand",
                enableSorting: false,
                size: 120,
                cell: ({ row }) => {
                    const item = row.original;
                    const brandName =
                        item.brand_name ||
                        (item.brand_uid && brandMap.get(String(item.brand_uid))) ||
                        item.brand?.nama ||
                        item.product?.brand?.nama;
                    return (
                        <span className="text-xs text-slate-600 truncate block">
                            {brandName || "—"}
                        </span>
                    );
                },
            },
            {
                accessorKey: "stok_sistem",
                header: "Stok Sistem",
                enableSorting: true,
                size: 100,
                meta: {
                    headerClassName: "text-right",
                    cellClassName: "text-right font-mono text-slate-500 text-xs",
                },
                cell: ({ row }) => `${row.original.stok_sistem} pcs`,
            },
            {
                accessorKey: "stok_fisik",
                header: "Stok Fisik",
                enableSorting: true,
                size: 100,
                meta: {
                    headerClassName: "text-right",
                    cellClassName: "text-right font-mono text-slate-800 font-bold text-xs",
                },
                cell: ({ row }) => `${row.original.stok_fisik} pcs`,
            },
            {
                accessorKey: "selisih",
                header: "Selisih",
                enableSorting: true,
                size: 95,
                meta: {
                    headerClassName: "text-right",
                    cellClassName: "text-right",
                },
                cell: ({ row }) => {
                    const diff = (Number(row.original.stok_fisik) || 0) - (Number(row.original.stok_sistem) || 0);
                    return (
                        <span
                            className={cn(
                                "inline-block font-mono font-bold text-[11px] px-1.5 py-0.5 rounded-md",
                                diff === 0
                                    ? "bg-slate-100 text-slate-500"
                                    : diff > 0
                                    ? "bg-blue-50 text-blue-700 border border-blue-100"
                                    : "bg-rose-50 text-rose-700 border border-rose-100"
                            )}
                        >
                            {diff > 0 ? `+${diff}` : diff} pcs
                        </span>
                    );
                },
            },
            {
                accessorKey: "alasan",
                header: "Alasan Selisih",
                enableSorting: false,
                cell: ({ row }) => (
                    <span className="text-xs text-slate-600 italic truncate block">
                        {row.original.alasan || "—"}
                    </span>
                ),
            },
        ],
        [brandMap, categoryMap]
    );

    if (isDetailLoading) {
        return <OpnameDetailSkeleton />;
    }

    if (error || !opname) {
        return (
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm max-w-md mx-auto mt-12">
                <p className="text-sm font-bold text-slate-800">Error</p>
                <p className="text-xs text-slate-400 mt-1">
                    Stock opname tidak ditemukan atau terjadi kesalahan saat memuat data.
                </p>
                <Button
                    onClick={() => router.push(ROUTES.ADMIN_STOCK)}
                    className="mt-4 bg-slate-800 hover:bg-slate-900 text-white text-xs rounded-xl"
                >
                    Kembali ke Daftar Stock
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-3 sm:space-y-3.5 pb-12">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        onClick={() => router.push(ROUTES.ADMIN_STOCK)}
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-xl border-slate-200 text-slate-500 hover:text-slate-900 bg-white cursor-pointer"
                        title="Kembali ke Daftar Stock"
                    >
                        <IconArrowLeft size={16} />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                                Opname #{opname.nomor_opname}
                            </h2>
                            <span
                                className={cn(
                                    "px-2 py-0.5 rounded-full text-[9px] font-bold border",
                                    OPNAME_STATUS_CLASSES[opname.status] || "bg-amber-50 text-amber-700 border-amber-100"
                                )}
                            >
                                {OPNAME_STATUS_LABELS[opname.status]}
                            </span>
                        </div>
                        <p className="text-[10.5px] text-slate-400 mt-0.5">
                            ID: <span className="font-mono text-slate-500">{opname.uid}</span>
                        </p>
                    </div>
                </div>

                {opname.status === OPNAME_STATUS.DRAFT && (
                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            onClick={() => router.push(`/admin/inventory/stock-opname/${opname.uid}/items`)}
                            variant="outline"
                            className="border-slate-200 text-slate-700 hover:text-slate-900 bg-white font-bold text-xs h-8 px-3 rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                            <IconEdit size={14} />
                            <span>Edit Koreksi Barang</span>
                        </Button>
                        <Button
                            onClick={() => setIsConfirmFinalizeOpen(true)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 px-4 shadow-xs rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0 border-none"
                        >
                            <IconCheck size={14} />
                            <span>Finalisasi &amp; Update Stok</span>
                        </Button>
                    </div>
                )}
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Total Scanned */}
                <div className="bg-white border border-slate-100 rounded-xl p-2.5 shadow-2xs flex items-center justify-between">
                    <div className="min-w-0">
                        <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                            Total Dihitung
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                            {totalCount.toLocaleString("id-ID")}{" "}
                            <span className="text-[9.5px] font-medium text-slate-400">item</span>
                        </p>
                    </div>
                    <div className="bg-slate-50 text-slate-500 p-1.5 rounded-lg shrink-0">
                        <IconClipboard size={14} />
                    </div>
                </div>

                {/* Sesuai Sistem */}
                <div className="bg-white border border-slate-100 rounded-xl p-2.5 shadow-2xs flex items-center justify-between">
                    <div className="min-w-0">
                        <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                            Sesuai Sistem
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-emerald-600 mt-0.5">
                            {matchCount.toLocaleString("id-ID")}{" "}
                            <span className="text-[9.5px] font-medium text-emerald-600/70">item</span>
                        </p>
                    </div>
                    <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg shrink-0">
                        <IconCheck size={14} />
                    </div>
                </div>

                {/* Selisih Lebih (+) */}
                <div className="bg-white border border-slate-100 rounded-xl p-2.5 shadow-2xs flex items-center justify-between">
                    <div className="min-w-0">
                        <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                            Selisih Lebih (+)
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-blue-600 mt-0.5">
                            {positiveCount.toLocaleString("id-ID")}{" "}
                            <span className="text-[9.5px] font-medium text-blue-600/70">item</span>
                        </p>
                    </div>
                    <div className="bg-blue-50 text-blue-600 p-1.5 rounded-lg shrink-0">
                        <IconPlus size={14} />
                    </div>
                </div>

                {/* Selisih Kurang (-) */}
                <div className="bg-white border border-slate-100 rounded-xl p-2.5 shadow-2xs flex items-center justify-between">
                    <div className="min-w-0">
                        <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                            Selisih Kurang (-)
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-rose-600 mt-0.5">
                            {negativeCount.toLocaleString("id-ID")}{" "}
                            <span className="text-[9.5px] font-medium text-rose-600/70">item</span>
                        </p>
                    </div>
                    <div className="bg-rose-50 text-rose-600 p-1.5 rounded-lg shrink-0">
                        <IconMinus size={14} />
                    </div>
                </div>
            </div>

            {/* Metadata Info & Notes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-2xs space-y-2">
                    <h3 className="text-xs font-bold text-slate-800 border-b border-slate-50 pb-1.5">
                        Informasi Dokumen
                    </h3>
                    <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Tanggal Dibuat</span>
                            <span className="font-semibold text-slate-700">
                                {formatToReadableDateTime(opname.created_at)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Dibuat Oleh</span>
                            <span className="font-semibold text-slate-700">{opname.user?.name || "System"}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-2xs space-y-2">
                    <h3 className="text-xs font-bold text-slate-800 border-b border-slate-50 pb-1.5">
                        Catatan
                    </h3>
                    <p className="text-xs text-slate-600 italic leading-relaxed">
                        {opname.catatan || "Tidak ada catatan."}
                    </p>
                </div>
            </div>

            {/* Processing State Progress Card */}
            {opname.status === OPNAME_STATUS.PROCESSING && (
                <OpnameProgressCard uid={opname.uid} />
            )}

            {/* Core Interaction Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start">
                {/* Items Table (Col-8) */}
                <div className="lg:col-span-8">
                    <DataTable
                        columns={columns}
                        data={itemsData?.data || []}
                        isLoading={isItemsLoading}
                        isFetching={isItemsFetching}
                        emptyMessage="Tidak ada item tercatat."
                        page={itemsPage}
                        onPageChange={setItemsPage}
                        meta={itemsData?.meta}
                        entityName="item"
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSortChange={(by, order) => {
                            setSortBy(by);
                            setSortOrder(order);
                            setItemsPage(1);
                        }}
                        showViewToggle={true}
                        extraToolbarActions={
                            <div className="flex items-center gap-1.5">
                                <IconFileDescription size={15} className="text-emerald-600" />
                                <h3 className="text-xs font-bold text-slate-900">Daftar Koreksi Barang</h3>
                                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-slate-200/70 text-slate-700 rounded-full">
                                    {totalCount.toLocaleString("id-ID")} Item
                                </span>
                            </div>
                        }
                        renderCardItem={(row) => {
                            const item = row.original;
                            const name = item.nama || item.product?.nama || `Produk ID: ${item.product_uid}`;
                            const barcode = item.barcode || item.product?.barcode || null;
                            const diff = (Number(item.stok_fisik) || 0) - (Number(item.stok_sistem) || 0);
                            const catName =
                                item.category_name ||
                                (item.category_uid && categoryMap.get(String(item.category_uid))) ||
                                item.category?.nama;
                            const brandName =
                                item.brand_name ||
                                (item.brand_uid && brandMap.get(String(item.brand_uid))) ||
                                item.brand?.nama;

                            return (
                                <div
                                    key={item.uid}
                                    className="bg-white border border-slate-100 rounded-xl p-2.5 shadow-2xs space-y-2"
                                >
                                    <div className="flex items-start justify-between gap-1.5">
                                        <div className="min-w-0">
                                            <h4 className="text-xs font-bold text-slate-800 line-clamp-1 leading-snug">
                                                {name}
                                            </h4>
                                            <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-slate-400 font-medium mt-0.5">
                                                {barcode && (
                                                    <span className="font-mono flex items-center gap-0.5">
                                                        <IconBarcode size={11} className="opacity-70" />
                                                        {barcode}
                                                    </span>
                                                )}
                                                {(catName || brandName) && (
                                                    <span>• {catName || brandName}</span>
                                                )}
                                            </div>
                                        </div>
                                        <span
                                            className={cn(
                                                "font-mono font-bold text-[11px] px-1.5 py-0.5 rounded-md shrink-0",
                                                diff === 0
                                                    ? "bg-slate-100 text-slate-500"
                                                    : diff > 0
                                                    ? "bg-blue-50 text-blue-700 border border-blue-100"
                                                    : "bg-rose-50 text-rose-700 border border-rose-100"
                                            )}
                                        >
                                            {diff > 0 ? `+${diff}` : diff}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-50 font-mono">
                                        <span className="text-slate-500">Sistem: {item.stok_sistem} pcs</span>
                                        <span className="text-slate-800 font-bold">Fisik: {item.stok_fisik} pcs</span>
                                    </div>

                                    {item.alasan && (
                                        <div className="text-[10px] text-slate-500 italic bg-slate-50 px-2 py-1 rounded">
                                            Alasan: {item.alasan}
                                        </div>
                                    )}
                                </div>
                            );
                        }}
                    />
                </div>

                {/* Activity Logs (Col-4) */}
                <div className="lg:col-span-4 bg-white border border-slate-100 rounded-xl shadow-2xs p-3.5 space-y-3">
                    <div className="flex items-center gap-1.5 pb-2 border-b border-slate-50">
                        <IconClock size={15} className="text-emerald-600" />
                        <h3 className="text-xs font-bold text-slate-900">Log Aktivitas</h3>
                    </div>

                    {isLogsLoading ? (
                        <div className="space-y-3 py-1 pl-2">
                            {Array.from({ length: 4 }).map((_, idx) => (
                                <div key={idx} className="relative flex gap-2.5 pb-3 last:pb-0 border-l border-slate-100 pl-3">
                                    <div className="absolute -left-1 top-1.5 w-2 h-2 bg-slate-200 rounded-full" />
                                    <div className="space-y-1 w-full">
                                        <Skeleton className="h-3 w-3/4" />
                                        <Skeleton className="h-2.5 w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3 pl-2 pr-1 py-1 max-h-96 overflow-y-auto scrollbar-thin">
                            {logs.map((log) => (
                                <div key={log.uid} className="relative flex gap-2.5 pb-3 last:pb-0 border-l border-slate-100 pl-3">
                                    <div className="absolute -left-1 top-1 w-2 h-2 bg-emerald-500 rounded-full" />
                                    <div className="space-y-0.5 text-xs min-w-0">
                                        <p className="font-semibold text-slate-800 text-[11px] leading-tight">
                                            {log.description}
                                        </p>
                                        <div className="flex flex-wrap gap-1.5 text-[9.5px] text-slate-400 font-mono">
                                            <span>{formatToReadableDateTime(log.created_at)}</span>
                                            <span>•</span>
                                            <span>{log.user?.name || "System"}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {logs.length === 0 && (
                                <p className="text-center py-6 text-slate-400 text-xs">
                                    Belum ada log aktivitas tercatat.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Confirm Finalize Dialog */}
            <ConfirmDialog
                open={isConfirmFinalizeOpen}
                onOpenChange={setIsConfirmFinalizeOpen}
                title="Finalisasi Perhitungan Fisik"
                description="Apakah Anda yakin ingin menyelesaikan stock opname ini? Stok produk di sistem akan secara otomatis disesuaikan secara permanen dengan stok fisik lapangan."
                confirmText="Ya, Selesaikan"
                cancelText="Batal"
                variant="primary"
                onConfirm={handleFinalize}
                isLoading={finalizeOpname.isPending}
            />
        </div>
    );
}

function OpnameProgressCard({ uid }: { uid: string }) {
    const queryClient = useQueryClient();
    const { data: progressData } = useOpnameProgress(uid);

    useEffect(() => {
        if (progressData?.status === "completed" || progressData?.status === "failed") {
            queryClient.invalidateQueries({
                queryKey: queryKeys.inventory.opnames(),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.inventory.opnameDetail(uid),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.products.all,
            });
        }
    }, [progressData?.status, uid, queryClient]);

    const percentage = progressData?.progress ?? 0;
    const processed = progressData?.processed_items ?? 0;
    const total = progressData?.total_items ?? 0;
    const errMessage = progressData?.error_message;

    return (
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5 space-y-2.5 text-xs transition-all duration-300 shadow-2xs">
            <div className="flex justify-between items-center font-bold text-blue-900">
                <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
                    Memproses Koreksi Stok...
                </span>
                <span className="font-mono text-xs">{percentage}%</span>
            </div>

            <div className="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-blue-600 transition-all duration-500 rounded-full"
                    style={{ width: `${percentage}%` }}
                />
            </div>

            <div className="flex justify-between items-center text-[10px] text-blue-600 font-medium">
                <span>Item diproses: {processed} dari {total}</span>
                {errMessage && (
                    <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100">Error: {errMessage}</span>
                )}
            </div>
        </div>
    );
}

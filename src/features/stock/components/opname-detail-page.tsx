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
import {
    IconArrowLeft,
    IconCheck,
    IconClock,
    IconEdit,
    IconFileDescription,
} from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
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
        <div className="space-y-6 animate-pulse">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-9 w-9 rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-72" />
                        <Skeleton className="h-3.5 w-44" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-44 rounded-xl" />
                    <Skeleton className="h-10 w-48 rounded-xl" />
                </div>
            </div>

            {/* Metadata Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-3.5">
                        <Skeleton className="h-4 w-32 border-b border-slate-50 pb-2" />
                        <div className="space-y-2.5">
                            <div className="flex justify-between">
                                <Skeleton className="h-3.5 w-20" />
                                <Skeleton className="h-3.5 w-28" />
                            </div>
                            <div className="flex justify-between">
                                <Skeleton className="h-3.5 w-24" />
                                <Skeleton className="h-3.5 w-16" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Core Interaction Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Items Table (Col-8) */}
                <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl shadow-sm p-5 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
                        <Skeleton className="h-4 w-44" />
                    </div>
                    <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/10 space-y-4">
                        <div className="flex justify-between border-b pb-3 border-slate-100">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                        {Array.from({ length: 4 }).map((_, idx) => (
                            <div key={idx} className="flex justify-between pt-1">
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Activity Logs (Col-4) */}
                <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl shadow-sm p-5 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="space-y-4 pl-3 pr-1 py-1">
                        {Array.from({ length: 3 }).map((_, idx) => (
                            <div key={idx} className="relative flex gap-3 pb-4 border-l border-slate-100 pl-4">
                                <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-slate-200 rounded-full border-2 border-white" />
                                <div className="space-y-1.5 w-full">
                                    <Skeleton className="h-3.5 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function OpnameDetailPage({ opnameId }: OpnameDetailPageProps) {
    const router = useAppRouter();
    const queryClient = useQueryClient();

    const [itemsPage, setItemsPage] = useState(1);
    const [sortBy, setSortBy] = useState<string | undefined>(undefined);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(undefined);
    const [isConfirmFinalizeOpen, setIsConfirmFinalizeOpen] = useState(false);

    const { data: opname, isLoading: isDetailLoading, error } = useOpnameDetail(opnameId);

    const { data: itemsData, isLoading: isItemsLoading, isFetching: isItemsFetching } = useOpnameItems(
        opnameId,
        {
            page: itemsPage,
            per_page: 10,
            sort_by: sortBy,
            sort_order: sortOrder,
        }
    );

    const { data: logsData, isLoading: isLogsLoading } = useActivityLogs({
        search: opname?.nomor_opname || undefined,
    });

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

    const columns = useMemo<ColumnDef<OpnameItem>[]>(
        () => [
            {
                accessorKey: "product.nama",
                header: "Nama Produk",
                enableSorting: false,
                cell: ({ row }) => (
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900">
                            {row.original.product?.nama || `Produk ID: ${row.original.product_uid}`}
                        </span>
                        {row.original.product?.barcode && (
                            <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                                {row.original.product.barcode}
                            </span>
                        )}
                    </div>
                ),
            },
            {
                accessorKey: "stok_sistem",
                header: "Stok Sistem",
                meta: {
                    headerClassName: "text-right",
                    cellClassName: "text-right font-mono text-slate-500",
                },
                cell: ({ row }) => `${row.original.stok_sistem} pcs`,
            },
            {
                accessorKey: "stok_fisik",
                header: "Stok Fisik",
                meta: {
                    headerClassName: "text-right",
                    cellClassName: "text-right font-mono text-slate-800 font-bold",
                },
                cell: ({ row }) => `${row.original.stok_fisik} pcs`,
            },
            {
                accessorKey: "selisih",
                header: "Selisih",
                meta: {
                    headerClassName: "text-right",
                    cellClassName: "text-right font-mono font-bold",
                },
                cell: ({ row }) => {
                    const selisih = row.original.selisih;
                    const colorClass = selisih === 0
                        ? "text-slate-400"
                        : selisih > 0
                            ? "text-blue-600"
                            : "text-rose-500";
                    return (
                        <span className={colorClass}>
                            {selisih > 0 ? `+${selisih}` : selisih} pcs
                        </span>
                    );
                }
            },
        ],
        []
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
        <div className="space-y-6">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-4">
                    <Button
                        type="button"
                        onClick={() => router.push(ROUTES.ADMIN_STOCK)}
                        variant="outline"
                        className="p-2 h-9 w-9 rounded-xl border-slate-200 text-slate-500 hover:text-slate-900 bg-white"
                    >
                        <IconArrowLeft size={18} />
                    </Button>
                    <div>
                        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <span>Detail Stock Opname — {opname.nomor_opname}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${OPNAME_STATUS_CLASSES[opname.status] || "bg-amber-50 text-amber-700 border-amber-100"}`}>
                                {OPNAME_STATUS_LABELS[opname.status]}
                            </span>
                        </h2>
                        <p className="text-xs text-slate-400">
                            ID Dokumen: <span className="font-semibold text-slate-600">{opname.uid}</span>
                        </p>
                    </div>
                </div>

                {opname.status === OPNAME_STATUS.DRAFT && (
                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            onClick={() => router.push(`/admin/inventory/stock-opname/${opname.uid}/items`)}
                            variant="outline"
                            className="border-slate-200 text-slate-700 hover:text-slate-900 bg-white font-bold text-xs h-10 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                            <IconEdit size={16} /> Edit Koreksi Barang
                        </Button>
                        <Button
                            onClick={() => setIsConfirmFinalizeOpen(true)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-5 shadow-sm rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0 border-none"
                        >
                            <IconCheck size={16} /> Finalisasi & Update Stok
                        </Button>
                    </div>
                )}
            </div>

            {/* Metadata Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-3.5">
                    <h3 className="text-xs font-bold text-slate-800 border-b border-slate-50 pb-2">Informasi Dokumen</h3>
                    <div className="space-y-2 text-xs">
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

                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-3.5">
                    <h3 className="text-xs font-bold text-slate-800 border-b border-slate-50 pb-2">Catatan</h3>
                    <p className="text-xs text-slate-600 italic leading-relaxed">
                        {opname.catatan || "Tidak ada catatan."}
                    </p>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-3.5">
                    <h3 className="text-xs font-bold text-slate-800 border-b border-slate-50 pb-2">Ringkasan Items</h3>
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Total Macam Produk</span>
                            <span className="font-bold text-slate-900">{opname.items_count || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Processing State Progress Card */}
            {opname.status === OPNAME_STATUS.PROCESSING && (
                <OpnameProgressCard uid={opname.uid} />
            )}

            {/* Core Interaction Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Items Table (Col-8) */}
                <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden p-5 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
                        <IconFileDescription size={18} className="text-emerald-600" />
                        <h3 className="text-xs font-bold text-slate-900">Daftar Koreksi Barang</h3>
                    </div>

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
                        virtualize={false}
                    />
                </div>

                {/* Activity Logs (Col-4) */}
                <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl shadow-sm p-5 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
                        <IconClock size={18} className="text-emerald-600" />
                        <h3 className="text-xs font-bold text-slate-900">Log Aktivitas</h3>
                    </div>

                    {isLogsLoading ? (
                        <div className="space-y-4 py-2 pl-3">
                            {Array.from({ length: 4 }).map((_, idx) => (
                                <div key={idx} className="relative flex gap-3 pb-4 last:pb-0 border-l border-slate-100 pl-4">
                                    <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-slate-200 rounded-full border-2 border-white shadow-sm" />
                                    <div className="space-y-1.5 w-full">
                                        <Skeleton className="h-3.5 w-3/4 animate-pulse" />
                                        <Skeleton className="h-3 w-1/2 animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4 pl-3 pr-1 py-1 max-h-112 overflow-y-auto scrollbar-thin">
                            {logs.map((log) => (
                                <div key={log.uid} className="relative flex gap-3 pb-4 last:pb-0 border-l border-slate-100 pl-4">
                                    <div className="absolute -left-1.5 top-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
                                    <div className="space-y-0.5 text-xs">
                                        <p className="font-semibold text-slate-800">
                                            {log.description}
                                        </p>
                                        <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 font-mono">
                                            <span>
                                                {formatToReadableDateTime(log.created_at)}
                                            </span>
                                            <span>•</span>
                                            <span>Oleh: {log.user?.name || "System"}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {logs.length === 0 && (
                                <p className="text-center py-8 text-slate-400 text-xs">
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
                variant="warning"
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
        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 space-y-3.5 text-xs transition-all duration-300 shadow-sm">
            <div className="flex justify-between items-center font-bold text-blue-850">
                <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-600 animate-ping" />
                    Memproses Koreksi Stok...
                </span>
                <span className="font-mono text-sm">{percentage}%</span>
            </div>

            <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
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

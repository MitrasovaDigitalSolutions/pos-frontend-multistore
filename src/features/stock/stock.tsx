"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AccessDeniedState } from "@/components/ui/access-denied-state";
import { hasPermission, hasRole } from "@/constants/roles";
import {
    useOpnames,
    downloadOpnameTemplateXlsx,
    downloadOpnameSheetPdf,
} from "@/features/stock/api/stock-api";
import { AdjustmentDialog } from "@/features/stock/components/adjustment-dialog";
import { OpnameDialog } from "@/features/stock/components/opname-dialog";
import { OpnameList } from "@/features/stock/components/opname-list";
import { useAppRouter } from "@/hooks/use-app-router";
import {
    IconActivity,
    IconClipboardCheck,
    IconDownload,
    IconFileSpreadsheet,
    IconFileTypePdf,
    IconLoader2,
} from "@tabler/icons-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function StockManagement() {
    const searchParams = useSearchParams();
    const router = useAppRouter();
    const currentTab = searchParams.get("tab") || "inventory";

    // Redirect legacy stock tab=receiving requests to the new purchase route
    useEffect(() => {
        if (currentTab === "receiving") {
            router.replace("/admin/purchase/receiving");
        }
    }, [currentTab, router]);

    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];

    const hasViewInventory =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "view_inventory");
    const hasManageInventory =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "manage_inventory");

    const [opnamesPage, setOpnamesPage] = useState(1);
    const [opnamesSortBy, setOpnamesSortBy] = useState<string | undefined>("created_at");
    const [opnamesSortOrder, setOpnamesSortOrder] = useState<"asc" | "desc" | undefined>("desc");

    const {
        data: opnamesData,
        isLoading: opnamesLoading,
        isFetching: opnamesFetching,
    } = useOpnames({
        page: opnamesPage,
        per_page: 10,
        sort_by: opnamesSortBy,
        sort_order: opnamesSortOrder,
    });

    const opnames = opnamesData?.data || [];

    // Modals
    const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
    const [isOpnameModalOpen, setIsOpnameModalOpen] = useState(false);
    const [isDownloadingXlsx, setIsDownloadingXlsx] = useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

    const handleDownloadTemplateXlsx = async () => {
        setIsDownloadingXlsx(true);
        try {
            await downloadOpnameTemplateXlsx();
            toast.success("Template Excel Stock Opname berhasil diunduh.");
        } catch (error) {
            console.error("Gagal mengunduh template XLSX:", error);
            toast.error("Gagal mengunduh template Excel.");
        } finally {
            setIsDownloadingXlsx(false);
        }
    };

    const handleDownloadSheetPdf = async () => {
        setIsDownloadingPdf(true);
        try {
            await downloadOpnameSheetPdf();
            toast.success("Lembar Cetak Stock Opname (PDF) berhasil diunduh.");
        } catch (error) {
            console.error("Gagal mengunduh lembar PDF:", error);
            toast.error("Gagal mengunduh lembar PDF.");
        } finally {
            setIsDownloadingPdf(false);
        }
    };

    if (currentTab === "inventory" && !hasViewInventory) {
        return (
            <AccessDeniedState
                description="Anda tidak memiliki izin untuk melihat atau mengelola data stok / opname inventori."
                requiredPermission="view_inventory"
            />
        );
    }

    // Show skeleton UI on initial load of opnames
    if (opnamesLoading && !opnamesData) {
        return (
            <div className="space-y-6">
                <div className="space-y-6">
                    <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-6">
                        <div className="flex justify-between items-center border-b border-slate-50 pb-6">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-64" />
                                <Skeleton className="h-3.5 w-96" />
                            </div>
                            <div className="flex gap-2">
                                <Skeleton className="h-9 w-44 rounded-xl" />
                                <Skeleton className="h-9 w-40 rounded-xl" />
                            </div>
                        </div>

                        {/* Skeleton Table / List */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b pb-3 border-slate-100">
                                <Skeleton className="h-4 w-12" />
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                            {Array.from({ length: 5 }).map((_, idx) => (
                                <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                                    <Skeleton className="h-4 w-6" />
                                    <Skeleton className="h-4 w-48" />
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-12" />
                                    <Skeleton className="h-4 w-12" />
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        );
    }

    const handleViewOpnameDetail = (uid: string) => {
        router.push(`/admin/inventory/stock-opname/${uid}`);
    };

    return (
        <div className="space-y-4 sm:space-y-6 pb-28 sm:pb-8">
            {currentTab === "inventory" ? (
                <div className="space-y-4 sm:space-y-6">
                    {/* Stock Levels & Movements */}
                    <section className="bg-white border border-slate-100 rounded-2xl shadow-xs p-3.5 sm:p-5 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5 sm:pb-4">
                            <div>
                                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                                    Stock Opname & Penyesuaian Stok
                                </h3>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    Peninjauan stok real-time, opname fisik, dan penyesuaian stok manual.
                                </p>
                            </div>
                            {hasManageInventory && (
                                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="flex-1 sm:flex-none border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-bold text-xs h-9 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                                                disabled={isDownloadingXlsx || isDownloadingPdf}
                                            >
                                                {isDownloadingXlsx || isDownloadingPdf ? (
                                                    <IconLoader2 size={14} className="animate-spin text-slate-500" />
                                                ) : (
                                                    <IconDownload size={14} className="text-slate-500" />
                                                )}
                                                <span>Dokumen & Template</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56 bg-white text-slate-800 border border-slate-200 shadow-md p-1.5 rounded-xl">
                                            <DropdownMenuItem
                                                onClick={handleDownloadTemplateXlsx}
                                                className="flex items-center gap-2 px-2.5 py-2 text-xs font-semibold rounded-lg hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer"
                                            >
                                                <IconFileSpreadsheet size={15} className="text-emerald-600" />
                                                <span>Template Excel (.xlsx)</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={handleDownloadSheetPdf}
                                                className="flex items-center gap-2 px-2.5 py-2 text-xs font-semibold rounded-lg hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
                                            >
                                                <IconFileTypePdf size={15} className="text-rose-600" />
                                                <span>Lembar Opname (.pdf)</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <Button
                                        onClick={() => setIsAdjustmentOpen(true)}
                                        className="flex-1 sm:flex-none bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-9 px-3.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs border-none"
                                    >
                                        <IconActivity size={15} />
                                        <span>Penyesuaian Stok</span>
                                    </Button>
                                    <Button
                                        onClick={() => setIsOpnameModalOpen(true)}
                                        className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-3.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs border-none"
                                    >
                                        <IconClipboardCheck size={15} />
                                        <span>Opname Baru</span>
                                    </Button>
                                </div>
                            )}
                        </div>

                        <OpnameList
                            opnames={opnames}
                            meta={opnamesData?.meta}
                            page={opnamesPage}
                            onPageChange={setOpnamesPage}
                            onViewDetail={handleViewOpnameDetail}
                            isLoading={opnamesLoading}
                            isFetching={opnamesFetching}
                            sortBy={opnamesSortBy}
                            sortOrder={opnamesSortOrder}
                            onSortChange={(by, order) => {
                                setOpnamesSortBy(by);
                                setOpnamesSortOrder(order);
                                setOpnamesPage(1);
                            }}
                        />
                    </section>
                </div>
            ) : (
                <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <p className="text-sm font-bold text-slate-800">Halaman Tidak Ditemukan</p>
                </div>
            )}

            {/* Dialogs */}
            <AdjustmentDialog
                open={isAdjustmentOpen}
                onOpenChange={setIsAdjustmentOpen}
            />

            <OpnameDialog
                open={isOpnameModalOpen}
                onOpenChange={setIsOpnameModalOpen}
            />

        </div>
    );
}

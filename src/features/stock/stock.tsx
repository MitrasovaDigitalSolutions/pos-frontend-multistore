"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { hasPermission, hasRole } from "@/constants/roles";
import {
    useOpnames,
} from "@/features/stock/api/stock-api";
import { AdjustmentDialog } from "@/features/stock/components/adjustment-dialog";
import { OpnameDialog } from "@/features/stock/components/opname-dialog";
import { OpnameList } from "@/features/stock/components/opname-list";
import { useAppRouter } from "@/hooks/use-app-router";
import { IconActivity, IconClipboardCheck } from "@tabler/icons-react";
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

    if (currentTab === "inventory" && !hasViewInventory) {
        return (
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm">
                <p className="text-sm font-bold text-slate-800">Akses Ditolak</p>
                <p className="text-xs text-slate-400 mt-1">Anda tidak memiliki izin untuk melihat data stok/inventori.</p>
            </div>
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
        <div className="space-y-6">
            {currentTab === "inventory" ? (
                <div className="space-y-6">
                    {/* Stock Levels & Movements */}
                    <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-2">
                        <div className="flex justify-between items-center border-b border-slate-50 pb-6">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">
                                    Stock Opname & Penyesuaian Stok
                                </h3>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    Peninjauan stok real-time, opname fisik, and
                                    adjustment manual.
                                </p>
                            </div>
                            {hasManageInventory && (
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => setIsAdjustmentOpen(true)}
                                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer"
                                    >
                                        <IconActivity size={16} /> Penyesuaian Stok
                                        (Manual)
                                    </Button>
                                    <Button
                                        onClick={() => setIsOpnameModalOpen(true)}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer"
                                    >
                                        <IconClipboardCheck size={16} /> Stock
                                        Opname Baru
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

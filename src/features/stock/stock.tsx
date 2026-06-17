"use client";

import { PageLoader } from "@/components/feedback/page-loader";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/features/products/api/products-api";
import {
    useOpnames,
    useStockMovements,
} from "@/features/stock/api/stock-api";
import { AdjustmentDialog } from "@/features/stock/components/adjustment-dialog";
import { MovementLedger } from "@/features/stock/components/movement-ledger";
import { OpnameDetailDialog } from "@/features/stock/components/opname-detail-dialog";
import { OpnameDialog } from "@/features/stock/components/opname-dialog";
import { OpnameList } from "@/features/stock/components/opname-list";
import { IconActivity, IconClipboardCheck } from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import { useAppRouter } from "@/hooks/use-app-router";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { hasRole, hasPermission } from "@/constants/roles";

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

    const [movementsPage, setMovementsPage] = useState(1);
    const [opnamesPage, setOpnamesPage] = useState(1);

    // Load all products (up to 1000) for local low stock warnings and selection dropdowns in modals
    const { data: productsData, isLoading: productsLoading } = useProducts({
        per_page: 1000,
    });
    const {
        data: movementsData,
        isLoading: movementsLoading,
        isFetching: movementsFetching,
    } = useStockMovements({ page: movementsPage, per_page: 10 });
    const {
        data: opnamesData,
        isLoading: opnamesLoading,
        isFetching: opnamesFetching,
    } = useOpnames({ page: opnamesPage, per_page: 10 });

    const products = productsData?.data || [];
    const movements = movementsData?.data || [];
    const opnames = opnamesData?.data || [];

    // Modals
    const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
    const [isOpnameModalOpen, setIsOpnameModalOpen] = useState(false);
    const [isDetailOpnameOpen, setIsDetailOpnameOpen] = useState(false);
    const [selectedOpnameId, setSelectedOpnameId] = useState<number | null>(
        null,
    );

    if (currentTab === "inventory" && !hasViewInventory) {
        return (
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm">
                <p className="text-sm font-bold text-slate-800">Akses Ditolak</p>
                <p className="text-xs text-slate-400 mt-1">Anda tidak memiliki izin untuk melihat data stok/inventori.</p>
            </div>
        );
    }

    // Show page loader only on initial load of products (critical configurations)
    if (productsLoading && !productsData) {
        return <PageLoader message="Memuat inventori & stok..." />;
    }

    const handleViewOpnameDetail = (id: number) => {
        setSelectedOpnameId(id);
        setIsDetailOpnameOpen(true);
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
                        />
                    </section>

                    {/* Movements Ledger */}
                    <MovementLedger
                        movements={movements}
                        meta={movementsData?.meta}
                        page={movementsPage}
                        onPageChange={setMovementsPage}
                        isLoading={movementsLoading}
                        isFetching={movementsFetching}
                    />
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
                products={products || []}
            />

            <OpnameDialog
                open={isOpnameModalOpen}
                onOpenChange={setIsOpnameModalOpen}
            />

            <OpnameDetailDialog
                open={isDetailOpnameOpen}
                onOpenChange={setIsDetailOpnameOpen}
                opnameId={selectedOpnameId}
            />
        </div>
    );
}

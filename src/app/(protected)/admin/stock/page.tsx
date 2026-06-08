"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useProducts } from "@/features/products/api/products-api";
import {
    useStockMovements,
    useOpnames,
    useReceivings,
    useSuppliers,
} from "@/features/stock/api/stock-api";
import type { Supplier } from "@/features/stock/types";
import { SupplierList } from "@/features/stock/components/supplier-list";
import { SupplierDialog } from "@/features/stock/components/supplier-dialog";
import { LowStockTable } from "@/features/stock/components/low-stock-table";
import { OpnameList } from "@/features/stock/components/opname-list";
import { MovementLedger } from "@/features/stock/components/movement-ledger";
import { ReceivingList } from "@/features/stock/components/receiving-list";
import { AdjustmentDialog } from "@/features/stock/components/adjustment-dialog";
import { OpnameDialog } from "@/features/stock/components/opname-dialog";
import { OpnameDetailDialog } from "@/features/stock/components/opname-detail-dialog";
import { ReceivingDialog } from "@/features/stock/components/receiving-dialog";
import { PageLoader } from "@/components/feedback/page-loader";
import { Button } from "@/components/ui/button";
import { IconActivity, IconClipboardCheck } from "@tabler/icons-react";

export default function AdminStockPage() {
    const searchParams = useSearchParams();
    const currentTab = searchParams.get("tab") || "inventory";

    const [movementsPage, setMovementsPage] = useState(1);
    const [opnamesPage, setOpnamesPage] = useState(1);
    const [receivingsPage, setReceivingsPage] = useState(1);
    
    // Suppliers State
    const [suppliersPage, setSuppliersPage] = useState(1);
    const [suppliersPerPage, setSuppliersPerPage] = useState(10);
    const [suppliersSearch, setSuppliersSearch] = useState("");
    const [debouncedSuppliersSearch, setDebouncedSuppliersSearch] = useState("");

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSuppliersSearch(suppliersSearch);
            setSuppliersPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [suppliersSearch]);

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
    const {
        data: receivingsData,
        isLoading: receivingsLoading,
        isFetching: receivingsFetching,
    } = useReceivings({ page: receivingsPage, per_page: 10 });
    const {
        data: suppliersData,
        isLoading: suppliersLoading,
        isFetching: suppliersFetching,
    } = useSuppliers({
        page: suppliersPage,
        per_page: suppliersPerPage,
        search: debouncedSuppliersSearch || undefined,
    });

    const products = productsData?.data || [];
    const movements = movementsData?.data || [];
    const opnames = opnamesData?.data || [];
    const receivings = receivingsData?.data || [];
    const suppliers = suppliersData?.data || [];

    // Modals
    const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
    const [isOpnameModalOpen, setIsOpnameModalOpen] = useState(false);
    const [isReceivingModalOpen, setIsReceivingModalOpen] = useState(false);
    const [isDetailOpnameOpen, setIsDetailOpnameOpen] = useState(false);
    const [selectedOpnameId, setSelectedOpnameId] = useState<number | null>(
        null,
    );
    
    // Suppliers Modals State
    const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

    // Show page loader only on initial load of products (critical configurations)
    if (productsLoading && !productsData) {
        return <PageLoader message="Memuat inventori & stok..." />;
    }

    const handleViewOpnameDetail = (id: number) => {
        setSelectedOpnameId(id);
        setIsDetailOpnameOpen(true);
    };

    const handleEditSupplier = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setIsSupplierModalOpen(true);
    };

    const handleAddSupplierClick = () => {
        setEditingSupplier(null);
        setIsSupplierModalOpen(true);
    };

    return (
        <div className="space-y-6">
            {currentTab === "inventory" ? (
                <div className="space-y-6">
                    {/* Stock Levels & Movements */}
                    <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-6">
                        <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">
                                    Inventori & Level Stok
                                </h3>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    Peninjauan stok real-time, opname fisik, dan
                                    adjustment manual.
                                </p>
                            </div>
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
                        </div>

                        {/* Low Stock Alert Table */}
                        <LowStockTable
                            products={products}
                            isLoading={productsLoading}
                        />
                    </section>

                    {/* Opname List */}
                    <OpnameList
                        opnames={opnames}
                        meta={opnamesData?.meta}
                        page={opnamesPage}
                        onPageChange={setOpnamesPage}
                        onViewDetail={handleViewOpnameDetail}
                        isLoading={opnamesLoading}
                        isFetching={opnamesFetching}
                    />

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
            ) : currentTab === "receiving" ? (
                /* Receiving Log Table View */
                <ReceivingList
                    receivings={receivings}
                    products={products}
                    meta={receivingsData?.meta}
                    page={receivingsPage}
                    onPageChange={setReceivingsPage}
                    onAddClick={() => setIsReceivingModalOpen(true)}
                    isLoading={receivingsLoading}
                    isFetching={receivingsFetching}
                />
            ) : (
                /* Supplier Master Data Table View */
                <SupplierList
                    suppliers={suppliers}
                    meta={suppliersData?.meta}
                    page={suppliersPage}
                    perPage={suppliersPerPage}
                    onPageChange={setSuppliersPage}
                    onPerPageChange={setSuppliersPerPage}
                    search={suppliersSearch}
                    onSearchChange={setSuppliersSearch}
                    onEdit={handleEditSupplier}
                    onAddClick={handleAddSupplierClick}
                    isLoading={suppliersLoading}
                    isFetching={suppliersFetching}
                />
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
                products={products || []}
            />

            <OpnameDetailDialog
                open={isDetailOpnameOpen}
                onOpenChange={setIsDetailOpnameOpen}
                opnameId={selectedOpnameId}
            />

            <ReceivingDialog
                open={isReceivingModalOpen}
                onOpenChange={setIsReceivingModalOpen}
                products={products || []}
            />

            <SupplierDialog
                open={isSupplierModalOpen}
                onOpenChange={setIsSupplierModalOpen}
                editingSupplier={editingSupplier}
            />
        </div>
    );
}

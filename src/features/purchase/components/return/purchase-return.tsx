"use client";

import { PageLoader } from "@/components/feedback/page-loader";
import { useProducts } from "@/features/products/api/products-api";
import { usePurchaseReturns } from "@/features/purchase/api/purchase-api";
import { useSession } from "next-auth/react";
import { hasRole, hasPermission } from "@/constants/roles";
import { useAppRouter } from "@/hooks/use-app-router";
import { ReturnList } from "./return-list";
import { useState, useDeferredValue } from "react";

export function PurchaseReturn() {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];

    const hasViewPurchase =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "view_purchase") ||
        hasPermission(userRoles, userPermissions, "manage_purchase");

    const router = useAppRouter();
    const [returnPage, setReturnPage] = useState(1);

    // Filters state
    const [filters, setFilters] = useState({
        search: "",
        status: "all",
        supplier_id: "all",
        start_date: "",
        end_date: "",
    });

    const deferredFilters = useDeferredValue(filters);

    // Load all products for select dropdowns inside modals
    const { data: productsData, isLoading: productsLoading } = useProducts({
        per_page: 1000,
    });

    // Prepare API params
    const apiParams: Record<string, unknown> = {
        page: returnPage,
        per_page: 10,
    };
    if (deferredFilters.search) {
        apiParams.search = deferredFilters.search;
    }
    if (deferredFilters.status && deferredFilters.status !== "all") {
        apiParams.status = deferredFilters.status;
    }
    if (deferredFilters.supplier_id && deferredFilters.supplier_id !== "all") {
        apiParams.supplier_id = Number(deferredFilters.supplier_id);
    }
    if (deferredFilters.start_date) {
        apiParams.start_date = deferredFilters.start_date;
    }
    if (deferredFilters.end_date) {
        apiParams.end_date = deferredFilters.end_date;
    }

    const {
        data: returnsData,
        isLoading: returnsLoading,
        isFetching: returnsFetching,
    } = usePurchaseReturns(apiParams);

    const products = productsData?.data || [];
    const returns = returnsData?.data || [];

    if (!hasViewPurchase) {
        return (
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm">
                <p className="text-sm font-bold text-slate-800">Akses Ditolak</p>
                <p className="text-xs text-slate-400 mt-1">Anda tidak memiliki izin untuk mengakses menu Retur Pembelian.</p>
            </div>
        );
    }

    if (productsLoading && !productsData) {
        return <PageLoader message="Memuat daftar produk..." />;
    }

    return (
        <div className="space-y-6">
            <ReturnList
                returns={returns}
                products={products}
                meta={returnsData?.meta}
                page={returnPage}
                onPageChange={setReturnPage}
                onAddClick={() => router.push("/admin/purchase/return/new")}
                isLoading={returnsLoading}
                isFetching={returnsFetching}
                filters={filters}
                setFilters={setFilters}
            />
        </div>
    );
}

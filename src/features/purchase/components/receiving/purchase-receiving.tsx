"use client";

import { useReceivings } from "@/features/purchase/api/purchase-api";
import { ReceivingList } from "./receiving-list";
import { useState, useDeferredValue } from "react";
import { useSession } from "next-auth/react";
import { hasRole, hasPermission } from "@/constants/roles";
import { useAppRouter } from "@/hooks/use-app-router";

export function PurchaseReceiving() {
    const { data: session } = useSession();
    const router = useAppRouter();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];

    const hasViewPurchase =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "view_purchase") ||
        hasPermission(userRoles, userPermissions, "manage_purchase");

    const [receivingPage, setReceivingPage] = useState(1);

    // Filters state
    const [filters, setFilters] = useState({
        search: "",
        status: "all",
        supplier_id: "all",
        start_date: "",
        end_date: "",
    });

    const deferredFilters = useDeferredValue(filters);

    // Prepare API params
    const apiParams: Record<string, unknown> = {
        page: receivingPage,
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
        data: receivingsData,
        isLoading: receivingsLoading,
        isFetching: receivingsFetching,
    } = useReceivings(apiParams);

    const receivings = receivingsData?.data || [];

    if (!hasViewPurchase) {
        return (
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm">
                <p className="text-sm font-bold text-slate-800">Akses Ditolak</p>
                <p className="text-xs text-slate-400 mt-1">Anda tidak memiliki izin untuk mengakses menu Penerimaan.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <ReceivingList
                receivings={receivings}
                products={[]}
                meta={receivingsData?.meta}
                page={receivingPage}
                onPageChange={setReceivingPage}
                onAddClick={() => router.push("/admin/purchase/receiving/new")}
                isLoading={receivingsLoading}
                isFetching={receivingsFetching}
                filters={filters}
                setFilters={setFilters}
            />
        </div>
    );
}
export default PurchaseReceiving;

"use client";

import { PageLoader } from "@/components/feedback/page-loader";
import { useProducts } from "@/features/products/api/products-api";
import { useReceivings } from "@/features/purchase/api/purchase-api";
import { ReceivingList } from "@/features/purchase/components/receiving-list";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { hasRole, hasPermission } from "@/constants/roles";
import { useRouter } from "next/navigation";

export function PurchaseReceiving() {
    const { data: session } = useSession();
    const router = useRouter();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];

    const hasViewPurchase =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "view_purchase") ||
        hasPermission(userRoles, userPermissions, "manage_purchase");

    const [receivingsPage, setReceivingsPage] = useState(1);

    // Load all products for select dropdowns inside modals
    const { data: productsData, isLoading: productsLoading } = useProducts({
        per_page: 1000,
    });

    const {
        data: receivingsData,
        isLoading: receivingsLoading,
        isFetching: receivingsFetching,
    } = useReceivings({ page: receivingsPage, per_page: 10 });

    const products = productsData?.data || [];
    const receivings = receivingsData?.data || [];

    if (!hasViewPurchase) {
        return (
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm">
                <p className="text-sm font-bold text-slate-800">Akses Ditolak</p>
                <p className="text-xs text-slate-400 mt-1">Anda tidak memiliki izin untuk mengakses menu Pembelian.</p>
            </div>
        );
    }

    if (productsLoading && !productsData) {
        return <PageLoader message="Memuat daftar produk..." />;
    }

    return (
        <div className="space-y-6">
            <ReceivingList
                receivings={receivings}
                products={products}
                meta={receivingsData?.meta}
                page={receivingsPage}
                onPageChange={setReceivingsPage}
                onAddClick={() => router.push("/admin/purchase/receiving/new")}
                isLoading={receivingsLoading}
                isFetching={receivingsFetching}
            />
        </div>
    );
}

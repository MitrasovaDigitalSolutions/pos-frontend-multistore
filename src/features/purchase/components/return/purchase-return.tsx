"use client";

import { PageLoader } from "@/components/feedback/page-loader";
import { useProducts } from "@/features/products/api/products-api";
import { usePurchaseReturns } from "@/features/purchase/api/purchase-api";
import { useSession } from "next-auth/react";
import { hasRole, hasPermission } from "@/constants/roles";
import { useAppRouter } from "@/hooks/use-app-router";
import { ReturnList } from "./return-list";
import { useState, useDeferredValue } from "react";
import { useForm } from "react-hook-form";
import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import { useAllSuppliers } from "@/features/suppliers/api/suppliers-api";
import { RETURN_STATUS, RETURN_STATUS_LABELS } from "@/constants/purchase";

interface ReturnFilterValues {
    search: string;
    status: string;
    supplier_id: string;
    start_date: string;
    end_date: string;
}

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
    const [sortBy, setSortBy] = useState<string | undefined>("tanggal_retur");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>("desc");
    const { data: suppliers = [] } = useAllSuppliers();

    // Filters state
    const [filters, setFilters] = useState({
        search: "",
        status: "all",
        supplier_id: "all",
        start_date: "",
        end_date: "",
    });

    const deferredFilters = useDeferredValue(filters);

    const filterMethods = useForm<ReturnFilterValues>({
        defaultValues: {
            search: "",
            status: "all",
            supplier_id: "all",
            start_date: "",
            end_date: "",
        },
    });

    const handleFilterSubmit = (data: ReturnFilterValues) => {
        setFilters({
            search: data.search,
            status: data.status,
            supplier_id: data.supplier_id,
            start_date: data.start_date,
            end_date: data.end_date,
        });
        setReturnPage(1);
    };

    const handleFilterReset = () => {
        filterMethods.reset({
            search: "",
            status: "all",
            supplier_id: "all",
            start_date: "",
            end_date: "",
        });
        setFilters({
            search: "",
            status: "all",
            supplier_id: "all",
            start_date: "",
            end_date: "",
        });
        setReturnPage(1);
    };

    // Load all products for select dropdowns inside modals
    const { data: productsData, isLoading: productsLoading } = useProducts({
        per_page: 1000,
    });

    // Prepare API params
    const apiParams: Record<string, unknown> = {
        page: returnPage,
        per_page: 10,
        sort_by: sortBy,
        sort_order: sortOrder,
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

    const statusOptions = [
        { value: "all", label: "Semua Status" },
        ...Object.values(RETURN_STATUS).map((status) => ({
            value: status,
            label: RETURN_STATUS_LABELS[status],
        })),
    ];

    const supplierOptions = [
        { value: "all", label: "Semua Supplier" },
        ...suppliers.map((sup) => ({
            value: String(sup.id),
            label: sup.nama,
        })),
    ];

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
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={(by, order) => {
                    setSortBy(by);
                    setSortOrder(order);
                    setReturnPage(1);
                }}
                filterElement={
                    <FilterForm
                        methods={filterMethods}
                        onSubmit={handleFilterSubmit}
                        onReset={handleFilterReset}
                    >
                        <FormInput<ReturnFilterValues>
                            name="search"
                            label="Cari Retur"
                            placeholder="Cari nomor retur atau nama supplier..."
                        />

                        <FormSelect<ReturnFilterValues>
                            name="supplier_id"
                            label="Supplier"
                            options={supplierOptions}
                            placeholder="Semua Supplier"
                        />
                        <FormDatePicker<ReturnFilterValues>
                            name="start_date"
                            label="Tanggal Awal"
                            placeholder="Dari Tanggal"
                        />
                        <FormDatePicker<ReturnFilterValues>
                            name="end_date"
                            label="Tanggal Akhir"
                            placeholder="Sampai Tanggal"
                        />
                        <FormSelect<ReturnFilterValues>
                            name="status"
                            label="Status"
                            options={statusOptions}
                            placeholder="Semua Status"
                        />
                    </FilterForm>
                }
            />
        </div>
    );
}

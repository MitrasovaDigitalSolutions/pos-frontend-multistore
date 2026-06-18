"use client";

import { useReceivings } from "@/features/purchase/api/purchase-api";
import { ReceivingList } from "./receiving-list";
import { useState, useDeferredValue } from "react";
import { useSession } from "next-auth/react";
import { hasRole, hasPermission } from "@/constants/roles";
import { useAppRouter } from "@/hooks/use-app-router";
import { useForm } from "react-hook-form";
import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import { useAllSuppliers } from "@/features/suppliers/api/suppliers-api";
import { RECEIVING_STATUS, RECEIVING_STATUS_LABELS } from "@/constants/purchase";

interface ReceivingFilterValues {
    search: string;
    status: string;
    supplier_id: string;
    start_date: string;
    end_date: string;
}

export function PurchaseReceiving() {
    const { data: session } = useSession();
    const router = useAppRouter();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];
    const { data: suppliers = [] } = useAllSuppliers();

    const hasViewPurchase =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "view_purchase") ||
        hasPermission(userRoles, userPermissions, "manage_purchase");

    const [receivingPage, setReceivingPage] = useState(1);
    const [sortBy, setSortBy] = useState<string | undefined>("created_at");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>("desc");

    // Filters state
    const [filters, setFilters] = useState({
        search: "",
        status: "all",
        supplier_id: "all",
        start_date: "",
        end_date: "",
    });

    const deferredFilters = useDeferredValue(filters);

    const filterMethods = useForm<ReceivingFilterValues>({
        defaultValues: {
            search: "",
            status: "all",
            supplier_id: "all",
            start_date: "",
            end_date: "",
        },
    });

    const handleFilterSubmit = (data: ReceivingFilterValues) => {
        setFilters({
            search: data.search,
            status: data.status,
            supplier_id: data.supplier_id,
            start_date: data.start_date,
            end_date: data.end_date,
        });
        setReceivingPage(1);
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
        setReceivingPage(1);
    };

    // Prepare API params
    const apiParams: Record<string, unknown> = {
        page: receivingPage,
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
        data: receivingsData,
        isLoading: receivingsLoading,
        isFetching: receivingsFetching,
    } = useReceivings(apiParams);

    const receivings = receivingsData?.data || [];

    const statusOptions = [
        { value: "all", label: "Semua Status" },
        ...Object.values(RECEIVING_STATUS).map((status) => ({
            value: status,
            label: RECEIVING_STATUS_LABELS[status],
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
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={(by, order) => {
                    setSortBy(by);
                    setSortOrder(order);
                    setReceivingPage(1);
                }}
                filterElement={
                    <FilterForm
                        methods={filterMethods}
                        onSubmit={handleFilterSubmit}
                        onReset={handleFilterReset}
                    >
                        <FormInput<ReceivingFilterValues>
                            name="search"
                            label="Cari Penerimaan"
                            placeholder="Cari nomor penerimaan atau nama supplier..."
                        />

                        <FormSelect<ReceivingFilterValues>
                            name="supplier_id"
                            label="Supplier"
                            options={supplierOptions}
                            placeholder="Semua Supplier"
                        />
                        <FormDatePicker<ReceivingFilterValues>
                            name="start_date"
                            label="Tanggal Awal"
                            placeholder="Dari Tanggal"
                        />
                        <FormDatePicker<ReceivingFilterValues>
                            name="end_date"
                            label="Tanggal Akhir"
                            placeholder="Sampai Tanggal"
                        />
                        <FormSelect<ReceivingFilterValues>
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
export default PurchaseReceiving;

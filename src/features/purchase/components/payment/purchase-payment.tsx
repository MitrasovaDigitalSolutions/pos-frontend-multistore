"use client";

import { usePayments } from "@/features/purchase/api/purchase-api";
import { PaymentList } from "./payment-list";
import { useState, useDeferredValue } from "react";
import { useSession } from "next-auth/react";
import { hasRole, hasPermission } from "@/constants/roles";
import { useAppRouter } from "@/hooks/use-app-router";
import { useForm } from "react-hook-form";
import { FilterForm } from "@/components/forms/filter-form";
import { FormDatePicker } from "@/components/forms/form-date-picker";

interface PaymentFilterValues {
    start_date: string;
    end_date: string;
}

export function PurchasePayment() {
    const { data: session } = useSession();
    const router = useAppRouter();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];

    const hasViewPurchase =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "view_purchase") ||
        hasPermission(userRoles, userPermissions, "manage_purchase");

    const [paymentPage, setPaymentPage] = useState(1);
    const [sortBy, setSortBy] = useState<string | undefined>("created_at");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>("desc");

    // Filters state
    const [filters, setFilters] = useState({
        start_date: "",
        end_date: "",
    });

    const deferredFilters = useDeferredValue(filters);

    const filterMethods = useForm<PaymentFilterValues>({
        defaultValues: {
            start_date: "",
            end_date: "",
        },
    });

    const handleFilterSubmit = (data: PaymentFilterValues) => {
        setFilters({
            start_date: data.start_date,
            end_date: data.end_date,
        });
        setPaymentPage(1);
    };

    const handleFilterReset = () => {
        filterMethods.reset({
            start_date: "",
            end_date: "",
        });
        setFilters({
            start_date: "",
            end_date: "",
        });
        setPaymentPage(1);
    };

    // Prepare API params
    const apiParams: Record<string, unknown> = {
        page: paymentPage,
        per_page: 10,
        sort_by: sortBy,
        sort_order: sortOrder,
    };
    if (deferredFilters.start_date) {
        apiParams.start_date = deferredFilters.start_date;
    }
    if (deferredFilters.end_date) {
        apiParams.end_date = deferredFilters.end_date;
    }

    const {
        data: paymentsData,
        isLoading: paymentsLoading,
        isFetching: paymentsFetching,
    } = usePayments(apiParams);

    const payments = paymentsData?.data || [];

    if (!hasViewPurchase) {
        return (
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm">
                <p className="text-sm font-bold text-slate-800">Akses Ditolak</p>
                <p className="text-xs text-slate-400 mt-1">Anda tidak memiliki izin untuk mengakses menu Pembayaran.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PaymentList
                payments={payments}
                meta={paymentsData?.meta}
                page={paymentPage}
                onPageChange={setPaymentPage}
                onAddClick={() => router.push("/admin/purchase/payment/new")}
                isLoading={paymentsLoading}
                isFetching={paymentsFetching}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={(by, order) => {
                    setSortBy(by);
                    setSortOrder(order);
                    setPaymentPage(1);
                }}
                filterElement={
                    <FilterForm
                        methods={filterMethods}
                        onSubmit={handleFilterSubmit}
                        onReset={handleFilterReset}
                    >
                        <FormDatePicker<PaymentFilterValues>
                            name="start_date"
                            label="Tanggal Awal"
                            placeholder="Dari Tanggal"
                        />
                        <FormDatePicker<PaymentFilterValues>
                            name="end_date"
                            label="Tanggal Akhir"
                            placeholder="Sampai Tanggal"
                        />
                    </FilterForm>
                }
            />
        </div>
    );
}
export default PurchasePayment;

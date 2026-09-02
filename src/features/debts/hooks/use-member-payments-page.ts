"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { hasPermission, hasRole } from "@/constants/roles";
import {
    MemberPayment,
    useMemberPayments,
    useVoidMemberDebtPayment,
} from "@/features/master/members/api/members-api";

export interface MemberPaymentsFilterValues {
    search: string;
}

export function useMemberPaymentsPage() {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];

    const hasViewMembers =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "view_members");

    const hasManageMembers =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "manage_members");

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [appliedFilters, setAppliedFilters] = useState<{
        search?: string;
    }>(() => ({}));

    const [voidPayment, setVoidPayment] = useState<MemberPayment | null>(null);
    const [isVoidOpen, setIsVoidOpen] = useState(false);

    const voidPaymentMutation = useVoidMemberDebtPayment();

    const filterMethods = useForm<MemberPaymentsFilterValues>({
        defaultValues: {
            search: "",
        },
    });

    const handleFilterSubmit = (data: MemberPaymentsFilterValues) => {
        setAppliedFilters({
            search: data.search || undefined,
        });
        setPage(1);
    };

    const handleFilterReset = () => {
        filterMethods.reset({
            search: "",
        });
        setAppliedFilters({});
        setPage(1);
    };

    const handleOpenVoid = (payment: MemberPayment) => {
        setVoidPayment(payment);
        setIsVoidOpen(true);
    };

    const handleConfirmVoid = (alasan: string) => {
        if (!voidPayment) return;
        const memberUid = voidPayment.member_uid || voidPayment.member?.uid;
        if (!memberUid) {
            toast.error("Data member tidak ditemukan untuk pembayaran ini.");
            return;
        }

        voidPaymentMutation.mutate(
            {
                memberUid,
                paymentUid: voidPayment.uid,
                data: { alasan },
            },
            {
                onSuccess: () => {
                    toast.success("Pembayaran hutang member berhasil dibatalkan (void).");
                    setIsVoidOpen(false);
                    setVoidPayment(null);
                },
                onError: (err) => {
                    toast.error(
                        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                        err.message ||
                        "Gagal membatalkan pembayaran hutang member."
                    );
                },
            }
        );
    };

    const { data: paymentsData, isLoading, isFetching } = useMemberPayments({
        page,
        per_page: perPage,
        ...appliedFilters,
    });

    const payments = paymentsData?.data || [];
    const meta = paymentsData?.meta;

    return {
        hasViewMembers,
        hasManageMembers,
        page,
        setPage,
        perPage,
        setPerPage,
        payments,
        meta,
        isLoading,
        isFetching,
        filterMethods,
        handleFilterSubmit,
        handleFilterReset,
        voidPayment,
        isVoidOpen,
        setIsVoidOpen,
        handleOpenVoid,
        handleConfirmVoid,
        isVoidPending: voidPaymentMutation.isPending,
    };
}

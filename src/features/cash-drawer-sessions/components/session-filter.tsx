"use client";

import { useForm } from "react-hook-form";
import { FormSelect } from "@/components/forms/form-select";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import { FilterForm } from "@/components/forms/filter-form";
import { useUsers } from "@/features/users/api/users-api";

export interface SessionFilterValues {
    status: "all" | "open" | "closed";
    user_uid: string;
    from: string;
    to: string;
}

interface SessionFilterProps {
    onFilter: (filters: {
        status?: "open" | "closed";
        user_uid?: string;
        from?: string;
        to?: string;
    }) => void;
}

export function SessionFilter({ onFilter }: SessionFilterProps) {
    const methods = useForm<SessionFilterValues>({
        defaultValues: {
            status: "all",
            user_uid: "",
            from: "",
            to: "",
        },
    });

    const { data: usersData, isLoading: isLoadingUsers } = useUsers({ per_page: 100 });
    const userOptions = [
        { value: "", label: "Semua Kasir" },
        ...(usersData?.data || []).map((u) => ({
            value: u.uid,
            label: u.name,
        })),
    ];

    const statusOptions = [
        { value: "all", label: "Semua Status" },
        { value: "open", label: "Terbuka" },
        { value: "closed", label: "Ditutup" },
    ];

    const onSubmit = (data: SessionFilterValues) => {
        const status = data.status === "all" ? undefined : data.status;
        const user_uid = data.user_uid ? (data.user_uid) : undefined;
        const from = data.from || undefined;
        const to = data.to || undefined;

        onFilter({ status, user_uid, from, to });
    };

    const handleReset = () => {
        methods.reset({
            status: "all",
            user_uid: "",
            from: "",
            to: "",
        });
        onFilter({});
    };

    return (
        <div id="cash-drawer-filter-card">
            <FilterForm
                headerId="cash-drawer-filter-header"
                methods={methods}
                onSubmit={onSubmit}
                onReset={handleReset}
            >
                {/* Field 1: Operator/Kasir Filter */}
                <div id="cash-drawer-filter-user">
                    <FormSelect<SessionFilterValues>
                        name="user_uid"
                        label="Operator / Kasir"
                        options={userOptions}
                        placeholder={isLoadingUsers ? "Memuat kasir..." : "Semua Kasir"}
                        disabled={isLoadingUsers}
                    />
                </div>

                {/* Field 2: Status Filter */}
                <div id="cash-drawer-filter-status">
                    <FormSelect<SessionFilterValues>
                        name="status"
                        label="Status Shift"
                        options={statusOptions}
                        placeholder="Semua Status"
                    />
                </div>

                {/* Field 3: Tanggal Awal */}
                <div id="cash-drawer-filter-date">
                    <FormDatePicker<SessionFilterValues>
                        name="from"
                        label="Tanggal Awal"
                        placeholder="Pilih tanggal awal..."
                    />
                </div>

                {/* Field 4: Tanggal Akhir */}
                <div>
                    <FormDatePicker<SessionFilterValues>
                        name="to"
                        label="Tanggal Akhir"
                        placeholder="Pilih tanggal akhir..."
                    />
                </div>
            </FilterForm>
        </div>
    );
}

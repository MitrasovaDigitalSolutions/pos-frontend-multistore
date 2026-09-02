"use client";

import type { UseFormReturn } from "react-hook-form";
import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";
import type { MemberPaymentsFilterValues } from "../../hooks/use-member-payments-page";

interface MemberPaymentsFilterProps {
    methods: UseFormReturn<MemberPaymentsFilterValues>;
    onSubmit: (values: MemberPaymentsFilterValues) => void;
    onReset: () => void;
}

export function MemberPaymentsFilter({
    methods,
    onSubmit,
    onReset,
}: MemberPaymentsFilterProps) {
    return (
        <FilterForm
            methods={methods}
            onSubmit={onSubmit}
            onReset={onReset}
        >
            <FormInput<MemberPaymentsFilterValues>
                name="search"
                label="Cari Member"
                placeholder="Nama atau kode member..."
            />
        </FilterForm>
    );
}

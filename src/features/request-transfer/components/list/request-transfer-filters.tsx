"use client";

import { useForm } from "react-hook-form";
import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";

export interface RequestTransferFilterValues {
    search: string;
}

interface RequestTransferFiltersProps {
    onFilterSubmit: (data: RequestTransferFilterValues) => void;
    onFilterReset: () => void;
}

export function RequestTransferFilters({
    onFilterSubmit,
    onFilterReset,
}: RequestTransferFiltersProps) {
    const filterMethods = useForm<RequestTransferFilterValues>({ defaultValues: { search: "" } });

    const handleReset = () => {
        filterMethods.reset({ search: "" });
        onFilterReset();
    };

    return (
        <FilterForm
            methods={filterMethods}
            onSubmit={onFilterSubmit}
            onReset={handleReset}
        >
            <FormInput<RequestTransferFilterValues>
                name="search"
                label="Cari Supplier"
                placeholder="Cari nama supplier atau katalog..."
            />
        </FilterForm>
    );
}

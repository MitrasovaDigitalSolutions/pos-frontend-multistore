"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { hasRole } from "@/constants/roles";
import { useUnits } from "./api/units-api";
import { UnitList } from "./components/unit-list";
import { UnitDialog } from "./components/unit-dialog";
import { UNIT_TYPES, unitSchema, type UnitInput } from "./schemas/unit-schema";
import type { Unit } from "./types";
import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { AccessDeniedState } from "@/components/ui/access-denied-state";

interface UnitFilterValues {
    search: string;
    tipe: string;
}

export function Units() {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const isAdmin = hasRole(userRoles, "admin");

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [sortBy, setSortBy] = useState<string | undefined>("nama");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>("asc");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [filterTipe, setFilterTipe] = useState("");

    const filterMethods = useForm<UnitFilterValues>({
        defaultValues: {
            search: "",
            tipe: "",
        },
    });

    const handleFilterSubmit = (data: UnitFilterValues) => {
        setDebouncedSearch(data.search);
        setFilterTipe(data.tipe || "");
        setPage(1);
    };

    const handleFilterReset = () => {
        filterMethods.reset({ search: "", tipe: "" });
        setDebouncedSearch("");
        setFilterTipe("");
        setPage(1);
    };

    const { data: unitsData, isLoading, isFetching } = useUnits({
        page,
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
        search: debouncedSearch || undefined,
        tipe: filterTipe || undefined,
    });

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

    const dialogMethods = useForm<UnitInput>({
        resolver: zodResolver(unitSchema) as Resolver<UnitInput>,
        defaultValues: {
            nama: "",
            simbol: "",
            tipe: "kuantitas",
            deskripsi: "",
        },
    });

    if (!isAdmin) {
        return (
            <AccessDeniedState
                description="Halaman kelola master satuan produk hanya dapat diakses oleh Administrator."
            />
        );
    }

    const handleEdit = (unit: Unit) => {
        setEditingUnit(unit);
        const validTipe: "kuantitas" | "berat" | "panjang" | "volume" | "luas" | "lainnya" =
            unit.tipe && ["kuantitas", "berat", "panjang", "volume", "luas", "lainnya"].includes(unit.tipe)
                ? (unit.tipe as "kuantitas" | "berat" | "panjang" | "volume" | "luas" | "lainnya")
                : "kuantitas";

        dialogMethods.reset({
            nama: unit.nama,
            simbol: unit.simbol,
            tipe: validTipe,
            deskripsi: unit.deskripsi || "",
        });
        setIsDialogOpen(true);
    };

    const handleAddClick = () => {
        setEditingUnit(null);
        dialogMethods.reset({
            nama: "",
            simbol: "",
            tipe: "kuantitas",
            deskripsi: "",
        });
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <FormProvider {...dialogMethods}>
                <UnitList
                    units={unitsData?.data || []}
                    meta={unitsData?.meta}
                    page={page}
                    perPage={perPage}
                    onPageChange={setPage}
                    onPerPageChange={setPerPage}
                    onEdit={handleEdit}
                    onAddClick={handleAddClick}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSortChange={(by, order) => {
                        setSortBy(by);
                        setSortOrder(order);
                        setPage(1);
                    }}
                    filterElement={
                        <FilterForm
                            methods={filterMethods}
                            onSubmit={handleFilterSubmit}
                            onReset={handleFilterReset}
                        >
                            <FormInput<UnitFilterValues>
                                name="search"
                                label="Cari Satuan"
                                placeholder="Masukkan nama atau simbol satuan..."
                            />
                            <FormSelect<UnitFilterValues>
                                name="tipe"
                                label="Filter Tipe"
                                options={[
                                    { value: "", label: "Semua Tipe Satuan" },
                                    ...UNIT_TYPES.map((t) => ({
                                        value: t.value,
                                        label: t.label,
                                    })),
                                ]}
                                placeholder="Semua Tipe..."
                            />
                        </FilterForm>
                    }
                />

                <UnitDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    editingUnit={editingUnit}
                />
            </FormProvider>
        </div>
    );
}

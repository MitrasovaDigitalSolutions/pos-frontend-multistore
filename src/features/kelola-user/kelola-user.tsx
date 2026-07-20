"use client";

import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { AccessDeniedState } from "@/components/ui/access-denied-state";
import { hasRole } from "@/constants/roles";
import { useGlobalUsers } from "@/features/users/api/users-api";
import { RolePermissionMapping } from "@/features/users/components/role-permission-mapping";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { GlobalUserTable } from "./components/global-user-table";

interface UserFilterValues {
    search: string;
    status: string;
}

export function KelolaUser() {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const isAdmin = hasRole(userRoles, "admin");

    const searchParams = useSearchParams();
    const initialTab = searchParams.get("tab") === "permissions" ? "permissions" : "users";
    const [activeTab, setActiveTab] = useState<"users" | "permissions">(initialTab);

    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab === "permissions") {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setActiveTab("permissions");
        } else if (tab === "users") {
            setActiveTab("users");
        }
    }, [searchParams]);

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [sortBy, setSortBy] = useState<string | undefined>("name");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>("asc");
    const [appliedFilters, setAppliedFilters] = useState<{
        search?: string;
        status?: string;
    }>(() => ({
        status: "active",
    }));

    const filterMethods = useForm<UserFilterValues>({
        defaultValues: {
            search: "",
            status: "active",
        },
    });

    const handleFilterSubmit = (data: UserFilterValues) => {
        setAppliedFilters({
            search: data.search || undefined,
            status: data.status !== "all" ? data.status : undefined,
        });
        setPage(1);
    };

    const handleFilterReset = () => {
        filterMethods.reset({
            search: "",
            status: "active",
        });
        setAppliedFilters({
            status: "active",
        });
        setPage(1);
    };

    const { data: usersData, isLoading, isFetching } = useGlobalUsers({
        page,
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
        search: appliedFilters.search,
        status: appliedFilters.status,
    });

    if (!isAdmin) {
        return (
            <AccessDeniedState
                title="Akses Ditolak"
                description="Menu Kelola User dan Konfigurasi Peran hanya dapat diakses oleh Administrator."
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* Top Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                        Kelola User & Hak Akses
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Melihat daftar pengguna sistem secara global beserta toko terkait, dan mengatur konfigurasi hak akses per peran.
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex bg-slate-200/60 p-1 rounded-xl w-fit border border-slate-200/30">
                    <button
                        onClick={() => setActiveTab("users")}
                        className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all duration-200 cursor-pointer ${activeTab === "users"
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-800"
                            }`}
                    >
                        Daftar User
                    </button>
                    <button
                        onClick={() => setActiveTab("permissions")}
                        className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all duration-200 cursor-pointer ${activeTab === "permissions"
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-800"
                            }`}
                    >
                        Peran & Hak Akses
                    </button>
                </div>
            </div>

            {activeTab === "users" ? (
                <GlobalUserTable
                    users={usersData?.data || []}
                    meta={usersData?.meta}
                    page={page}
                    perPage={perPage}
                    onPageChange={setPage}
                    onPerPageChange={setPerPage}
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
                            <FormInput<UserFilterValues>
                                name="search"
                                label="Cari User"
                                placeholder="Cari berdasarkan nama atau username..."
                            />
                            <FormSelect<UserFilterValues>
                                name="status"
                                label="Status"
                                options={[
                                    { value: "all", label: "Semua Status" },
                                    { value: "active", label: "Aktif" },
                                    { value: "inactive", label: "Nonaktif" },
                                ]}
                                placeholder="Semua Status"
                            />
                        </FilterForm>
                    }
                />
            ) : (
                <RolePermissionMapping />
            )}
        </div>
    );
}

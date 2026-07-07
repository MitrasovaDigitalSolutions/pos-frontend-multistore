"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { hasRole, hasPermission } from "@/constants/roles";
import { useMembers } from "./api/members-api";
import { MemberList } from "./components/member-list";
import { MemberDialog } from "./components/member-dialog";
import { AdjustPointsDialog } from "./components/adjust-points-dialog";
import { memberSchema, type MemberInput } from "./schemas/member-schema";
import type { Member } from "./types";
import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { formatToISO } from "@/lib/date-utils";

interface MemberFilterValues {
    search: string;
    status: string;
}

export function Members() {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];

    const hasViewMembers =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "view_members");

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [sortBy, setSortBy] = useState<string | undefined>("nama");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>("asc");
    const [appliedFilters, setAppliedFilters] = useState<{
        search?: string;
        status?: string;
    }>(() => ({
        status: "active",
    }));

    const filterMethods = useForm<MemberFilterValues>({
        defaultValues: {
            search: "",
            status: "active",
        },
    });

    const handleFilterSubmit = (data: MemberFilterValues) => {
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

    const { data: membersData, isLoading, isFetching } = useMembers({
        page,
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
        ...appliedFilters,
    });

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const [isAdjustPointsOpen, setIsAdjustPointsOpen] = useState(false);
    const [selectedMemberForPoints, setSelectedMemberForPoints] = useState<Member | null>(null);

    const handleAdjustPoints = (member: Member) => {
        setSelectedMemberForPoints(member);
        setIsAdjustPointsOpen(true);
    };

    const dialogMethods = useForm<MemberInput>({
        resolver: zodResolver(memberSchema) as Resolver<MemberInput>,
        defaultValues: {
            kode: "",
            nama: "",
            email: "",
            nomor_telepon: "",
            alamat: "",
            tanggal_lahir: "",
            jenis_kelamin: null,
            poin: 0,
            status: "active",
        },
    });

    if (!hasViewMembers) {
        return (
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm">
                <p className="text-sm font-bold text-slate-800">Akses Ditolak</p>
                <p className="text-xs text-slate-400 mt-1">
                    Anda tidak memiliki izin untuk melihat data member.
                </p>
            </div>
        );
    }

    const handleEdit = (member: Member) => {
        setEditingMember(member);
        dialogMethods.reset({
            kode: member.kode,
            nama: member.nama,
            email: member.email || "",
            nomor_telepon: member.nomor_telepon || "",
            alamat: member.alamat || "",
            tanggal_lahir: formatToISO(member.tanggal_lahir) || "",
            jenis_kelamin: member.jenis_kelamin || null,
            poin: member.poin,
            status: member.status,
        });
        setIsDialogOpen(true);
    };

    const handleAddClick = () => {
        setEditingMember(null);
        dialogMethods.reset({
            kode: "",
            nama: "",
            email: "",
            nomor_telepon: "",
            alamat: "",
            tanggal_lahir: "",
            jenis_kelamin: null,
            poin: 0,
            status: "active",
        });
        setIsDialogOpen(true);
    };

    const statusOptions = [
        { value: "all", label: "Semua Status" },
        { value: "active", label: "Aktif" },
        { value: "inactive", label: "Nonaktif" },
    ];

    return (
        <div className="space-y-6">
            <FormProvider {...dialogMethods}>
                <MemberList
                    members={membersData?.data || []}
                    meta={membersData?.meta}
                    page={page}
                    perPage={perPage}
                    onPageChange={setPage}
                    onPerPageChange={setPerPage}
                    onEdit={handleEdit}
                    onAdjustPoints={handleAdjustPoints}
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
                            <FormInput<MemberFilterValues>
                                name="search"
                                label="Cari Member"
                                placeholder="Cari kode, nama, email, telepon..."
                            />
                            <FormSelect<MemberFilterValues>
                                name="status"
                                label="Status"
                                options={statusOptions}
                                placeholder="Semua Status"
                            />
                        </FilterForm>
                    }
                />

                <MemberDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    editingMember={editingMember}
                />

                <AdjustPointsDialog
                    open={isAdjustPointsOpen}
                    onOpenChange={setIsAdjustPointsOpen}
                    member={selectedMemberForPoints}
                />
            </FormProvider>
        </div>
    );
}

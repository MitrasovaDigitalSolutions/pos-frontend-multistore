"use client";

import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { AccessDeniedState } from "@/components/ui/access-denied-state";
import { hasPermission, hasRole } from "@/constants/roles";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { useUsers } from "./api/users-api";
import { UserFormDialog } from "./components/user-form-dialog";
import { UserTable } from "./components/user-table";
import { userSchema, type UserInput } from "./schemas/user-schema";
import type { User } from "./types";

interface UserFilterValues {
  search: string;
  status: string;
}

export function Users() {
  const { data: session } = useSession();
  const userRoles = session?.user?.roles || [];
  const userPermissions = session?.user?.permissions || [];

  const hasViewUsers =
    hasRole(userRoles, "admin") ||
    hasPermission(userRoles, userPermissions, "view_users");

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

  const { data: usersData, isLoading, isFetching } = useUsers({
    page,
    per_page: perPage,
    sort_by: sortBy,
    sort_order: sortOrder,
    ...appliedFilters,
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const dialogMethods = useForm<UserInput>({
    resolver: zodResolver(userSchema) as Resolver<UserInput>,
    defaultValues: {
      name: "",
      username: "",
      password: "",
      roles: ["kasir"],
      status: "active",
    },
  });

  if (!hasViewUsers) {
    return (
      <AccessDeniedState
        description="Anda tidak memiliki izin untuk melihat atau mengelola data karyawan toko."
        requiredPermission="view_users"
      />
    );
  }

  const handleEdit = (user: User) => {
    setEditingUser(user);
    dialogMethods.reset({
      name: user.name,
      username: user.username,
      password: "",
      roles: user.roles,
      status: user.status,
    });
    setIsDialogOpen(true);
  };

  const handleAddClick = () => {
    setEditingUser(null);
    dialogMethods.reset({
      name: "",
      username: "",
      password: "",
      roles: ["kasir"],
      status: "active",
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Kelola Karyawan
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Mengatur akun karyawan POS, tingkat pengawas (supervisor), dan manajer toko.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <FormProvider {...dialogMethods}>
          <UserTable
            users={usersData?.data || []}
            meta={usersData?.meta}
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
                <FormInput<UserFilterValues>
                  name="search"
                  label="Cari Pengguna"
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

          <UserFormDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            editingUser={editingUser}
          />
        </FormProvider>
      </div>
    </div>
  );
}

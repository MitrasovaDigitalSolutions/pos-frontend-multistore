"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { hasRole, hasPermission } from "@/constants/roles";
import { useUsers } from "./api/users-api";
import { UserTable } from "./components/user-table";
import { UserFormDialog } from "./components/user-form-dialog";
import { RolePermissionMapping } from "./components/role-permission-mapping";
import { userSchema, type UserInput } from "./schemas/user-schema";
import type { User } from "./types";
import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";

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
  const hasManageUsers =
    hasRole(userRoles, "admin") ||
    hasPermission(userRoles, userPermissions, "manage_users");

  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "permissions" ? "permissions" : "users";
  const [activeTab, setActiveTab] = useState<"users" | "permissions">(initialTab);

  // Sync tab state with search params if they change
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
      <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm">
        <p className="text-sm font-bold text-slate-800">Akses Ditolak</p>
        <p className="text-xs text-slate-400 mt-1">Anda tidak memiliki izin untuk mengakses halaman manajemen pengguna.</p>
      </div>
    );
  }

  const showMapping = activeTab === "permissions" && hasManageUsers;

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
            Kelola Pengguna & Hak Akses
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Mengatur akun karyawan POS, tingkat pengawas (supervisor), manajer, dan konfigurasi hak akses masing-masing peran.
          </p>
        </div>

        {/* Premium Tab Buttons */}
        {hasManageUsers && (
          <div className="flex bg-slate-200/60 p-1 rounded-xl w-fit border border-slate-200/30">
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all duration-200 cursor-pointer ${activeTab === "users"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
                }`}
            >
              Daftar Pengguna
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
        )}
      </div>

      {!showMapping ? (
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
      ) : (
        <RolePermissionMapping />
      )}
    </div>
  );
}

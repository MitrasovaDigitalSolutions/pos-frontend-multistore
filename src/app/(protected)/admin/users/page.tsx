"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useUsers } from "@/features/users/api/users-api";
import { UserTable } from "@/features/users/components/user-table";
import { UserFormDialog } from "@/features/users/components/user-form-dialog";
import { RolePermissionMapping } from "@/features/users/components/role-permission-mapping";
import type { User } from "@/features/users/types";
import { PageLoader } from "@/components/feedback/page-loader";

function AdminUsersContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "permissions" ? "permissions" : "users";
  const [activeTab, setActiveTab] = useState<"users" | "permissions">(initialTab);

  // Sync tab state with search params if they change
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "permissions") {
      setActiveTab("permissions");
    } else if (tab === "users") {
      setActiveTab("users");
    }
  }, [searchParams]);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input to avoid excessive API requests
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on search
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  const { data: usersData, isLoading, isFetching } = useUsers({
    page,
    per_page: perPage,
    search: debouncedSearch || undefined,
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleAddClick = () => {
    setEditingUser(null);
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
        <div className="flex bg-slate-200/60 p-1 rounded-xl w-fit border border-slate-200/30">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all duration-200 cursor-pointer ${
              activeTab === "users"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Daftar Pengguna
          </button>
          <button
            onClick={() => setActiveTab("permissions")}
            className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all duration-200 cursor-pointer ${
              activeTab === "permissions"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Peran & Hak Akses
          </button>
        </div>
      </div>

      {activeTab === "users" ? (
        <div className="space-y-6">
          <UserTable
            users={usersData?.data || []}
            meta={usersData?.meta}
            page={page}
            perPage={perPage}
            onPageChange={setPage}
            onPerPageChange={setPerPage}
            search={search}
            onSearchChange={setSearch}
            onEdit={handleEdit}
            onAddClick={handleAddClick}
            isLoading={isLoading}
            isFetching={isFetching}
          />

          <UserFormDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            editingUser={editingUser}
          />
        </div>
      ) : (
        <RolePermissionMapping />
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<PageLoader message="Memuat halaman..." />}>
      <AdminUsersContent />
    </Suspense>
  );
}


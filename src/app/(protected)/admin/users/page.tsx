"use client";

import { useState, useEffect } from "react";
import { useUsers } from "@/features/users/api/users-api";
import { UserTable } from "@/features/users/components/user-table";
import { UserFormDialog } from "@/features/users/components/user-form-dialog";
import type { User } from "@/features/users/types";

export default function AdminUsersPage() {
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
  );
}


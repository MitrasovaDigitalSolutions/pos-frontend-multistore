"use client";

import { useFormContext } from "react-hook-form";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/forms/form-select";
import { IconPlus } from "@tabler/icons-react";
import { toast } from "sonner";
import { type UserInput } from "../schemas/user-schema";
import { useCreateUser, useUpdateUser } from "../api/users-api";
import type { User } from "../types";

interface UserFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingUser: User | null;
}

export function UserFormDialog({
    open,
    onOpenChange,
    editingUser,
}: UserFormDialogProps) {
    const createUser = useCreateUser();
    const updateUser = useUpdateUser();

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useFormContext<UserInput>();

    const isPending = createUser.isPending || updateUser.isPending;

    const onSubmit = (data: UserInput) => {
        // Custom check: Password is required when adding a new user
        if (!editingUser && !data.password) {
            setError("password", {
                type: "manual",
                message: "Password wajib diisi untuk user baru!",
            });
            return;
        }

        if (data.password && data.password.length < 6) {
            setError("password", {
                type: "manual",
                message: "Password minimal harus 6 karakter!",
            });
            return;
        }

        // Build payload matching Laravel expected payload
        const payload: UserInput = {
            name: data.name,
            username: data.username,
            roles: data.roles,
            status: data.status,
        };
        if (data.password) {
            payload.password = data.password;
        }

        if (editingUser) {
            updateUser.mutate(
                { uid: editingUser.uid, data: payload },
                {
                    onSuccess: (res) => {
                        toast.success(
                            res.message || "User berhasil diperbarui!",
                        );
                        onOpenChange(false);
                    },
                    onError: (err) => {
                        toast.error(err.message || "Gagal memperbarui user.");
                    },
                },
            );
        } else {
            createUser.mutate(payload, {
                onSuccess: (res) => {
                    toast.success(res.message || "User berhasil ditambahkan!");
                    onOpenChange(false);
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal menambahkan user.");
                },
            });
        }
    };

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <>
                    <IconPlus size={20} className="text-emerald-500" />
                    <span>
                        {editingUser
                            ? "Edit Profil Pengguna"
                            : "Daftarkan Pengguna Baru"}
                    </span>
                </>
            }
            className="max-w-110"
        >
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4 pt-4"
            >
                {/* Nama Lengkap */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Nama Lengkap
                    </label>
                    <Input
                        type="text"
                        placeholder="Nama user lengkap..."
                        className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                        disabled={isPending}
                        {...register("name")}
                    />
                    {errors.name && (
                        <p className="text-[10px] text-rose-500 font-medium">
                            {errors.name.message}
                        </p>
                    )}
                </div>

                {/* Username */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Username
                    </label>
                    <Input
                        type="text"
                        placeholder="Username untuk login..."
                        className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                        disabled={isPending}
                        {...register("username")}
                    />
                    {errors.username && (
                        <p className="text-[10px] text-rose-500 font-medium">
                            {errors.username.message}
                        </p>
                    )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Password{" "}
                        {editingUser && "(Kosongkan jika tidak diubah)"}
                    </label>
                    <Input
                        type="password"
                        placeholder="Password minimal 6 karakter..."
                        className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                        disabled={isPending}
                        {...register("password")}
                    />
                    {errors.password && (
                        <p className="text-[10px] text-rose-500 font-medium">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {/* Role */}
                    <FormSelect<UserInput>
                        name="roles.0"
                        label="Role Peran"
                        options={[
                            { value: "kasir", label: "Kasir" },
                            { value: "supervisor", label: "Supervisor" },
                            { value: "manajer_toko", label: "Manajer Toko" },
                            { value: "admin", label: "Admin" },
                        ]}
                        disabled={isPending}
                    />

                    {/* Status */}
                    <FormSelect<UserInput>
                        name="status"
                        label="Status"
                        options={[
                            { value: "active", label: "Aktif" },
                            { value: "inactive", label: "Nonaktif" },
                        ]}
                        disabled={isPending}
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer mt-4"
                    disabled={isPending}
                >
                    {isPending ? "Menyimpan..." : "Simpan Pengguna"}
                </Button>
            </form>
        </BaseDialog>
    );
}

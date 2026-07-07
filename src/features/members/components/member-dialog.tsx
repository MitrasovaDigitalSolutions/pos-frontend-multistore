"use client";

import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import { FormTextarea } from "@/components/forms/form-textarea";
import { Button } from "@/components/ui/button";
import { BaseDialog } from "@/components/ui/base-dialog";
import { IconUser } from "@tabler/icons-react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { useCreateMember, useUpdateMember } from "../api/members-api";
import type { MemberInput } from "../schemas/member-schema";
import type { Member } from "../types";
import { useSettingsStore } from "@/stores/settings-store";
import { formatToISO } from "@/lib/date-utils";

interface MemberDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingMember?: Member | null;
}

export function MemberDialog({
    open,
    onOpenChange,
    editingMember = null,
}: MemberDialogProps) {
    const createMember = useCreateMember();
    const updateMember = useUpdateMember();
    const isEdit = !!editingMember;

    const getSetting = useSettingsStore((state) => state.getSetting);
    const pointSystemEnabled = getSetting("point_system_enabled", "true") === "true";

    const { handleSubmit } = useFormContext<MemberInput>();
    const isPending = createMember.isPending || updateMember.isPending;

    const onSubmit = (data: MemberInput) => {
        // format date to string YYYY-MM-DD if exists
        const formattedData = {
            ...data,
            tanggal_lahir: data.tanggal_lahir
                ? formatToISO(data.tanggal_lahir)
                : null,
        };

        if (isEdit && editingMember) {
            updateMember.mutate(
                { uid: editingMember.uid, data: formattedData },
                {
                    onSuccess: () => {
                        toast.success("Member berhasil diperbarui.");
                        onOpenChange(false);
                    },
                    onError: (err) => {
                        toast.error(err.message || "Gagal memperbarui member.");
                    },
                },
            );
        } else {
            createMember.mutate(formattedData, {
                onSuccess: () => {
                    toast.success("Member berhasil ditambahkan.");
                    onOpenChange(false);
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal menambahkan member.");
                },
            });
        }
    };

    const genderOptions = [
        { value: "L", label: "Laki-laki" },
        { value: "P", label: "Perempuan" },
    ];

    const statusOptions = [
        { value: "active", label: "Aktif" },
        { value: "inactive", label: "Nonaktif" },
    ];

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <>
                    <IconUser size={20} className="text-emerald-500" />
                    <span>{isEdit ? "Ubah Data Member" : "Tambah Member Baru"}</span>
                </>
            }
            className="sm:max-w-lg"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                    {/* Kode Member */}
                    <FormInput<MemberInput>
                        name="kode"
                        label="Kode Member (Opsional)"
                        placeholder="Dibuat otomatis jika dikosongkan..."
                        disabled={isPending}
                    />

                    {/* Nama */}
                    <FormInput<MemberInput>
                        name="nama"
                        label="Nama Member *"
                        placeholder="Masukkan nama lengkap member..."
                        disabled={isPending}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Email */}
                    <FormInput<MemberInput>
                        name="email"
                        label="Email"
                        placeholder="nama@email.com..."
                        disabled={isPending}
                    />

                    {/* Nomor Telepon */}
                    <FormInput<MemberInput>
                        name="nomor_telepon"
                        label="No. Telepon"
                        placeholder="081234567890..."
                        disabled={isPending}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Jenis Kelamin */}
                    <FormSelect<MemberInput>
                        name="jenis_kelamin"
                        label="Jenis Kelamin"
                        options={genderOptions}
                        placeholder="Pilih jenis kelamin..."
                        disabled={isPending}
                    />

                    {/* Tanggal Lahir */}
                    <FormDatePicker<MemberInput>
                        name="tanggal_lahir"
                        label="Tanggal Lahir"
                        placeholder="Pilih tanggal lahir..."
                        disabled={isPending}
                    />
                </div>

                <div className={pointSystemEnabled ? "grid grid-cols-2 gap-4" : "grid grid-cols-1 gap-4"}>
                    {/* Poin */}
                    {pointSystemEnabled && (
                        <FormInput<MemberInput>
                            name="poin"
                            label="Poin Awal"
                            type="number"
                            placeholder="0"
                            disabled={isPending || isEdit} // only allowed on create, or standard edit
                            onChange={(e) => {
                                // Convert to number
                                const val = e.target.value;
                                return val === "" ? 0 : Number(val);
                            }}
                        />
                    )}

                    {/* Status */}
                    <FormSelect<MemberInput>
                        name="status"
                        label="Status"
                        options={statusOptions}
                        placeholder="Pilih status..."
                        disabled={isPending}
                    />
                </div>

                {/* Alamat */}
                <FormTextarea<MemberInput>
                    name="alamat"
                    label="Alamat Lengkap"
                    placeholder="Masukkan alamat tinggal member..."
                    disabled={isPending}
                />

                <Button
                    type="submit"
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer mt-4 border-none"
                    disabled={isPending}
                >
                    {isPending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Member"}
                </Button>
            </form>
        </BaseDialog>
    );
}

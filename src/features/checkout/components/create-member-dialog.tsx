"use client";

import React, { useEffect } from "react";
import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { memberSchema, type MemberInput } from "@/features/members/schemas/member-schema";
import { useCreateMember } from "@/features/members/api/members-api";
import { BaseDialog } from "@/components/ui/base-dialog";
import { FormInput } from "@/components/forms/form-input";
import { FormTextarea } from "@/components/forms/form-textarea";
import { Button } from "@/components/ui/button";
import { IconUser } from "@tabler/icons-react";
import { toast } from "sonner";
import type { Member } from "@/features/members/types";

interface CreateMemberDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (member: Member) => void;
}

export function CreateMemberDialog({
    open,
    onOpenChange,
    onSuccess,
}: CreateMemberDialogProps) {
    const createMember = useCreateMember();

    const methods = useForm<MemberInput>({
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

    const { reset, handleSubmit } = methods;

    useEffect(() => {
        if (open) {
            reset({
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
        }
    }, [open, reset]);

    const onSubmit = (data: MemberInput) => {
        createMember.mutate(data, {
            onSuccess: (res) => {
                toast.success("Member baru berhasil dibuat!");
                if (res.data) {
                    onSuccess(res.data);
                }
                onOpenChange(false);
            },
            onError: (err) => {
                toast.error(err.message || "Gagal membuat member baru.");
            },
        });
    };

    const isPending = createMember.isPending;

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <>
                    <IconUser size={18} className="text-emerald-500" />
                    <span>Tambah Member Baru</span>
                </>
            }
            className="max-w-md"
        >
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Nama Member */}
                    <FormInput<MemberInput>
                        name="nama"
                        label="Nama Lengkap Member *"
                        placeholder="Masukkan nama lengkap..."
                        disabled={isPending}
                    />

                    {/* No. Telepon */}
                    <FormInput<MemberInput>
                        name="nomor_telepon"
                        label="Nomor Telepon"
                        placeholder="Contoh: 081234567890..."
                        disabled={isPending}
                    />

                    {/* Email */}
                    <FormInput<MemberInput>
                        name="email"
                        label="Email"
                        placeholder="Contoh: member@email.com..."
                        disabled={isPending}
                    />

                    {/* Alamat */}
                    <FormTextarea<MemberInput>
                        name="alamat"
                        label="Alamat Lengkap"
                        placeholder="Masukkan alamat tinggal..."
                        disabled={isPending}
                        rows={2}
                    />

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1 h-11 border-slate-200 text-slate-500 rounded-xl"
                            disabled={isPending}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold border-none"
                            disabled={isPending}
                        >
                            {isPending ? "Menyimpan..." : "Buat Member"}
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </BaseDialog>
    );
}

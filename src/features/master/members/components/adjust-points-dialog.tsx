"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { Button } from "@/components/ui/button";
import { BaseDialog } from "@/components/ui/base-dialog";
import { IconAward, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";
import { useUpdateMemberPoints } from "../api/members-api";
import type { Member } from "../types";

const adjustPointsSchema = z.object({
    type: z.enum(["add", "subtract"]),
    points: z
        .number({ error: "Jumlah poin wajib diisi" })
        .min(1, "Jumlah poin minimal 1"),
    note: z
        .string()
        .min(1, "Catatan wajib diisi")
        .max(255, "Catatan maksimal 255 karakter"),
});

type AdjustPointsInput = z.infer<typeof adjustPointsSchema>;

interface AdjustPointsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    member: Member | null;
}

export function AdjustPointsDialog({ open, onOpenChange, member }: AdjustPointsDialogProps) {
    const updatePoints = useUpdateMemberPoints();

    const methods = useForm<AdjustPointsInput>({
        resolver: zodResolver(adjustPointsSchema),
        defaultValues: {
            type: "add",
            points: 0,
            note: "",
        },
    });

    const { handleSubmit, reset, formState: { isSubmitting } } = methods;

    const onSubmit = (data: AdjustPointsInput) => {
        if (!member) return;

        updatePoints.mutate(
            {
                uid: member.uid,
                data: {
                    type: data.type,
                    points: data.points,
                    note: data.note,
                },
            },
            {
                onSuccess: (res) => {
                    toast.success(
                        `Berhasil ${data.type === "add" ? "menambah" : "mengurangi"} poin member. Poin sekarang: ${res.data?.poin ?? 0}`
                    );
                    reset();
                    onOpenChange(false);
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal menyesuaikan poin member.");
                },
            }
        );
    };

    const typeOptions = [
        { value: "add", label: "Tambah Poin" },
        { value: "subtract", label: "Kurangi Poin" },
    ];

    return (
        <BaseDialog
            open={open}
            onOpenChange={(val) => {
                if (!val) reset();
                onOpenChange(val);
            }}
            title={
                <div className="flex items-center gap-2 select-none">
                    <IconAward size={20} className="text-emerald-600" />
                    <span>Sesuaikan Poin Member</span>
                </div>
            }
            className="sm:max-w-md"
        >
            {member && (
                <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-xl mb-4 text-xs">
                    <div className="font-bold text-slate-800">{member.nama}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                        Kode: {member.kode} • Poin Saat Ini: <span className="font-black text-emerald-600">{member.poin} Poin</span>
                    </div>
                </div>
            )}

            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
                    <FormSelect<AdjustPointsInput>
                        name="type"
                        label="Tipe Penyesuaian"
                        options={typeOptions}
                        placeholder="Pilih tipe..."
                        disabled={isSubmitting}
                    />

                    <FormInput<AdjustPointsInput>
                        name="points"
                        label="Jumlah Poin"
                        type="number"
                        placeholder="Masukkan jumlah poin..."
                        disabled={isSubmitting}
                        onChange={(e) => {
                            const val = e.target.value;
                            return val === "" ? 0 : Number(val);
                        }}
                    />

                    <FormInput<AdjustPointsInput>
                        name="note"
                        label="Catatan / Keterangan"
                        placeholder="Contoh: Bonus pembelian, Refund..."
                        disabled={isSubmitting}
                    />

                    <Button
                        type="submit"
                        className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer mt-4 border-none shadow-md"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <IconLoader2 size={16} className="animate-spin" />
                        ) : (
                            <span>Simpan Penyesuaian</span>
                        )}
                    </Button>
                </form>
            </FormProvider>
        </BaseDialog>
    );
}

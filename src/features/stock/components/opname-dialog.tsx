"use client";

import { useEffect } from "react";
import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BaseDialog } from "@/components/ui/base-dialog";
import { FormInput } from "@/components/forms/form-input";
import { Button } from "@/components/ui/button";
import { IconClipboardCheck } from "@tabler/icons-react";
import { toast } from "sonner";
import { opnameHeaderSchema, type OpnameHeaderInput } from "../schemas/opname-schema";
import { useCreateOpname } from "../api/stock-api";
import { useAppRouter } from "@/hooks/use-app-router";

interface OpnameDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function OpnameDialog({
    open,
    onOpenChange,
}: OpnameDialogProps) {
    const router = useAppRouter();
    const createOpname = useCreateOpname();

    const methods = useForm<OpnameHeaderInput>({
        resolver: zodResolver(opnameHeaderSchema) as Resolver<OpnameHeaderInput>,
        defaultValues: {
            catatan: "",
        },
    });

    const {
        handleSubmit,
        reset,
    } = methods;

    useEffect(() => {
        if (open) {
            reset({
                catatan: "",
            });
        }
    }, [open, reset]);

    const isPending = createOpname.isPending;

    const onSubmit = (data: OpnameHeaderInput) => {
        createOpname.mutate(data, {
            onSuccess: (res) => {
                toast.success("Draft stock opname berhasil dibuat!");
                onOpenChange(false);
                // Redirect immediately to the items editor page
                router.push(`/admin/inventory/stock-opname/${res.data.uid}/items`);
            },
            onError: (err) => {
                toast.error(err.message || "Gagal membuat stock opname.");
            },
        });
    };

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <>
                    <IconClipboardCheck
                        size={20}
                        className="text-emerald-500"
                    />
                    <span>Stock Opname Baru</span>
                </>
            }
            className="sm:max-w-md flex flex-col max-h-[90vh]"
        >
            <FormProvider {...methods}>
                <form
                    className="flex flex-col flex-1 overflow-hidden min-h-0 pt-4"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <div className="flex-1 overflow-y-auto p-2 space-y-4 pb-4">
                        {/* Catatan */}
                        <FormInput<OpnameHeaderInput>
                            name="catatan"
                            label="Catatan Opname"
                            placeholder="Contoh: Opname Bulanan Akhir Juni 2026..."
                            disabled={isPending}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 shrink-0 bg-white">
                        <Button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center cursor-pointer border-none"
                            disabled={isPending}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center cursor-pointer shadow-sm shadow-emerald-600/15 border-none"
                            disabled={isPending}
                        >
                            {isPending ? "Memproses..." : "Buat Stock Opname"}
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </BaseDialog>
    );
}

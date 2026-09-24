"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { AppButton } from "@/components/shared/app-button";
import {
    IconClipboard,
    IconEye,
    IconEyeOff,
    IconInfoCircle,
    IconKey,
} from "@tabler/icons-react";
import {
    activateLicenseSchema,
    type ActivateLicenseInput,
} from "../schemas/license-schema";
import { useLicenseActivateMutation } from "../api/license-api";
import { toast } from "sonner";

interface LicenseActivateFormProps {
    /** Called after successful activation so parent can react (e.g. switch tab or close dialog) */
    onSuccess?: () => void;
    /** If true, renders as compact inline form without outer container card */
    compact?: boolean;
}

export function LicenseActivateForm({ onSuccess, compact = false }: LicenseActivateFormProps) {
    const [showKey, setShowKey] = useState(false);
    const { mutate, isPending } = useLicenseActivateMutation();

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        reset,
    } = useForm<ActivateLicenseInput>({
        resolver: zodResolver(activateLicenseSchema),
        defaultValues: { license_key: "", instance_name: "" },
    });

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                setValue("license_key", text.trim(), { shouldValidate: true });
                toast.success("Kunci lisensi berhasil ditempel");
            }
        } catch {
            toast.error("Gagal membaca papan klip. Silakan tempel secara manual.");
        }
    };

    const onSubmit = (data: ActivateLicenseInput) => {
        mutate(
            {
                license_key: data.license_key,
                instance_name: data.instance_name || undefined,
            },
            {
                onSuccess: () => {
                    reset();
                    onSuccess?.();
                },
            },
        );
    };

    const form = (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Kunci Lisensi <span className="text-rose-500">*</span>
                    </label>
                    <button
                        type="button"
                        onClick={() => void handlePaste()}
                        className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                        <IconClipboard size={12} />
                        <span>Tempel Kunci</span>
                    </button>
                </div>
                <div className="relative group">
                    <IconKey
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors pointer-events-none"
                    />
                    <Input
                        type={showKey ? "text" : "password"}
                        placeholder="Contoh: LIC-POS-XXXXXXXXXX"
                        className="pl-8 pr-9 h-10 font-mono text-xs rounded-xl border-slate-200 focus-visible:ring-emerald-500"
                        disabled={isPending}
                        {...register("license_key")}
                    />
                    <button
                        type="button"
                        onClick={() => setShowKey((v) => !v)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                        tabIndex={-1}
                        title={showKey ? "Sembunyikan" : "Tampilkan"}
                    >
                        {showKey ? <IconEyeOff size={14} /> : <IconEye size={14} />}
                    </button>
                </div>
                {errors.license_key ? (
                    <p className="text-[11px] text-rose-500 font-medium">{errors.license_key.message}</p>
                ) : (
                    <p className="text-[10px] text-slate-400">
                        Masukkan format kunci lisensi resmi yang tertera pada faktur atau email konfirmasi langganan.
                    </p>
                )}
            </div>

            <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                    Nama Cabang / Instalasi <span className="text-slate-400 font-normal lowercase">(opsional)</span>
                </label>
                <Input
                    type="text"
                    placeholder="Contoh: Toko Pusat - Jakarta"
                    className="h-10 text-xs rounded-xl border-slate-200 focus-visible:ring-emerald-500"
                    disabled={isPending}
                    {...register("instance_name")}
                />
                {errors.instance_name ? (
                    <p className="text-[11px] text-rose-500 font-medium">{errors.instance_name.message}</p>
                ) : (
                    <p className="text-[10px] text-slate-400">
                        Nama identifikasi cabang untuk memudahkan pengelolaan lisensi toko Anda.
                    </p>
                )}
            </div>

            <AppButton
                type="submit"
                className="w-full h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                isLoading={isPending}
                loadingText="Memverifikasi Lisensi..."
            >
                Aktivasi Lisensi
            </AppButton>
        </form>
    );

    if (compact) return form;

    return (
        <div className="max-w-md mx-auto py-2 space-y-4">
            <div className="border border-slate-200/80 rounded-2xl bg-white overflow-hidden shadow-[0_2px_12px_rgba(15,23,42,0.02)]">
                <div className="p-4 border-b border-slate-100 flex items-center gap-2.5 bg-slate-50/50">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/70 shrink-0">
                        <IconKey size={16} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-800 tracking-tight">
                            Aktivasi Lisensi POS
                        </h4>
                        <p className="text-[11px] text-slate-400 font-medium">
                            Masukkan kunci lisensi untuk mengaktifkan modul operasional dan akses kasir toko.
                        </p>
                    </div>
                </div>
                <div className="p-4">{form}</div>
            </div>

            {/* Help Callout */}
            <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-3 flex items-start gap-2.5 text-xs text-slate-600">
                <IconInfoCircle size={16} className="text-slate-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="font-bold text-slate-700 text-[11px]">
                        Panduan Kunci Lisensi
                    </p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                        Kunci lisensi diterbitkan secara otomatis setelah konfirmasi pembayaran paket langganan. Jika Anda membutuhkan bantuan teknis, silakan hubungi tim dukungan kami di{" "}
                        <a
                            href="mailto:support@mitrasovapos.my.id"
                            className="text-emerald-600 font-bold underline hover:text-emerald-700"
                        >
                            support@mitrasovapos.my.id
                        </a>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconAlertCircle, IconCircleCheck, IconLoader2 } from "@tabler/icons-react";
import { useFinalizeProduction } from "../api/production-api";

interface ProductionFinalizeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productionUid: string | null;
    nomorProduksi?: string;
    onSuccess?: () => void;
}

export function ProductionFinalizeDialog({
    open,
    onOpenChange,
    productionUid,
    nomorProduksi,
    onSuccess,
}: ProductionFinalizeDialogProps) {
    const today = new Date().toISOString().split("T")[0];
    const [tanggalSelesai, setTanggalSelesai] = useState<string>(today);
    const finalizeMutation = useFinalizeProduction();

    const handleFinalize = async () => {
        if (!productionUid) return;

        finalizeMutation.mutate(
            {
                uid: productionUid,
                data: {
                    tanggal_selesai: tanggalSelesai ? new Date(tanggalSelesai).toISOString() : undefined,
                },
            },
            {
                onSuccess: (res) => {
                    toast.success(res.message || "Produksi berhasil difinalisasi!");
                    onOpenChange(false);
                    onSuccess?.();
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal memfinalisasi produksi.");
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-white rounded-2xl p-6 gap-0 border-slate-100 shadow-xl overflow-hidden">
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full border border-emerald-100 bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                        <IconCircleCheck size={26} stroke={2} />
                    </div>

                    <DialogHeader className="gap-1 mb-2">
                        <DialogTitle className="text-base font-bold text-slate-900">
                            Finalisasi Produksi
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500 max-w-sm leading-normal">
                            {nomorProduksi ? (
                                <span>
                                    Selesaikan draft produksi{" "}
                                    <span className="font-mono font-bold text-slate-800">
                                        #{nomorProduksi}
                                    </span>
                                    ?
                                </span>
                            ) : (
                                "Apakah Anda yakin ingin menyelesaikan draft produksi ini?"
                            )}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="mt-4 space-y-4">
                    {/* Information Note */}
                    <div className="flex items-start gap-2 bg-emerald-50/60 border border-emerald-200/60 rounded-xl p-3 text-emerald-900 text-xs leading-relaxed">
                        <IconAlertCircle size={17} className="text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-bold block">Pemberitahuan Sistem:</span>
                            Finalisasi akan memotong stok bahan baku, menambah stok barang jadi, menghitung HPP aktual, dan mencatat transaksi ke jurnal GL.
                        </div>
                    </div>

                    {/* Tanggal Selesai Picker */}
                    <div className="space-y-1.5">
                        <label htmlFor="tanggal_selesai" className="text-xs font-bold text-slate-700 block">
                            Tanggal Selesai Produksi
                        </label>
                        <Input
                            id="tanggal_selesai"
                            type="date"
                            value={tanggalSelesai}
                            onChange={(e) => setTanggalSelesai(e.target.value)}
                            className="h-10 rounded-xl border-slate-200 text-xs"
                            disabled={finalizeMutation.isPending}
                        />
                        <span className="text-[10px] text-slate-400 block">
                            Tanggal penyelesaian riil barang jadi siap digunakan/didistribusikan.
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="w-full flex flex-col sm:flex-row gap-2.5 mt-6">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto flex-1 h-10 text-xs font-bold border-slate-200 hover:bg-slate-50 rounded-xl cursor-pointer order-2 sm:order-1"
                        onClick={() => onOpenChange(false)}
                        disabled={finalizeMutation.isPending}
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        className="w-full sm:w-auto flex-1 h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-600/20 order-1 sm:order-2"
                        onClick={handleFinalize}
                        disabled={finalizeMutation.isPending}
                    >
                        {finalizeMutation.isPending && (
                            <IconLoader2 size={14} className="animate-spin" />
                        )}
                        <span>Selesaikan Produksi</span>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

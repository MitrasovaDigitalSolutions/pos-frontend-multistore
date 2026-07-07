"use client";

import { useState, useEffect } from "react";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CommandSelect } from "@/components/ui/command-select";
import { IconCash, IconCreditCard, IconLoader2, IconUser } from "@tabler/icons-react";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { usePayMemberDebt, type PayDebtPayload } from "@/features/members/api/members-api";
import { toast } from "sonner";
import type { Member } from "@/features/members/types";

import { db } from "@/lib/db";

interface PayDebtDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    member: Member | null;
    onSuccess?: (updatedMember: Member) => void;
}

export function PayDebtDialog({ open, onOpenChange, member, onSuccess }: PayDebtDialogProps) {
    const payDebtMutation = usePayMemberDebt();

    const [amount, setAmount] = useState("");
    const [payMethod, setPayMethod] = useState<"cash" | "card">("cash");
    const [cashReceived, setCashReceived] = useState("");
    const [cardType, setCardType] = useState<"debit" | "kredit">("debit");
    const [cardLast4, setCardLast4] = useState("");
    const [cardRef, setCardRef] = useState("");
    const [catatan, setCatatan] = useState("");

    // Reset form when dialog opens/closes or member changes
    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        if (open && member) {
            setAmount((member.hutang || 0).toString());
            setPayMethod("cash");
            setCashReceived("");
            setCardLast4("");
            setCardRef("");
            setCatatan("");
        }
    }, [open, member]);
    /* eslint-enable react-hooks/set-state-in-effect */

    if (!member) return null;

    const currentDebt = member.hutang || 0;
    const payAmountNum = Number(amount) || 0;
    const cashReceivedNum = cashReceived === "" ? payAmountNum : (Number(cashReceived) || 0);

    // Validation
    const isAmountValid = payAmountNum > 0 && payAmountNum <= currentDebt;
    const isCashValid = payMethod === "cash" && cashReceivedNum >= payAmountNum;
    const isCardValid = payMethod === "card" && cardLast4.length === 4;

    const isValid = isAmountValid && (payMethod === "cash" ? isCashValid : isCardValid);
    const isPending = payDebtMutation.isPending;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) return;

        const payload: PayDebtPayload = {
            amount: payAmountNum,
            metode_pembayaran: payMethod,
            catatan: catatan || undefined,
        };

        if (payMethod === "cash") {
            payload.cash_received = cashReceivedNum;
        } else {
            payload.jenis_kartu = cardType;
            payload.nomor_kartu_akhir = cardLast4;
            payload.referensi_edc = cardRef || undefined;
        }

        payDebtMutation.mutate(
            { uid: member.uid, data: payload },
            {
                onSuccess: (res) => {
                    toast.success(`Pembayaran hutang member ${member.nama} berhasil dicatat.`);
                    onOpenChange(false);
                    if (res.data?.member) {
                        const updatedMember = res.data.member;
                        db.members.update(updatedMember.uid, {
                            hutang: updatedMember.hutang || 0,
                            poin: updatedMember.poin || 0,
                        }).catch((err) => {
                            console.warn("Gagal memperbarui member di IndexedDB:", err);
                        });
                        if (onSuccess) {
                            onSuccess(updatedMember);
                        }
                    }
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal mencatat pembayaran hutang.");
                },
            }
        );
    };

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div className="flex items-center gap-2">
                    <IconCash size={20} className="text-emerald-500" />
                    <span>Catat Pembayaran Hutang</span>
                </div>
            }
            className="sm:max-w-md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Member detail card */}
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <IconUser size={16} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 leading-tight">{member.nama}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">{member.kode}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Hutang</span>
                        <h4 className="font-extrabold text-rose-600 text-sm mt-0.5">{formatRupiah(currentDebt)}</h4>
                    </div>
                </div>

                {/* Amount to pay */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Jumlah Pembayaran (Bayar Cicilan / Pelunasan)
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                            Rp
                        </span>
                        <Input
                            type="text"
                            placeholder="Masukkan nominal pembayaran..."
                            className="h-11 pl-9 pr-24 font-bold text-slate-800 border-slate-200 focus-visible:ring-emerald-500 rounded-xl"
                            value={
                                amount
                                    ? new Intl.NumberFormat("id-ID").format(Number(amount))
                                    : ""
                            }
                            onChange={(e) => {
                                const clean = e.target.value.replace(/\D/g, "");
                                if (Number(clean) > currentDebt) {
                                    setAmount(currentDebt.toString());
                                    toast.warning("Pembayaran tidak boleh melebihi total hutang.");
                                } else {
                                    setAmount(clean);
                                }
                            }}
                            disabled={isPending}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => {
                                setAmount(currentDebt.toString());
                                setCashReceived("");
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-extrabold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100/70 border-none px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                            disabled={isPending}
                        >
                            Bayar Lunas
                        </button>
                    </div>
                </div>

                {/* Payment Method toggle */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Metode Pembayaran
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setPayMethod("cash");
                                setCashReceived("");
                            }}
                            className={`h-10 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all border-none ${payMethod === "cash"
                                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
                                : "bg-slate-50 hover:bg-slate-100 text-slate-600"
                                }`}
                            disabled={isPending}
                        >
                            <IconCash size={15} /> TUNAI (CASH)
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setPayMethod("card");
                                setCashReceived("");
                            }}
                            className={`h-10 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all border ${payMethod === "card"
                                ? "bg-slate-700 text-white border-slate-700 shadow-md shadow-slate-700/10"
                                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                                }`}
                            disabled={isPending}
                        >
                            <IconCreditCard size={15} /> KARTU / EDC
                        </button>
                    </div>
                </div>


                {/* Conditional Fields: Card */}
                {payMethod === "card" && (
                    <div className="space-y-3 bg-slate-50/50 border border-slate-100 p-4 rounded-xl text-xs">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Jenis Kartu
                            </label>
                            <CommandSelect
                                options={[
                                    { value: "debit", label: "Debit" },
                                    { value: "kredit", label: "Kredit" },
                                ]}
                                value={cardType}
                                onChange={(val: string) => setCardType(val as "debit" | "kredit")}
                                disabled={isPending}
                                className="h-9"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                4 Digit Terakhir Nomor Kartu
                            </label>
                            <Input
                                type="text"
                                maxLength={4}
                                placeholder="XXXX"
                                className="h-9 border-slate-200 focus-visible:ring-emerald-500 rounded-xl tracking-widest text-center font-mono"
                                value={cardLast4}
                                onChange={(e) =>
                                    setCardLast4(e.target.value.replace(/\D/g, "").slice(0, 4))
                                }
                                disabled={isPending}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Referensi EDC (Opsional)
                            </label>
                            <Input
                                type="text"
                                placeholder="Masukkan nomor referensi EDC..."
                                className="h-9 text-xs border-slate-200 focus-visible:ring-emerald-500 rounded-xl bg-white"
                                value={cardRef}
                                onChange={(e) => setCardRef(e.target.value)}
                                disabled={isPending}
                            />
                        </div>
                    </div>
                )}

                {/* Catatan */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Catatan (Opsional)
                    </label>
                    <Input
                        type="text"
                        placeholder="Contoh: Pembayaran cicilan pertama, Pelunasan..."
                        className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-500 rounded-xl"
                        value={catatan}
                        onChange={(e) => setCatatan(e.target.value)}
                        disabled={isPending}
                    />
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="h-10 border-slate-200 hover:bg-slate-50 text-xs font-bold rounded-xl cursor-pointer"
                        disabled={isPending}
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        disabled={!isValid || isPending}
                        className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border-none cursor-pointer shadow-md shadow-emerald-600/10"
                    >
                        {isPending && <IconLoader2 size={14} className="animate-spin" />}
                        <span>Simpan Pembayaran</span>
                    </Button>
                </div>
            </form>
        </BaseDialog>
    );
}

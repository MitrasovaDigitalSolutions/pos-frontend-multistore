"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useOpnameDetail } from "../api/stock-api";

interface OpnameDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    opnameId: number | null;
}

export function OpnameDetailDialog({
    open,
    onOpenChange,
    opnameId,
}: OpnameDetailDialogProps) {
    const { data: selectedOpname, isLoading } = useOpnameDetail(opnameId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-125 bg-white rounded-2xl border-slate-100 p-6">
                <DialogHeader className="pb-4 border-b border-slate-100">
                    <DialogTitle className="text-sm font-bold text-slate-900">
                        Detail Stock Opname:{" "}
                        {selectedOpname?.nomor_opname || "Memuat..."}
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                        Memuat detail opname...
                    </div>
                ) : selectedOpname ? (
                    <div className="space-y-4 pt-4">
                        <div>
                            <p className="text-xs text-slate-500">
                                Catatan:{" "}
                                <strong className="text-slate-800">
                                    {selectedOpname.catatan || "-"}
                                </strong>
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                Status:{" "}
                                <strong className="text-slate-800 capitalize">
                                    {selectedOpname.status}
                                </strong>
                            </p>
                        </div>

                        <Table className="w-full">
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="text-[10px] font-bold text-slate-500">
                                        Nama Produk
                                    </TableHead>
                                    <TableHead className="text-right text-[10px] font-bold text-slate-500">
                                        Sistem
                                    </TableHead>
                                    <TableHead className="text-right text-[10px] font-bold text-slate-500">
                                        Fisik
                                    </TableHead>
                                    <TableHead className="text-right text-[10px] font-bold text-slate-500">
                                        Selisih
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedOpname.items &&
                                selectedOpname.items.length > 0 ? (
                                    selectedOpname.items.map((it) => (
                                        <TableRow key={it.id}>
                                            <TableCell className="text-xs font-semibold text-slate-800">
                                                {it.product?.nama ||
                                                    "Produk ID: " +
                                                        it.product_id}
                                            </TableCell>
                                            <TableCell className="text-right text-xs text-slate-500">
                                                {it.stok_sistem} pcs
                                            </TableCell>
                                            <TableCell className="text-right text-xs text-slate-800 font-bold">
                                                {it.stok_fisik} pcs
                                            </TableCell>
                                            <TableCell
                                                className={`text-right text-xs font-bold ${
                                                    it.selisih === 0
                                                        ? "text-slate-500"
                                                        : it.selisih > 0
                                                          ? "text-emerald-600"
                                                          : "text-rose-500"
                                                }`}
                                            >
                                                {it.selisih > 0
                                                    ? `+${it.selisih}`
                                                    : it.selisih}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="text-center py-4 text-slate-400 text-xs"
                                        >
                                            Tidak ada item tercatat.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="text-center py-8 text-rose-500 text-xs">
                        Gagal memuat detail opname.
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

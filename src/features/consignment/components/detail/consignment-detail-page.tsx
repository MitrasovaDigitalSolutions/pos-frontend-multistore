"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { formatToReadableDateTime } from "@/lib/date-utils";
import {
  IconArrowLeft,
  IconBan,
  IconCash,
  IconCheck,
  IconEdit,
  IconPackage,
  IconPrinter
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  useCompleteConsignmentMutation,
  useConsignmentReceivingDetail,
  useVoidConsignmentMutation,
} from "../../api/consignment-api";
import { CONSIGNMENT_STATUS_BADGE } from "../../constants";

interface ConsignmentDetailPageProps {
  uid: string;
}

export function ConsignmentDetailPage({ uid }: ConsignmentDetailPageProps) {
  const router = useRouter();
  const { data: item, isLoading } = useConsignmentReceivingDetail(uid);

  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isVoidOpen, setIsVoidOpen] = useState(false);

  const completeMutation = useCompleteConsignmentMutation();
  const voidMutation = useVoidConsignmentMutation();

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs font-semibold text-slate-500">
        Memuat detail konsinyasi...
      </div>
    );
  }

  if (!item) {
    return (
      <div className="p-12 text-center text-xs font-semibold text-slate-500">
        Data konsinyasi tidak ditemukan.
      </div>
    );
  }

  const isDraft = item.status === "draft";
  const isCompleted = item.status === "completed";
  const isClosed = item.status === "closed";
  const isVoid = item.status === "void";

  const statusInfo = CONSIGNMENT_STATUS_BADGE[item.status] || { label: item.status, variant: "secondary" };
  const hasPayments = item.payments && item.payments.length > 0;
  const hasSales = item.items?.some((i) => (i.qty_terjual || 0) > 0);

  const totalNilai =
    item.items?.reduce(
      (acc, it) => acc + Number(it.kuantitas || 0) * Number(it.harga_beli || 0),
      0
    ) || 0;

  const handleComplete = async () => {
    try {
      await completeMutation.mutateAsync(item.uid);
      toast.success(`Konsinyasi ${item.nomor_konsinyasi} berhasil diselesaikan.`);
      setIsCompleteOpen(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(error?.response?.data?.message || error?.message || "Gagal menyelesaikan konsinyasi.");
    }
  };

  const handleVoid = async () => {
    try {
      await voidMutation.mutateAsync(item.uid);
      toast.success(`Konsinyasi ${item.nomor_konsinyasi} berhasil dibatalkan.`);
      setIsVoidOpen(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(error?.response?.data?.message || error?.message || "Gagal membatalkan konsinyasi.");
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/consignment")}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 gap-1.5 rounded-xl cursor-pointer"
        >
          <IconArrowLeft size={16} />
          <span>Kembali ke Daftar Konsinyasi</span>
        </Button>

        <div className="flex items-center gap-2">
          {isDraft && (
            <>
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/consignment/${item.uid}/edit`)}
                className="h-9 text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl gap-1.5 cursor-pointer"
              >
                <IconEdit size={15} />
                <span>Edit Draft</span>
              </Button>
              <Button
                onClick={() => setIsCompleteOpen(true)}
                className="h-9 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-1.5 cursor-pointer shadow-2xs"
              >
                <IconCheck size={15} />
                <span>Selesaikan (Complete)</span>
              </Button>
            </>
          )}

          {isCompleted && (
            <>
              <Button
                onClick={() => router.push(`/admin/consignment/payment?uid=${item.uid}`)}
                className="h-9 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-1.5 cursor-pointer shadow-2xs"
              >
                <IconCash size={15} />
                <span>Bayar & Tutup Sesi</span>
              </Button>

              {!hasSales && !hasPayments && (
                <Button
                  variant="outline"
                  onClick={() => setIsVoidOpen(true)}
                  className="h-9 text-xs font-bold border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl gap-1.5 cursor-pointer"
                >
                  <IconBan size={15} />
                  <span>Batalkan (Void)</span>
                </Button>
              )}
            </>
          )}

          <Button
            variant="outline"
            onClick={() => window.print()}
            className="h-9 text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl gap-1.5 cursor-pointer"
          >
            <IconPrinter size={15} />
            <span>Cetak</span>
          </Button>
        </div>
      </div>

      {/* Header Info Banner */}
      <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-2xs space-y-4">
        {isClosed && (
          <div className="bg-slate-50 border border-slate-200 text-slate-700 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
            <IconCheck size={16} className="text-emerald-600 shrink-0" />
            <span>Sesi konsinyasi ini telah <strong>ditutup & lunas</strong>. Sisa barang titipan yang belum laku telah otomatis dikembalikan ke supplier.</span>
          </div>
        )}

        {isVoid && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
            <IconBan size={16} className="text-rose-600 shrink-0" />
            <span>Penerimaan konsinyasi ini telah <strong>dibatalkan (Void)</strong>. Stok fisik barang telah ditarik kembali dari sistem.</span>
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-bold text-emerald-600">
                {item.nomor_konsinyasi}
              </span>
              <Badge variant={statusInfo.variant} className="px-2.5 py-0.5 text-xs font-bold">
                {statusInfo.label}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Diterima pada: {formatToReadableDateTime(item.tanggal_terima || item.created_at)}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-medium text-slate-400 block">Total Nilai Titipan</span>
            <span className="text-xl font-bold text-slate-900">{formatRupiah(totalNilai)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Supplier / Pemasok:</span>
            <span className="font-bold text-slate-800">
              {item.supplier || item.supplier_relationship?.nama || "—"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Pencatat / User:</span>
            <span className="font-bold text-slate-800">{item.user?.nama || "—"}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Sisa Hutang:</span>
            <span className="font-bold text-rose-600">
              {item.sisa_hutang ? formatRupiah(item.sisa_hutang) : "Rp 0 (Lunas)"}
            </span>
          </div>
        </div>

        {item.catatan && (
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600">
            <span className="font-bold">Catatan:</span> {item.catatan}
          </div>
        )}
      </div>

      {/* Items Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-2xs p-6 space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <IconPackage size={18} className="text-emerald-600" />
          <span>Daftar Barang Titipan</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold">
                <th className="py-2.5 px-3 text-left">Produk</th>
                <th className="py-2.5 px-3 text-center">Qty Titipan</th>
                <th className="py-2.5 px-3 text-center">Qty Terjual</th>
                <th className="py-2.5 px-3 text-center">Qty Diretur</th>
                <th className="py-2.5 px-3 text-center">Sisa Titipan</th>
                <th className="py-2.5 px-3 text-right">Harga Beli</th>
                <th className="py-2.5 px-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {item.items?.map((it, idx) => {
                const qty = Number(it.kuantitas || 0);
                const price = Number(it.harga_beli || 0);
                const subtotal = qty * price;
                const sisa = it.sisa !== undefined ? it.sisa : qty - Number(it.qty_terjual || 0) - Number(it.qty_diretur || 0);

                return (
                  <tr key={it.uid || idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-800">{it.product?.nama || "Produk"}</span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-900">{qty} pcs</td>
                    <td className="py-3 px-3 text-center font-bold text-emerald-600">{it.qty_terjual || 0} pcs</td>
                    <td className="py-3 px-3 text-center font-bold text-amber-600">{it.qty_diretur || 0} pcs</td>
                    <td className="py-3 px-3 text-center font-bold text-slate-700">{sisa} pcs</td>
                    <td className="py-3 px-3 text-right font-medium text-slate-700">{formatRupiah(price)}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">{formatRupiah(subtotal)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment History Section */}
      {item.payments && item.payments.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-2xs p-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <IconCash size={18} className="text-emerald-600" />
            <span>Riwayat Pembayaran Konsinyasi</span>
          </h3>

          <div className="space-y-3">
            {item.payments.map((p) => (
              <div
                key={p.uid}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs gap-2"
              >
                <div>
                  <span className="font-mono font-bold text-emerald-600 block">{p.nomor_pembayaran}</span>
                  <span className="text-slate-500">
                    {formatToReadableDateTime(p.tanggal_bayar || p.created_at || "")} • Akun:{" "}
                    <strong className="text-slate-700">{p.cashAccount?.nama || p.metode_pembayaran}</strong>
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 text-sm block">{formatRupiah(p.jumlah_bayar)}</span>
                  <span className="text-emerald-600 font-semibold text-[11px]">Lunas (Sesi Ditutup)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dialogs */}
      <ConfirmDialog
        open={isCompleteOpen}
        onOpenChange={setIsCompleteOpen}
        title="Finalisasi Penerimaan Konsinyasi"
        description={`Selesaikan konsinyasi "${item.nomor_konsinyasi}"? Stok fisik produk akan bertambah (off-book).`}
        confirmText="Ya, Selesaikan"
        variant="success"
        isLoading={completeMutation.isPending}
        onConfirm={handleComplete}
      />

      <ConfirmDialog
        open={isVoidOpen}
        onOpenChange={setIsVoidOpen}
        title="Batalkan Konsinyasi"
        description={`Batalkan konsinyasi "${item.nomor_konsinyasi}"? Stok fisik akan dikembalikan.`}
        confirmText="Ya, Batalkan"
        variant="danger"
        isLoading={voidMutation.isPending}
        onConfirm={handleVoid}
      />
    </div>
  );
}

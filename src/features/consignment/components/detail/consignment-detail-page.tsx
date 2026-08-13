"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatToReadableDate } from "@/lib/date-utils";
import {
  IconArrowLeft,
  IconBan,
  IconCash,
  IconFileDescription,
} from "@tabler/icons-react";
import { useAppRouter } from "@/hooks/use-app-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  useCompleteConsignmentMutation,
  useConsignmentReceivingDetail,
  useDeleteConsignmentDraftMutation,
  useVoidConsignmentMutation,
} from "../../api/consignment-api";
import { CONSIGNMENT_STATUS_BADGE } from "../../constants";
import { ConsignmentCreatePage } from "../create/consignment-create-page";
import { ConsignmentDetailSkeleton } from "./consignment-detail-skeleton";
import { ConsignmentItemsTab } from "./consignment-items-tab";
import { ConsignmentPaymentsTab } from "./consignment-payments-tab";
import { ConsignmentSummaryCard } from "./consignment-summary-card";

interface ConsignmentDetailPageProps {
  uid: string;
}

export function ConsignmentDetailPage({ uid }: ConsignmentDetailPageProps) {
  const router = useAppRouter();
  const [activeTab, setActiveTab] = useState<"items" | "payments">("items");
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isVoidOpen, setIsVoidOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data: item, isLoading } = useConsignmentReceivingDetail(uid);

  const completeMutation = useCompleteConsignmentMutation();
  const voidMutation = useVoidConsignmentMutation();
  const deleteMutation = useDeleteConsignmentDraftMutation();

  if (isLoading) {
    return <ConsignmentDetailSkeleton />;
  }

  if (!item) {
    return (
      <div className="p-12 text-center bg-white border border-slate-100 rounded-2xl shadow-2xs max-w-md mx-auto my-12">
        <p className="text-sm font-bold text-slate-800">Detail Konsinyasi Tidak Ditemukan</p>
        <p className="text-xs text-slate-400 mt-1">
          Data konsinyasi yang Anda cari tidak ditemukan atau telah dihapus.
        </p>
        <Button
          onClick={() => router.push("/admin/consignment")}
          className="mt-4 bg-slate-900 text-white text-xs font-bold rounded-xl"
        >
          Kembali ke Daftar Konsinyasi
        </Button>
      </div>
    );
  }

  if (item.status === "draft") {
    return <ConsignmentCreatePage initialData={item} />;
  }

  const isCompleted = item.status === "completed";

  const statusInfo = CONSIGNMENT_STATUS_BADGE[item.status] || {
    label: item.status,
    variant: "secondary" as const,
  };
  const hasPayments = item.payments && item.payments.length > 0;
  const hasSales = item.items?.some((i) => (i.qty_terjual || 0) > 0);

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

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(item.uid);
      toast.success(`Draft konsinyasi ${item.nomor_konsinyasi} berhasil dihapus.`);
      setIsDeleteOpen(false);
      router.push("/admin/consignment");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(error?.response?.data?.message || error?.message || "Gagal menghapus draft.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header / Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            onClick={() => router.push("/admin/consignment")}
            variant="outline"
            className="p-2 h-9 w-9 rounded-xl border-slate-200 text-slate-500 hover:text-slate-900 bg-white cursor-pointer"
          >
            <IconArrowLeft size={18} />
          </Button>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Detail Konsinyasi: {item.nomor_konsinyasi}</span>
              <Badge variant={statusInfo.variant} className="px-2 py-0.5 text-[9px] font-bold">
                {statusInfo.label}
              </Badge>
            </h2>
            <p className="text-xs text-slate-400">
              Supplier: <span className="font-semibold text-slate-600">{item.supplier || item.supplier_relationship?.nama || "—"}</span> | Tanggal Terima: {formatToReadableDate(item.tanggal_terima || item.created_at)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
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
                  className="h-9 text-xs font-bold border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl gap-1.5 cursor-pointer bg-white"
                >
                  <IconBan size={15} />
                  <span>Batalkan (Void)</span>
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Content Layout Grid (Matching PO Detail Page) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Summary Card */}
        <div className="lg:col-span-4 space-y-6">
          <ConsignmentSummaryCard item={item} />
        </div>

        {/* Right Column: Tabbed Content Panel */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl shadow-2xs overflow-hidden flex flex-col">
          {/* Segmented Pill Tab Header */}
          <div className="border-b border-slate-100 bg-slate-50/50 p-2.5 sm:p-3 overflow-x-auto whitespace-nowrap scrollbar-none flex-nowrap">
            <div className="inline-flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-xl border border-slate-200/50 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("items")}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer shrink-0 ${
                  activeTab === "items"
                    ? "bg-white text-slate-900 font-extrabold shadow-2xs border border-slate-200/60"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
                }`}
              >
                <IconFileDescription
                  size={16}
                  className={activeTab === "items" ? "text-emerald-600" : "text-slate-400"}
                />
                <span>Daftar Barang Titipan</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold font-mono transition-colors ${
                    activeTab === "items"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200/80 text-slate-600"
                  }`}
                >
                  {item.items?.length || 0}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("payments")}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer shrink-0 ${
                  activeTab === "payments"
                    ? "bg-white text-slate-900 font-extrabold shadow-2xs border border-slate-200/60"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
                }`}
              >
                <IconCash
                  size={16}
                  className={activeTab === "payments" ? "text-emerald-600" : "text-slate-400"}
                />
                <span>Riwayat Pelunasan</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold font-mono transition-colors ${
                    activeTab === "payments"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200/80 text-slate-600"
                  }`}
                >
                  {item.payments?.length || 0}
                </span>
              </button>
            </div>
          </div>

          {/* Tab Content Body */}
          <div className="p-4 sm:p-5">
            {activeTab === "items" && <ConsignmentItemsTab items={item.items} />}
            {activeTab === "payments" && <ConsignmentPaymentsTab payments={item.payments} />}
          </div>
        </div>
      </div>

      {/* Confirmation Dialogs */}
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

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Hapus Draft Konsinyasi"
        description={`Apakah Anda yakin ingin menghapus draft konsinyasi "${item.nomor_konsinyasi}"?`}
        confirmText="Ya, Hapus"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}

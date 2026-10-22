"use client";

import { useState } from "react";
import Link from "next/link";
import { IconBuildingBank, IconHistory, IconPackage, IconReceipt2, IconRefresh } from "@tabler/icons-react";
import { AppButton } from "@/components/shared/app-button";
import { useQueryClient } from "@tanstack/react-query";
import { ROUTES } from "@/constants/routes";
import { useIsCentralStore } from "@/hooks/use-active-store";
import { REMITTANCE_QUERY_KEYS } from "../constants";
import { useUnsettledRemittanceSummary } from "../api/remittance-api";
import dynamic from "next/dynamic";
import { RemittanceStatCards } from "./remittance-stat-cards";

const TableSkeleton = () => (
  <div className="h-64 rounded-2xl bg-white border border-slate-100 p-6 animate-pulse flex items-center justify-center">
    <div className="h-4 w-32 bg-slate-100 rounded-lg" />
  </div>
);

// ─── Dynamic Tab Tables & Modal Dialog ───────────────────────────────────────
const UnsettledTransactionsTable = dynamic(
  () => import("./unsettled-transactions-table").then((m) => m.UnsettledTransactionsTable),
  { ssr: false, loading: TableSkeleton }
);

const RemittanceHistoryTable = dynamic(
  () => import("./remittance-history-table").then((m) => m.RemittanceHistoryTable),
  { ssr: false, loading: TableSkeleton }
);

const ConsignmentStockPositionTable = dynamic(
  () => import("./consignment-stock-position-table").then((m) => m.ConsignmentStockPositionTable),
  { ssr: false, loading: TableSkeleton }
);

const CreateRemittanceDialog = dynamic(
  () => import("./create-remittance-dialog").then((m) => m.CreateRemittanceDialog),
  { ssr: false }
);

export function RemittanceDashboard() {
  const isCentralStore = useIsCentralStore();
  const [activeTab, setActiveTab] = useState<"unsettled" | "history" | "stock-position">("unsettled");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const queryClient = useQueryClient();
  const { data: summary, isLoading: loadingSummary } = useUnsettledRemittanceSummary();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: REMITTANCE_QUERY_KEYS.all });
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (isCentralStore) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl p-8 max-w-lg mx-auto text-center space-y-4 my-10 shadow-2xs">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <IconBuildingBank size={24} />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-slate-900">Konteks Toko Pusat (HQ)</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Halaman pengajuan setoran ini dikhususkan untuk Toko Cabang yang menyetor penjualan barang titipan. Sebagai Gudang Pusat, silakan buka menu verifikasi untuk memeriksa mutasi setoran yang masuk.
          </p>
        </div>
        <div className="pt-2">
          <Link href={ROUTES.ADMIN_REMITTANCE_VERIFY}>
            <AppButton
              variant="default"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-9 px-4 rounded-xl text-xs gap-1.5"
            >
              <span>Buka Verifikasi Setoran Cabang</span>
            </AppButton>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3.5 pb-24 sm:pb-8">
      {/* Compact Page Header */}
      <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
            <IconBuildingBank size={18} />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-none truncate">
              Setoran Cabang ke Pusat
            </h1>
            <span className="text-[11px] text-slate-400 mt-0.5 block truncate">
              Rekapitulasi penjualan barang konsinyasi &amp; penyetoran nilai pasok
            </span>
          </div>
        </div>

        <AppButton
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-7 px-2.5 text-xs font-medium rounded-lg text-slate-600 gap-1.5 shrink-0"
        >
          <IconRefresh size={13} className={isRefreshing ? "animate-spin" : ""} />
          <span className="hidden sm:inline">Segarkan</span>
        </AppButton>
      </div>

      {/* 3 Stat Cards & Primary CTA */}
      <RemittanceStatCards
        summary={summary}
        isLoading={loadingSummary}
        onOpenCreateDialog={() => setCreateDialogOpen(true)}
      />

      {/* Compact Tab Navigation */}
      <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 overflow-x-auto w-full sm:w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("unsettled")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
            activeTab === "unsettled"
              ? "bg-white text-blue-700 shadow-2xs font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <IconReceipt2 size={14} />
          <span>Belum Disetor</span>
          {(summary?.items_count ?? summary?.total_items_count) ? (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 font-mono">
              {summary?.items_count ?? summary?.total_items_count}
            </span>
          ) : null}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
            activeTab === "history"
              ? "bg-white text-blue-700 shadow-2xs font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <IconHistory size={14} />
          <span>Riwayat Setoran</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("stock-position")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
            activeTab === "stock-position"
              ? "bg-white text-blue-700 shadow-2xs font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <IconPackage size={14} />
          <span>Posisi Stok Titipan</span>
        </button>
      </div>

      {/* Active Tab View */}
      {activeTab === "unsettled" && <UnsettledTransactionsTable />}
      {activeTab === "history" && <RemittanceHistoryTable />}
      {activeTab === "stock-position" && <ConsignmentStockPositionTable />}

      {/* Create Remittance Modal */}
      <CreateRemittanceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        summary={summary}
      />
    </div>
  );
}

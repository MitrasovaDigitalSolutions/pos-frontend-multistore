"use client";

import { formatDate } from "@/lib/date-utils";
import {
  IconArrowDownLeft,
  IconArrowRight,
  IconArrowsLeftRight,
  IconArrowUpRight,
  IconBuildingStore,
  IconCheck,
  IconClock,
  IconInfoCircle,
  IconPlus,
  IconTruckDelivery
} from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";

import { hasPermission, hasRole } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { useAppRouter } from "@/hooks/use-app-router";
import { useActiveStoreStore } from "@/stores/active-store-store";
import { useStores } from "@/features/stores/api/stores-api";
import { useStockTransfersByMode, StockTransferListMode } from "../api/stock-transfer-api";
import { TRANSFER_STATUS_LABELS } from "../constants";
import type { StockTransfer } from "../types";

import { FormSelect } from "@/components/forms/form-select";
import { AppButton } from "@/components/shared/app-button";
import { AccessDeniedState } from "@/components/ui/access-denied-state";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FormProvider, useForm } from "react-hook-form";

const STATUS_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Dikirim" },
  { value: "retur", label: "Menunggu Return" },
  { value: "finished", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
];

const STATUS_PENERIMAAN_OPTIONS = [
  { value: "all", label: "Semua" },
  { value: "pending", label: "Menunggu Diterima" },
  { value: "partially_received", label: "Diterima Sebagian" },
  { value: "received", label: "Diterima Penuh" },
  { value: "rejected", label: "Ditolak" },
];

export function TransferListPage({ mode }: { mode: StockTransferListMode }) {
  const router = useAppRouter();
  const { data: session } = useSession();
  const activeStoreUid = useActiveStoreStore((s) => s.activeStoreUid);

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [statusPenerimaanFilter, setStatusPenerimaanFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string | undefined>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>("desc");

  const [sourceFilter, setSourceFilter] = useState<string>("");
  const [destFilter, setDestFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const filterMethods = useForm({
    defaultValues: {
      status: "all",
      status_penerimaan: "all",
      sourceFilter: "",
      destFilter: "",
    },
  });

  const queryParams = useMemo(
    () => ({
      page,
      per_page: 15,
      status: mode !== "returns" && statusFilter !== "all" ? statusFilter : undefined,
      status_penerimaan: statusPenerimaanFilter !== "all" ? statusPenerimaanFilter : undefined,
      source: sourceFilter || undefined,
      destination: destFilter || undefined,
      created_from: dateFrom || undefined,
      created_to: dateTo || undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
    }),
    [page, statusFilter, statusPenerimaanFilter, sourceFilter, destFilter, dateFrom, dateTo, sortBy, sortOrder, mode]
  );

  const { data, isLoading, isFetching } = useStockTransfersByMode(mode, queryParams);
  const { data: storesRes } = useStores({ per_page: 1000 });
  const storeOptions = useMemo(() => {
    const opts = storesRes?.data?.map((s) => ({ value: s.uid, label: s.nama })) || [];
    return [{ value: "", label: "Semua Cabang" }, ...opts];
  }, [storesRes]);

  const roles = session?.user?.roles || [];
  const permissions = session?.user?.permissions || [];
  const canManage = hasRole(roles, "admin") || hasPermission(roles, permissions, "manage_stock_transfers");
  const canView = canManage || hasPermission(roles, permissions, "view_stock_transfers");

  const transfers = data?.data || [];
  const meta = data?.meta;

  // Derive quick summary stats from current batch / total
  const totalCount = meta?.total || transfers.length;
  
  const getStats = () => {
    if (mode === "outgoing") {
      const sentCount = transfers.filter((t) => t.status === "sent").length;
      const draftCount = transfers.filter((t) => t.status === "draft").length;
      const returCount = transfers.filter((t) => t.status === "retur").length;
      return [
        { label: "Total Transfer Keluar", value: totalCount, icon: IconArrowsLeftRight, color: "slate" },
        { label: "Draft", value: draftCount, icon: IconBuildingStore, color: "amber" },
        { label: "Dikirim", value: sentCount, icon: IconClock, color: "blue" },
        { label: "Menunggu Return", value: returCount, icon: IconCheck, color: "emerald" },
      ];
    } else if (mode === "incoming") {
      const sentCount = transfers.filter((t) => t.status === "sent").length;
      const partiallyReceivedCount = transfers.filter((t) => t.status_penerimaan === "partially_received").length;
      const finishedCount = transfers.filter((t) => t.status === "finished").length;
      return [
        { label: "Total Transfer Masuk", value: totalCount, icon: IconArrowsLeftRight, color: "slate" },
        { label: "Dikirim", value: sentCount, icon: IconClock, color: "blue" },
        { label: "Diterima Sebagian", value: partiallyReceivedCount, icon: IconBuildingStore, color: "amber" },
        { label: "Selesai", value: finishedCount, icon: IconCheck, color: "emerald" },
      ];
    } else { // returns
      const rejectedCount = transfers.filter((t) => t.status_penerimaan === "rejected" || t.status_penerimaan === "partially_received").length;
      return [
        { label: "Menunggu Validasi", value: totalCount, icon: IconArrowsLeftRight, color: "slate" },
        { label: "Ditolak / Selisih", value: rejectedCount, icon: IconClock, color: "amber" },
        { label: "Selesai", value: 0, icon: IconCheck, color: "emerald" },
      ];
    }
  };
  
  const stats = getStats();

  const columns = useMemo<ColumnDef<StockTransfer>[]>(
    () => [
      {
        accessorKey: "nomor_transfer",
        header: "No. Transfer",
        size: 160,
        cell: ({ row }) => {
          const isOutgoing = row.original.store_uid_source === activeStoreUid;
          const isIncoming = row.original.store_uid_destination === activeStoreUid;

          return (
            <div className="flex flex-col gap-0.5">
              <span className="font-mono font-bold text-slate-900 text-xs flex items-center gap-1.5 flex-wrap">
                {row.original.nomor_transfer}
                {isOutgoing && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-amber-600 bg-amber-50 p-0.5 rounded cursor-pointer">
                        <IconArrowUpRight size={13} />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Transfer Keluar</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {isIncoming && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-blue-600 bg-blue-50 p-0.5 rounded cursor-pointer">
                        <IconArrowDownLeft size={13} />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Transfer Masuk</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </span>
              <span className="text-[10px] text-slate-400">
                {row.original.created_at
                  ? formatDate(row.original.created_at, "dd MMM yyyy, HH:mm")
                  : "—"}
              </span>
            </div>
          );
        },
      },
      {
        id: "route",
        header: "Alur Distribusi (Asal ➔ Tujuan)",
        size: 260,
        cell: ({ row }) => {
          const src = row.original.source_store;
          const dst = row.original.destination_store;
          return (
            <div className="flex items-center gap-2 text-xs">
              <div className="flex flex-col">
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  {src?.nama || "—"}
                  {src?.is_central && (
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1 py-0 rounded border border-emerald-200">
                      Pusat
                    </span>
                  )}
                </span>
              </div>
              <IconArrowRight size={14} className="text-slate-400 shrink-0" />
              <div className="flex flex-col">
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  {dst?.nama || "—"}
                  {dst?.is_central && (
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1 py-0 rounded border border-emerald-200">
                      Pusat
                    </span>
                  )}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        id: "items_count",
        header: "Jumlah Produk",
        size: 130,
        cell: ({ row }) => {
          const itemsCount = row.original.items?.length || 0;
          const totalQty = row.original.items?.reduce((sum, item) => sum + Number(item.kuantitas || 0), 0) || 0;
          return (
            <div className="flex flex-col">
              <span className="font-bold text-slate-800 text-xs">
                {itemsCount} Produk
              </span>
              <span className="text-[10px] text-slate-400">
                Total {totalQty} unit
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 130,
        meta: { headerClassName: "text-center", cellClassName: "text-center" },
        cell: ({ row }) => {
          const st = row.original.status;
          return (
            <div className="flex flex-col items-center gap-1">
              <StatusBadge status={st} label={TRANSFER_STATUS_LABELS[st] || st} />
              {row.original.status_penerimaan && (
                <span className="text-[10px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                  {row.original.status_penerimaan.replace('_', ' ')}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "tanggal_kirim",
        header: "Waktu Pengiriman",
        size: 140,
        cell: ({ row }) => (
          <span className="text-xs text-slate-500">
            {row.original.tanggal_kirim
              ? formatDate(row.original.tanggal_kirim, "dd MMM yyyy")
              : "—"}
          </span>
        ),
      },
    ],
    [activeStoreUid]
  );

  if (!canView) {
    return (
      <AccessDeniedState
        description="Anda tidak memiliki izin untuk melihat atau mengelola transfer stok antarcabang."
        requiredPermission="view_stock_transfers"
      />
    );
  }

  const getHeaderInfo = () => {
    if (mode === "outgoing") {
      return {
        title: "Transfer Keluar",
        description: "Kelola pengiriman stok ke cabang lain."
      };
    } else if (mode === "incoming") {
      return {
        title: "Transfer Masuk",
        description: "Kelola penerimaan stok dari cabang lain."
      };
    } else {
      return {
        title: "Return Transfer",
        description: "Validasi pengembalian stok yang ditolak/berselisih oleh toko asal."
      };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <IconTruckDelivery size={22} />
              </div>
              <span>{headerInfo.title}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {headerInfo.description}
            </p>
          </div>

          {canManage && mode === "outgoing" && (
            <AppButton
              type="button"
              onClick={() => router.push(`${ROUTES.ADMIN_STOCK_TRANSFERS}/new`)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer shadow-sm"
            >
              <IconPlus size={16} /> Buat Transfer Baru
            </AppButton>
          )}
        </div>

        {/* Top Stat Cards */}
        <div className={`grid grid-cols-2 md:grid-cols-${stats.length} gap-4`}>
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className={`bg-white p-4 rounded-2xl border border-${stat.color}-50 shadow-sm flex items-center gap-3`}>
                <div className={`w-10 h-10 rounded-xl bg-${stat.color}-50 border border-${stat.color}-100 flex items-center justify-center text-${stat.color}-600 shrink-0`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className={`text-[10px] font-bold text-${stat.color}-500 uppercase tracking-wider`}>{stat.label}</p>
                  <p className={`text-lg font-black text-${stat.color === 'slate' ? 'slate' : stat.color}-900 leading-tight`}>{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Table Card with Custom Filters */}
        <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
          {/* Filter Controls Bar */}
          <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-end justify-between gap-4 border-b border-slate-50 pb-4">
            
            <FormProvider {...filterMethods}>
              <div className="flex flex-wrap gap-3 items-end w-full">
                
                {/* Date From */}
                <div className="flex flex-col gap-1 min-w-[130px]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Dari Tanggal</span>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value);
                      setPage(1);
                    }}
                    className="h-8 text-xs rounded-lg border border-slate-200 bg-white px-2"
                  />
                </div>

                {/* Date To */}
                <div className="flex flex-col gap-1 min-w-[130px]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Sampai Tanggal</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value);
                      setPage(1);
                    }}
                    className="h-8 text-xs rounded-lg border border-slate-200 bg-white px-2"
                  />
                </div>

                {/* Source Store */}
                <div className="flex flex-col gap-1 min-w-[160px] max-w-[200px]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Asal (Source)</span>
                  <FormSelect
                    name="sourceFilter"
                    options={storeOptions}
                    placeholder="Semua Cabang"
                    size="sm"
                    onChange={(val) => {
                      setSourceFilter(val);
                      setPage(1);
                    }}
                  />
                </div>

                {/* Destination Store */}
                <div className="flex flex-col gap-1 min-w-[160px] max-w-[200px]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Tujuan (Destination)</span>
                  <FormSelect
                    name="destFilter"
                    options={storeOptions}
                    placeholder="Semua Cabang"
                    size="sm"
                    onChange={(val) => {
                      setDestFilter(val);
                      setPage(1);
                    }}
                  />
                </div>

                {/* Status Dropdown */}
                {mode !== "returns" && (
                  <div className="flex flex-col gap-1 min-w-[160px] ml-auto">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
                    <FormSelect
                      name="status"
                      options={STATUS_OPTIONS}
                      placeholder="Semua Status"
                      size="sm"
                      onChange={(val) => {
                        setStatusFilter(val);
                        setPage(1);
                      }}
                    />
                  </div>
                )}
                
                {/* Status Penerimaan Dropdown */}
                <div className="flex flex-col gap-1 min-w-[160px]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Status Penerimaan</span>
                  <FormSelect
                    name="status_penerimaan"
                    options={STATUS_PENERIMAAN_OPTIONS}
                    placeholder="Semua"
                    size="sm"
                    onChange={(val) => {
                      setStatusPenerimaanFilter(val);
                      setPage(1);
                    }}
                  />
                </div>
              </div>
            </FormProvider>
          </div>

          <DataTable
            columns={columns}
            data={transfers}
            isLoading={isLoading}
            isFetching={isFetching}
            emptyMessage="Belum ada transaksi transfer stok ditemukan."
            page={page}
            onPageChange={setPage}
            meta={meta}
            entityName="transfer"
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={(by, order) => {
              setSortBy(by);
              setSortOrder(order);
              setPage(1);
            }}
            extraActions={(item) => (
              <Tooltip>
                <TooltipTrigger asChild>
                  <AppButton
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => router.push(`${ROUTES.ADMIN_STOCK_TRANSFERS}/${item.uid}`)}
                    className="text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
                  >
                    <IconInfoCircle size={16} />
                  </AppButton>
                </TooltipTrigger>
                <TooltipContent>Lihat Detail Transfer</TooltipContent>
              </Tooltip>
            )}
          />
        </section>
      </div>
    </TooltipProvider>
  );
}

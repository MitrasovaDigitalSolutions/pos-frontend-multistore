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
import { useStockTransfers } from "../api/stock-transfer-api";
import { TRANSFER_STATUS_CLASSES, TRANSFER_STATUS_LABELS } from "../constants";
import type { StockTransfer } from "../types";

import { FormSelect } from "@/components/forms/form-select";
import { AccessDeniedState } from "@/components/ui/access-denied-state";
import { AppButton } from "@/components/shared/app-button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FormProvider, useForm } from "react-hook-form";

const STATUS_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "draft", label: "Draft" },
  { value: "in_transit", label: "Dalam Pengiriman" },
  { value: "received", label: "Diterima" },
  { value: "cancelled", label: "Dibatalkan" },
];

export function TransferListPage() {
  const router = useAppRouter();
  const { data: session } = useSession();
  const activeStoreUid = useActiveStoreStore((s) => s.activeStoreUid);

  const [page, setPage] = useState(1);
  const [direction, setDirection] = useState<"all" | "outgoing" | "incoming">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string | undefined>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>("desc");

  const filterMethods = useForm({
    defaultValues: {
      status: "all",
    },
  });

  const queryParams = useMemo(
    () => ({
      page,
      per_page: 15,
      direction: direction !== "all" ? direction : undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
    }),
    [page, direction, statusFilter, sortBy, sortOrder]
  );

  const { data, isLoading, isFetching } = useStockTransfers(queryParams);

  const roles = session?.user?.roles || [];
  const permissions = session?.user?.permissions || [];
  const canManage = hasRole(roles, "admin") || hasPermission(roles, permissions, "manage_stock_transfers");
  const canView = canManage || hasPermission(roles, permissions, "view_stock_transfers");

  const transfers = data?.data || [];
  const meta = data?.meta;

  // Derive quick summary stats from current batch / total
  const totalCount = meta?.total || transfers.length;
  const inTransitCount = transfers.filter((t) => t.status === "in_transit").length;
  const draftCount = transfers.filter((t) => t.status === "draft").length;
  const receivedCount = transfers.filter((t) => t.status === "received").length;

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
              <span className="font-mono font-bold text-slate-900 text-xs flex items-center gap-1.5">
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
            <Badge variant="outline" className={`text-[10px] px-2 py-0.5 font-bold border ${TRANSFER_STATUS_CLASSES[st] || "bg-slate-50 text-slate-700"}`}>
              {TRANSFER_STATUS_LABELS[st] || st}
            </Badge>
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
            <span>Transfer Stok Cabang</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Kelola pengiriman, penerimaan, dan mutasi inventori barang antar cabang toko.
          </p>
        </div>

        {canManage && (
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 shrink-0">
            <IconArrowsLeftRight size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Transfer</p>
            <p className="text-lg font-black text-slate-900 leading-tight">{totalCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-50 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <IconClock size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Dalam Pengiriman</p>
            <p className="text-lg font-black text-blue-900 leading-tight">{inTransitCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-50 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <IconCheck size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Selesai / Diterima</p>
            <p className="text-lg font-black text-emerald-900 leading-tight">{receivedCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-50 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <IconBuildingStore size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Draft Disiapkan</p>
            <p className="text-lg font-black text-amber-900 leading-tight">{draftCount}</p>
          </div>
        </div>
      </div>

      {/* Main Table Card with Custom Filters */}
      <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-50 pb-4">
          {/* Direction Tabs */}
          <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
            <AppButton
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => {
                setDirection("all");
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${direction === "all"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
                }`}
            >
              Semua Direction
            </AppButton>
            <AppButton
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => {
                setDirection("outgoing");
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${direction === "outgoing"
                ? "bg-white text-amber-700 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
                }`}
            >
              <IconArrowUpRight size={14} className="text-amber-500" />
              Transfer Keluar
            </AppButton>
            <AppButton
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => {
                setDirection("incoming");
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${direction === "incoming"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
                }`}
            >
              <IconArrowDownLeft size={14} className="text-blue-500" />
              Transfer Masuk
            </AppButton>
          </div>

          {/* Status Dropdown */}
          <div className="w-full sm:w-48">
            <FormProvider {...filterMethods}>
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
            </FormProvider>
          </div>
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

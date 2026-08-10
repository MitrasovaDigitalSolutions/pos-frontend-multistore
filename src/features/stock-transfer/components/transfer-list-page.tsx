"use client";

import { IconInfoCircle } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { hasPermission, hasRole } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { useStores } from "@/features/stores/api/stores-api";
import { useAppRouter } from "@/hooks/use-app-router";
import { useActiveStoreStore } from "@/stores/active-store-store";
import { StockTransferListMode, useStockTransfersByMode } from "../api/stock-transfer-api";

import { AccessDeniedState } from "@/components/ui/access-denied-state";
import { DataTable } from "@/components/ui/data-table";
import { DataTableActionButton } from "@/components/ui/data-table-actions";
import { TooltipProvider } from "@/components/ui/tooltip";

import { TransferListFilters, type TransferFilterValues } from "./list/transfer-list-filters";
import { TransferListHeader } from "./list/transfer-list-header";
import { TransferListStatCards } from "./list/transfer-list-stat-cards";
import { useTransferColumns } from "./list/use-transfer-columns";

import { TRANSFER_SHIPMENT_STATUS, TRANSFER_STATUS } from "../constants";

const STATUS_OPTIONS = [
  { value: "all", label: "Semua Status Transfer" },
  { value: TRANSFER_STATUS.DRAFT, label: "Draft" },
  { value: TRANSFER_STATUS.SENT, label: "Dikirim" },
  { value: TRANSFER_STATUS.RETUR, label: "Retur" },
  { value: TRANSFER_STATUS.FINISH, label: "Selesai" },
  { value: TRANSFER_STATUS.REJECTED, label: "Ditolak" },
  { value: TRANSFER_STATUS.CANCELLED, label: "Dibatalkan" },
];

const STATUS_PENERIMAAN_OPTIONS = [
  { value: "all", label: "Semua Status Penerimaan" },
  { value: TRANSFER_SHIPMENT_STATUS.PENDING, label: "Pending" },
  { value: TRANSFER_SHIPMENT_STATUS.PARTIALLY_RECEIVED, label: "Diterima Sebagian" },
  { value: TRANSFER_SHIPMENT_STATUS.RECEIVED, label: "Diterima Penuh" },
  { value: TRANSFER_SHIPMENT_STATUS.REJECTED, label: "Ditolak" },
];

export function TransferListPage({ mode }: { mode: StockTransferListMode }) {
  const router = useAppRouter();
  const { data: session } = useSession();
  const activeStoreUid = useActiveStoreStore((s) => s.activeStoreUid);

  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string | undefined>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>("desc");

  const filterMethods = useForm<TransferFilterValues>({
    defaultValues: {
      created_from: "",
      created_to: "",
      source: "",
      destination: "",
      status: "all",
      status_penerimaan: "all",
    },
  });

  const [activeFilters, setActiveFilters] = useState<TransferFilterValues>({
    status: "all",
    status_penerimaan: "all",
  });

  const handleFilterSubmit = (values: TransferFilterValues) => {
    setActiveFilters(values);
    setPage(1);
  };

  const handleFilterReset = () => {
    filterMethods.reset({
      created_from: "",
      created_to: "",
      source: "",
      destination: "",
      status: "all",
      status_penerimaan: "all",
    });
    setActiveFilters({
      status: "all",
      status_penerimaan: "all",
    });
    setPage(1);
  };

  const queryParams = useMemo(
    () => ({
      page,
      per_page: 15,
      status: mode !== "returns" && activeFilters.status !== "all" ? activeFilters.status : undefined,
      status_penerimaan: activeFilters.status_penerimaan !== "all" ? activeFilters.status_penerimaan : undefined,
      source: activeFilters.source || undefined,
      destination: activeFilters.destination || undefined,
      created_from: activeFilters.created_from || undefined,
      created_to: activeFilters.created_to || undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
    }),
    [page, activeFilters, sortBy, sortOrder, mode]
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
  const totalCount = meta?.total || transfers.length;

  const columns = useTransferColumns(activeStoreUid);

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
        <TransferListHeader mode={mode} canManage={canManage} />

        <TransferListStatCards mode={mode} transfers={transfers} totalCount={totalCount} isLoading={isLoading} />

        <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
          <TransferListFilters
            mode={mode}
            filterMethods={filterMethods}
            storeOptions={storeOptions}
            statusOptions={STATUS_OPTIONS}
            statusPenerimaanOptions={STATUS_PENERIMAAN_OPTIONS}
            onSubmit={handleFilterSubmit}
            onReset={handleFilterReset}
          />

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
            getRowMotionProps={(item) => {
              const st = (item.status || "").toLowerCase().trim();
              const isFinishedOrRejected = [
                TRANSFER_STATUS.FINISH,
                TRANSFER_STATUS.FINISHED,
                TRANSFER_STATUS.REJECTED,
                TRANSFER_STATUS.CANCELLED,
                "selesai",
                "batal",
                "dibatalkan",
                "rejected",
                "ditolak",
              ].includes(st);

              if (!isFinishedOrRejected) {
                return {
                  animate: {
                    backgroundColor: [
                      "#fffbeb", // Amber-50
                      "#fef3c7", // Amber-100
                      "#fffbeb", // Amber-50
                    ],
                  },
                  transition: {
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                };
              }
              return {
                animate: { backgroundColor: "#ffffff" },
                transition: { duration: 0.2 },
              };
            }}
            extraActions={(item) => {
              const st = (item.status || "").toLowerCase().trim();
              const isFinishedOrRejected = [
                TRANSFER_STATUS.FINISH,
                TRANSFER_STATUS.FINISHED,
                TRANSFER_STATUS.REJECTED,
                TRANSFER_STATUS.CANCELLED,
                "selesai",
                "batal",
                "dibatalkan",
                "rejected",
                "ditolak",
              ].includes(st);

              return (
                <DataTableActionButton
                  variant={!isFinishedOrRejected ? "amber" : "slate"}
                  onClick={() => router.push(`${ROUTES.ADMIN_STOCK_TRANSFERS}/${item.uid}?from=${mode}`)}
                  tooltip="Lihat Detail Transfer"
                >
                  <IconInfoCircle size={16} />
                </DataTableActionButton>
              );
            }}
          />
        </section>
      </div>
    </TooltipProvider>
  );
}

"use client";

import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { IconInfoCircle } from "@tabler/icons-react";

import { hasPermission, hasRole } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { useAppRouter } from "@/hooks/use-app-router";
import { useActiveStoreStore } from "@/stores/active-store-store";
import { useStores } from "@/features/stores/api/stores-api";
import { useStockTransfersByMode, StockTransferListMode } from "../api/stock-transfer-api";

import { AppButton } from "@/components/shared/app-button";
import { AccessDeniedState } from "@/components/ui/access-denied-state";
import { DataTable } from "@/components/ui/data-table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { TransferListHeader } from "./list/transfer-list-header";
import { TransferListStatCards } from "./list/transfer-list-stat-cards";
import { TransferListFilters, type TransferFilterValues } from "./list/transfer-list-filters";
import { useTransferColumns } from "./list/use-transfer-columns";

const STATUS_OPTIONS = [
  { value: "all", label: "Semua Status Transfer" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Dikirim" },
  { value: "retur", label: "Retur" },
  { value: "finish", label: "Selesai" },
  { value: "rejected", label: "Ditolak" },
  { value: "cancelled", label: "Dibatalkan" },
];

const STATUS_PENERIMAAN_OPTIONS = [
  { value: "all", label: "Semua Status Pengiriman" },
  { value: "pending", label: "Pending" },
  { value: "partially_received", label: "Diterima Sebagian" },
  { value: "received", label: "Diterima Penuh" },
  { value: "rejected", label: "Ditolak" },
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

        <TransferListStatCards mode={mode} transfers={transfers} totalCount={totalCount} />

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

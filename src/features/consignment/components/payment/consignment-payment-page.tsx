"use client";

import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DataTableActionButton } from "@/components/ui/data-table-actions";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { formatToReadableDate } from "@/lib/date-utils";
import { IconArrowLeft, IconCash, IconCheck } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useAppRouter } from "@/hooks/use-app-router";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useConsignmentPayments } from "../../api/consignment-api";
import type { ConsignmentReceiving } from "../../types";
import { ConsignmentPaymentDialog } from "./consignment-payment-dialog";
import { MOCK_PAYMENT_CONSIGNMENT_ROW } from "../../tutorial/constants/consignment-tutorial-constants";
import { useConsignmentTutorialStore } from "@/stores/consignment-tutorial-store";

interface PaymentFilterValues {
  search: string;
}

export function ConsignmentPaymentPage() {
  const router = useAppRouter();
  const searchParams = useSearchParams();
  const targetUid = searchParams.get("uid");

  const isTutorialRunning = useConsignmentTutorialStore(
    (state) => state.isRunning && state.activeTutorial === "consignment_payment"
  );

  const filterMethods = useForm<PaymentFilterValues>({
    defaultValues: {
      search: "",
    },
  });

  const [activeFilters, setActiveFilters] = useState<PaymentFilterValues>({
    search: "",
  });
  const [page, setPage] = useState(1);

  const [selectedItem, setSelectedItem] = useState<ConsignmentReceiving | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [mockRow, setMockRow] = useState<ConsignmentReceiving | null>(null);

  const { data, isLoading, isFetching, refetch } = useConsignmentPayments({
    page,
    per_page: 15,
    search: activeFilters.search || undefined,
  });

  // Listen to custom events from consignment payment tutorial
  useEffect(() => {
    const handleInjectMock = () => {
      setMockRow(MOCK_PAYMENT_CONSIGNMENT_ROW);
    };
    const handleClearMock = () => {
      setMockRow(null);
    };
    const handleOpenDialog = () => {
      setSelectedItem(MOCK_PAYMENT_CONSIGNMENT_ROW);
      setIsManualModalOpen(true);
    };
    const handleCloseDialog = () => {
      setIsManualModalOpen(false);
      setSelectedItem(null);
    };

    window.addEventListener("consignment-payment-tutorial-inject-mock", handleInjectMock);
    window.addEventListener("consignment-payment-tutorial-clear-mock", handleClearMock);
    window.addEventListener("consignment-payment-tutorial-open-dialog", handleOpenDialog);
    window.addEventListener("consignment-payment-tutorial-close-dialog", handleCloseDialog);

    return () => {
      window.removeEventListener("consignment-payment-tutorial-inject-mock", handleInjectMock);
      window.removeEventListener("consignment-payment-tutorial-clear-mock", handleClearMock);
      window.removeEventListener("consignment-payment-tutorial-open-dialog", handleOpenDialog);
      window.removeEventListener("consignment-payment-tutorial-close-dialog", handleCloseDialog);
    };
  }, []);

  // Purge mockRow when tutorial is not running
  useEffect(() => {
    if (!isTutorialRunning && mockRow) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMockRow(null);
    }
  }, [isTutorialRunning, mockRow]);

  const displayData = useMemo(() => {
    const rawList = data?.data || [];
    if (!isTutorialRunning || !mockRow) {
      return rawList.filter((item) => !item.uid.startsWith("mock-"));
    }
    return [mockRow, ...rawList.filter((item) => item.uid !== mockRow.uid && !item.uid.startsWith("mock-"))];
  }, [isTutorialRunning, mockRow, data?.data]);

  const firstPayableUid = displayData.find((i) => i.status !== "closed")?.uid;

  // Derived state: Automatically find target item if passed via URL param
  const urlTargetItem =
    targetUid && displayData ? displayData.find((item) => item.uid === targetUid) || null : null;
  const activeItem = selectedItem || urlTargetItem;
  const isPaymentOpen = Boolean(urlTargetItem) || isManualModalOpen;

  const handleOpenPayment = (item: ConsignmentReceiving) => {
    setSelectedItem(item);
    setIsManualModalOpen(true);
  };

  const handleCloseDialog = (open: boolean) => {
    if (!open) {
      setIsManualModalOpen(false);
      setSelectedItem(null);
      if (targetUid) {
        router.replace("/admin/consignment/payment");
      }
    }
  };

  const columns: ColumnDef<ConsignmentReceiving>[] = [
    {
      accessorKey: "nomor_konsinyasi",
      header: "Nomor Konsinyasi",
      size: 180,
      cell: ({ row }) => (
        <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
          {row.original.nomor_konsinyasi}
        </span>
      ),
    },
    {
      accessorKey: "tanggal_terima",
      header: "Tanggal Terima",
      size: 140,
      cell: ({ row }) => (
        <span className="text-xs text-slate-600">
          {formatToReadableDate(row.original.tanggal_terima || row.original.created_at)}
        </span>
      ),
    },
    {
      accessorKey: "supplier",
      header: "Supplier",
      size: 180,
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-slate-800">
          {row.original.supplier || row.original.supplier_relationship?.nama || "—"}
        </span>
      ),
    },
    {
      accessorKey: "sisa_hutang",
      header: "Sisa Hutang Konsinyasi",
      size: 170,
      meta: { headerClassName: "text-right", cellClassName: "text-right" },
      cell: ({ row }) => {
        const hutang = Number(row.original.sisa_hutang || 0);
        if (hutang <= 0) {
          return <span className="text-xs text-slate-400">—</span>;
        }
        return (
          <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
            {formatRupiah(hutang)}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status Sesi",
      size: 140,
      meta: { headerClassName: "text-center", cellClassName: "text-center" },
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
  ];

  const handleFilterSubmit = (values: PaymentFilterValues) => {
    setActiveFilters(values);
    setPage(1);
  };

  const handleFilterReset = () => {
    filterMethods.reset({ search: "" });
    setActiveFilters({ search: "" });
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner (Identical layout to Consignment Receiving) */}
      <div
        id="cons-payment-header"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-100 p-6 rounded-2xl shadow-2xs"
      >
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <IconCash className="w-6 h-6 text-emerald-600" />
            Pelunasan Konsinyasi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Proses pelunasan hasil penjualan konsinyasi kepada supplier dan penutupan sesi titipan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/consignment")}
            className="h-10 text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl gap-1.5 cursor-pointer bg-white"
          >
            <IconArrowLeft size={16} />
            <span>Kembali ke Konsinyasi</span>
          </Button>
        </div>
      </div>

      {/* Filter Form */}
      <div id="cons-payment-filter">
        <FilterForm<PaymentFilterValues>
          methods={filterMethods}
          onSubmit={handleFilterSubmit}
          onReset={handleFilterReset}
          titleLabel="Filter Pelunasan Konsinyasi"
        >
          <FormInput<PaymentFilterValues>
            name="search"
            label="Cari Dokumen / Supplier"
            placeholder="Masukkan nomor konsinyasi atau supplier..."
          />
        </FilterForm>
      </div>

      {/* Main DataTable */}
      <div id="cons-payment-table" className="bg-white border border-slate-100 rounded-2xl shadow-2xs overflow-hidden p-4">
        <DataTable
          columns={columns}
          data={displayData}
          isFetching={isLoading || isFetching}
          virtualize={false}
          page={page}
          perPage={15}
          meta={data?.meta}
          onPageChange={setPage}
          actionColumnWidth="w-36"
          onView={(item) => router.push(`/admin/consignment/${item.uid}`)}
          extraActions={(item) => {
            const isClosed = item.status === "closed";
            if (isClosed) {
              return (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 justify-end">
                  <IconCheck size={14} />
                  Lunas
                </span>
              );
            }
            const isFirst = item.uid === firstPayableUid;
            return (
              <div id={isFirst ? "cons-btn-pay-0" : undefined} className="inline-block">
                <DataTableActionButton
                  variant="emerald"
                  onClick={() => handleOpenPayment(item)}
                  tooltip="Bayar & Tutup Sesi Konsinyasi"
                >
                  <IconCash size={16} />
                </DataTableActionButton>
              </div>
            );
          }}
        />
      </div>

      {/* Payment Action Dialog */}
      <ConsignmentPaymentDialog
        open={isPaymentOpen}
        onOpenChange={handleCloseDialog}
        receiving={activeItem}
        onSuccess={() => refetch()}
      />
    </div>
  );
}

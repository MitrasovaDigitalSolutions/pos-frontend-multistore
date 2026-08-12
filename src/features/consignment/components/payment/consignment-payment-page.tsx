"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { IconArrowLeft, IconCash, IconCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { formatToReadableDateTime } from "@/lib/date-utils";
import { useConsignmentPayments } from "../../api/consignment-api";
import { CONSIGNMENT_STATUS_BADGE } from "../../constants";
import type { ConsignmentReceiving } from "../../types";
import { ConsignmentPaymentDialog } from "./consignment-payment-dialog";

interface PaymentFilterValues {
  search: string;
}

export function ConsignmentPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUid = searchParams.get("uid");

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

  const { data, isLoading, isFetching, refetch } = useConsignmentPayments({
    page,
    per_page: 15,
    search: activeFilters.search || undefined,
  });

  // Derived state: Automatically find target item if passed via URL param without triggering useEffect setState
  const urlTargetItem = targetUid && data?.data ? data.data.find((item) => item.uid === targetUid) || null : null;
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
        <span className="font-mono text-xs font-bold text-emerald-600">
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
          {formatToReadableDateTime(row.original.tanggal_terima || row.original.created_at)}
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
      cell: ({ row }) => {
        const info = CONSIGNMENT_STATUS_BADGE[row.original.status as keyof typeof CONSIGNMENT_STATUS_BADGE] || {
          label: row.original.status,
          variant: "secondary" as const,
        };
        return (
          <Badge variant={info.variant} className="px-2.5 py-0.5 text-xs font-bold shadow-2xs">
            {info.label}
          </Badge>
        );
      },
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
    <div className="space-y-6 p-6">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/consignment")}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 gap-1.5 rounded-xl cursor-pointer"
        >
          <IconArrowLeft size={16} />
          <span>Kembali ke Konsinyasi</span>
        </Button>

        <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <IconCash className="w-5 h-5 text-emerald-600" />
          Pelunasan Pembayaran Konsinyasi
        </h1>
      </div>

      {/* Filter Form */}
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

      {/* DataTable */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-2xs overflow-hidden p-4">
        <DataTable
          columns={columns}
          data={data?.data || []}
          isFetching={isLoading || isFetching}
          virtualize={false}
          page={page}
          perPage={15}
          meta={data?.meta}
          onPageChange={setPage}
          actionColumnWidth="w-36"
          extraActions={(item) => {
            const isClosed = item.status === "closed";
            if (isClosed) {
              return (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 justify-end">
                  <IconCheck size={14} />
                  Sudah Lunas & Ditutup
                </span>
              );
            }
            return (
              <Button
                size="sm"
                onClick={() => handleOpenPayment(item)}
                className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-1 cursor-pointer shadow-2xs"
              >
                <IconCash size={14} />
                <span>Bayar & Tutup</span>
              </Button>
            );
          }}
        />
      </div>

      <ConsignmentPaymentDialog
        open={isPaymentOpen}
        onOpenChange={handleCloseDialog}
        receiving={activeItem}
        onSuccess={() => refetch()}
      />
    </div>
  );
}

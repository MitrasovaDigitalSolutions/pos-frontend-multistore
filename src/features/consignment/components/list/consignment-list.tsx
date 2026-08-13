"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { IconPlus, IconReceipt2, IconBan, IconCash } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTableActionButton } from "@/components/ui/data-table-actions";
import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { toast } from "sonner";
import {
  useConsignmentReceivings,
  useCompleteConsignmentMutation,
  useDeleteConsignmentDraftMutation,
  useVoidConsignmentMutation,
} from "../../api/consignment-api";
import { useConsignmentColumns } from "./use-consignment-columns";
import type { ConsignmentReceiving } from "../../types";

interface ConsignmentFilterValues {
  search: string;
  status: string;
}

const CONSIGNMENT_STATUS_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "draft", label: "Draft" },
  { value: "completed", label: "Selesai (Aktif)" },
  { value: "closed", label: "Ditutup" },
  { value: "void", label: "Dibatalkan" },
];

export function ConsignmentList() {
  const router = useRouter();

  const filterMethods = useForm<ConsignmentFilterValues>({
    defaultValues: {
      search: "",
      status: "all",
    },
  });

  const [activeFilters, setActiveFilters] = useState<ConsignmentFilterValues>({
    search: "",
    status: "all",
  });
  const [page, setPage] = useState(1);

  // Modal dialog states
  const [activeItem, setActiveItem] = useState<ConsignmentReceiving | null>(null);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isVoidOpen, setIsVoidOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const queryParams = {
    page,
    per_page: 15,
    search: activeFilters.search || undefined,
    status: activeFilters.status !== "all" ? activeFilters.status : undefined,
  };

  const { data, isLoading, isFetching } = useConsignmentReceivings(queryParams);
  const columns = useConsignmentColumns();

  const completeMutation = useCompleteConsignmentMutation();
  const voidMutation = useVoidConsignmentMutation();
  const deleteMutation = useDeleteConsignmentDraftMutation();

  const handleFilterSubmit = (values: ConsignmentFilterValues) => {
    setActiveFilters(values);
    setPage(1);
  };

  const handleFilterReset = () => {
    filterMethods.reset({ search: "", status: "all" });
    setActiveFilters({ search: "", status: "all" });
    setPage(1);
  };

  const handleComplete = async () => {
    if (!activeItem) return;
    try {
      await completeMutation.mutateAsync(activeItem.uid);
      toast.success(`Penerimaan konsinyasi ${activeItem.nomor_konsinyasi} berhasil diselesaikan (stok fisik bertambah).`);
      setIsCompleteOpen(false);
      setActiveItem(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(error?.response?.data?.message || error?.message || "Gagal menyelesaikan konsinyasi.");
    }
  };

  const handleVoid = async () => {
    if (!activeItem) return;
    try {
      await voidMutation.mutateAsync(activeItem.uid);
      toast.success(`Konsinyasi ${activeItem.nomor_konsinyasi} berhasil dibatalkan (stok fisik dikembalikan).`);
      setIsVoidOpen(false);
      setActiveItem(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(error?.response?.data?.message || error?.message || "Gagal membatalkan konsinyasi.");
    }
  };

  const handleDelete = async () => {
    if (!activeItem) return;
    try {
      await deleteMutation.mutateAsync(activeItem.uid);
      toast.success(`Draft konsinyasi ${activeItem.nomor_konsinyasi} berhasil dihapus.`);
      setIsDeleteOpen(false);
      setActiveItem(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(error?.response?.data?.message || error?.message || "Gagal menghapus draft konsinyasi.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-100 p-6 rounded-2xl shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <IconReceipt2 className="w-6 h-6 text-emerald-600" />
            Penerimaan Konsinyasi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola barang titipan dari supplier, stok off-book, dan pelunasan sesi konsinyasi.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => router.push("/admin/consignment/create")}
            className="h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-1.5 cursor-pointer shadow-2xs"
          >
            <IconPlus size={16} />
            <span>Buat Konsinyasi</span>
          </Button>
        </div>
      </div>

      {/* Filter Form */}
      <FilterForm<ConsignmentFilterValues>
        methods={filterMethods}
        onSubmit={handleFilterSubmit}
        onReset={handleFilterReset}
        titleLabel="Filter Penerimaan Konsinyasi"
      >
        <FormInput<ConsignmentFilterValues>
          name="search"
          label="Cari Dokumen / Supplier"
          placeholder="Masukkan nomor konsinyasi atau supplier..."
        />
        <FormSelect<ConsignmentFilterValues>
          name="status"
          label="Status Sesi"
          options={CONSIGNMENT_STATUS_OPTIONS}
          placeholder="Pilih Status Sesi"
        />
      </FilterForm>

      {/* Main DataTable */}
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
          onView={(item) => router.push(`/admin/consignment/${item.uid}`)}
          hideView={(item) => item.status === "draft"}
          onEdit={(item) => router.push(`/admin/consignment/${item.uid}/edit`)}
          hideEdit={(item) => item.status !== "draft"}
          onCheck={(item) => {
            setActiveItem(item);
            setIsCompleteOpen(true);
          }}
          hideCheck={(item) => item.status !== "draft"}
          onDelete={(item) => {
            setActiveItem(item);
            setIsDeleteOpen(true);
          }}
          hideDelete={(item) => item.status !== "draft"}
          extraActions={(item) => {
            const isCompleted = item.status === "completed";
            const hasPayments = item.payments && item.payments.length > 0;
            const hasSales = item.items?.some((i) => (i.qty_terjual || 0) > 0);

            if (!isCompleted) return null;

            return (
              <>
                <DataTableActionButton
                  variant="emerald"
                  onClick={() => router.push(`/admin/consignment/payment?uid=${item.uid}`)}
                  tooltip="Bayar & Tutup Sesi"
                >
                  <IconCash size={15} />
                </DataTableActionButton>
                {!hasSales && !hasPayments && (
                  <DataTableActionButton
                    variant="rose"
                    onClick={() => {
                      setActiveItem(item);
                      setIsVoidOpen(true);
                    }}
                    tooltip="Batalkan konsinyasi"
                  >
                    <IconBan size={15} />
                  </DataTableActionButton>
                )}
              </>
            );
          }}
        />
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        open={isCompleteOpen}
        onOpenChange={setIsCompleteOpen}
        title="Finalisasi Penerimaan Konsinyasi"
        description={`Selesaikan konsinyasi "${activeItem?.nomor_konsinyasi}"? Stok fisik produk akan bertambah (off-book) dan siap dijual.`}
        confirmText="Ya, Selesaikan"
        variant="success"
        isLoading={completeMutation.isPending}
        onConfirm={handleComplete}
      />

      <ConfirmDialog
        open={isVoidOpen}
        onOpenChange={setIsVoidOpen}
        title="Batalkan Konsinyasi"
        description={`Batalkan penerimaan konsinyasi "${activeItem?.nomor_konsinyasi}"? Stok fisik produk akan dikembalikan.`}
        confirmText="Ya, Batalkan"
        variant="danger"
        isLoading={voidMutation.isPending}
        onConfirm={handleVoid}
      />

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Hapus Draft Konsinyasi"
        description={`Apakah Anda yakin ingin menghapus draft konsinyasi "${activeItem?.nomor_konsinyasi}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}

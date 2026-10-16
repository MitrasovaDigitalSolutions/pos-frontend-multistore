"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  IconCheck,
  IconFileText,
  IconPackage,
  IconRefresh,
  IconShieldCheck,
  IconX,
} from "@tabler/icons-react";
import { AppButton } from "@/components/shared/app-button";
import {
  DataTable,
  DataTableActionButton,
  DataTableTextActionButton,
} from "@/components/ui/data-table";
import { extractDataList } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { ROUTES } from "@/constants/routes";
import { useIsCentralStore } from "@/hooks/use-active-store";
import { useStoreRemittances } from "../../api/remittance-api";
import { REMITTANCE_QUERY_KEYS, REMITTANCE_STATUS } from "../../constants";
import type { StoreRemittance } from "../../types";
import { RemittanceApprovalDialog } from "./remittance-approval-dialog";
import { RemittanceRejectDialog } from "./remittance-reject-dialog";
import { RemittanceProofModal } from "../remittance-proof-modal";
import { ConsignmentStockPositionTable } from "../consignment-stock-position-table";
import { RemittanceVerifyStatCards } from "./remittance-verify-stat-cards";
import { useRemittanceVerifyColumns } from "./use-remittance-verify-columns";
import { RemittanceVerifyCard } from "./remittance-verify-card";

export function RemittanceVerifyDashboard() {
  const isCentralStore = useIsCentralStore();
  const [activeTab, setActiveTab] = useState<"remittances" | "stock-position">("remittances");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);
  const [selectedNomorSetoran, setSelectedNomorSetoran] = useState<string>("");
  const [proofModalOpen, setProofModalOpen] = useState(false);

  const [approvingRemittance, setApprovingRemittance] = useState<StoreRemittance | null>(null);
  const [rejectingRemittance, setRejectingRemittance] = useState<StoreRemittance | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const queryParams = useMemo(() => ({
    status: statusFilter === "all" ? undefined : statusFilter,
  }), [statusFilter]);

  const { data: remittancesRes, isLoading, isFetching } = useStoreRemittances(queryParams);
  const remittances = useMemo(() => extractDataList<StoreRemittance>(remittancesRes), [remittancesRes]);

  // Request pending status specifically for tab badge and stat card
  const { data: pendingRes } = useStoreRemittances({ status: REMITTANCE_STATUS.PENDING });
  const pendingCount = pendingRes?.meta?.total ?? extractDataList<StoreRemittance>(pendingRes).length;

  // Request verified status specifically for verified total calculation
  const { data: verifiedRes } = useStoreRemittances({ status: REMITTANCE_STATUS.VERIFIED });
  const verifiedList = useMemo(() => extractDataList<StoreRemittance>(verifiedRes), [verifiedRes]);
  const verifiedTotal = useMemo(
    () => verifiedList.reduce((sum, r) => sum + (r.nominal_disetor || 0), 0),
    [verifiedList]
  );

  // Request rejected status specifically for rejected count
  const { data: rejectedRes } = useStoreRemittances({ status: REMITTANCE_STATUS.REJECTED });
  const rejectedCount = rejectedRes?.meta?.total ?? extractDataList<StoreRemittance>(rejectedRes).length;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: REMITTANCE_QUERY_KEYS.all });
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleOpenProof = (url: string, nomor: string) => {
    setSelectedProofUrl(url);
    setSelectedNomorSetoran(nomor);
    setProofModalOpen(true);
  };

  const columns = useRemittanceVerifyColumns();

  if (!isCentralStore) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl p-8 max-w-lg mx-auto text-center space-y-4 my-10 shadow-2xs">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
          <IconShieldCheck size={24} />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-slate-900">Konteks Toko Cabang</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Halaman verifikasi setoran ini hanya dapat diakses melalui konteks Gudang Pusat (HQ). Untuk mengajukan setoran dari cabang ini ke Pusat, silakan buka menu Setoran ke Pusat.
          </p>
        </div>
        <div className="pt-2">
          <Link href={ROUTES.ADMIN_REMITTANCE}>
            <AppButton
              variant="default"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-9 px-4 rounded-xl text-xs gap-1.5"
            >
              <span>Buka Setoran ke Pusat</span>
            </AppButton>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3.5 pb-24 sm:pb-8">
      {/* Compact Header */}
      <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-xs">
            <IconShieldCheck size={18} />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-none truncate">
              Verifikasi Setoran Cabang
            </h1>
            <span className="text-[11px] text-slate-400 mt-0.5 block truncate">
              Validasi bukti transfer &amp; verifikasi penerimaan dana konsinyasi
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

      {/* Segmented Control Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 overflow-x-auto w-full sm:w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("remittances")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
            activeTab === "remittances"
              ? "bg-white text-emerald-700 shadow-2xs font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <IconShieldCheck size={14} />
          <span>Verifikasi Setoran</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 font-mono">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("stock-position")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
            activeTab === "stock-position"
              ? "bg-white text-emerald-700 shadow-2xs font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <IconPackage size={14} />
          <span>Posisi Titipan Cabang</span>
        </button>
      </div>

      {activeTab === "stock-position" ? (
        <ConsignmentStockPositionTable showStoreColumn={true} />
      ) : (
        <>
          {/* 3 Metric Tiles */}
          <RemittanceVerifyStatCards
            pendingCount={pendingCount}
            verifiedTotal={verifiedTotal}
            rejectedCount={rejectedCount}
          />

          {/* Main Reusable DataTable with action props */}
          <DataTable
            columns={columns}
            data={remittances}
            isLoading={isLoading}
            isFetching={isFetching}
            clientPagination={true}
            perPage={10}
            entityName="setoran cabang"
            emptyMessage="Tidak ada antrean setoran ditemukan"
            actionColumnWidth="w-52"
            extraActions={(rem) => {
              const isPending = rem.status === REMITTANCE_STATUS.PENDING;
              return (
                <div className="flex items-center gap-1.5 justify-center">
                  {rem.bukti_transfer_url && (
                    <DataTableActionButton
                      variant="slate"
                      onClick={() => handleOpenProof(rem.bukti_transfer_url || "", rem.nomor_setoran)}
                      tooltip="Lihat Bukti Transfer"
                    >
                      <IconFileText size={15} />
                    </DataTableActionButton>
                  )}

                  {isPending ? (
                    <>
                      <DataTableTextActionButton
                        variant="solidEmerald"
                        icon={<IconCheck size={13} />}
                        onClick={() => setApprovingRemittance(rem)}
                        tooltip="Verifikasi & Terima Dana Setoran"
                      >
                        Terima
                      </DataTableTextActionButton>
                      <DataTableTextActionButton
                        variant="rose"
                        icon={<IconX size={13} />}
                        onClick={() => setRejectingRemittance(rem)}
                        tooltip="Tolak Setoran Cabang"
                      >
                        Tolak
                      </DataTableTextActionButton>
                    </>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium px-1">
                      {rem.status === REMITTANCE_STATUS.VERIFIED ? "Disetujui" : "Ditolak"}
                    </span>
                  )}
                </div>
              );
            }}
            extraToolbarActions={
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg w-fit">
                {[
                  { id: "all", label: "Semua" },
                  { id: REMITTANCE_STATUS.PENDING, label: `Menunggu (${pendingCount})` },
                  { id: REMITTANCE_STATUS.VERIFIED, label: "Diverifikasi" },
                  { id: REMITTANCE_STATUS.REJECTED, label: "Ditolak" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      statusFilter === tab.id
                        ? "bg-white text-slate-900 shadow-2xs font-bold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            }
            renderCardItem={(row) => (
              <RemittanceVerifyCard
                remittance={row.original}
                onOpenProof={handleOpenProof}
                onApprove={(rem) => setApprovingRemittance(rem)}
                onReject={(rem) => setRejectingRemittance(rem)}
              />
            )}
          />
        </>
      )}

      {/* Verification Dialogs */}
      <RemittanceApprovalDialog
        open={Boolean(approvingRemittance)}
        onOpenChange={(open) => !open && setApprovingRemittance(null)}
        remittance={approvingRemittance}
      />

      <RemittanceRejectDialog
        open={Boolean(rejectingRemittance)}
        onOpenChange={(open) => !open && setRejectingRemittance(null)}
        remittance={rejectingRemittance}
      />

      <RemittanceProofModal
        open={proofModalOpen}
        onOpenChange={setProofModalOpen}
        proofUrl={selectedProofUrl}
        nomorSetoran={selectedNomorSetoran}
      />
    </div>
  );
}

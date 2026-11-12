"use client";

import { useMemo, useState } from "react";
import { IconEye, IconFileText, IconHistory } from "@tabler/icons-react";
import { DataTable, DataTableTextActionButton } from "@/components/ui/data-table";
import { extractDataList } from "@/lib/utils";
import { useStoreRemittances } from "../api/remittance-api";
import type { StoreRemittance } from "../types";
import { getRemittanceNomor, getRemittanceProofUrl } from "../utils/remittance-utils";
import { RemittanceDetailDialog } from "./remittance-detail-dialog";
import { RemittanceProofModal } from "./remittance-proof-modal";
import { useRemittanceHistoryColumns } from "./history/use-remittance-history-columns";
import { RemittanceHistoryCard } from "./history/remittance-history-card";

export function RemittanceHistoryTable() {
  const { data: remittancesRes, isLoading, isFetching } = useStoreRemittances();
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);
  const [selectedNomorSetoran, setSelectedNomorSetoran] = useState<string>("");
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [selectedDetailRemittance, setSelectedDetailRemittance] =
    useState<StoreRemittance | null>(null);

  const remittances = useMemo(
    () => extractDataList<StoreRemittance>(remittancesRes),
    [remittancesRes]
  );

  const handleOpenProof = (url: string, nomor: string) => {
    setSelectedProofUrl(url);
    setSelectedNomorSetoran(nomor);
    setProofModalOpen(true);
  };

  const columns = useRemittanceHistoryColumns();

  return (
    <>
      <DataTable
        columns={columns}
        data={remittances}
        isLoading={isLoading}
        isFetching={isFetching}
        clientPagination={true}
        perPage={10}
        entityName="setoran"
        emptyMessage="Belum ada riwayat setoran"
        actionColumnWidth="w-36"
        extraActions={(rem) => {
          const nomor = getRemittanceNomor(rem);
          const proofUrl = getRemittanceProofUrl(rem);
          return (
            <div className="flex items-center gap-1.5 justify-center">
              <DataTableTextActionButton
                variant="slate"
                icon={<IconEye size={13} />}
                onClick={() => setSelectedDetailRemittance(rem)}
                tooltip="Lihat Detail & Daftar Item Setoran"
              >
                Detail
              </DataTableTextActionButton>
              {proofUrl && (
                <DataTableTextActionButton
                  variant="slate"
                  icon={<IconFileText size={13} />}
                  onClick={() => handleOpenProof(proofUrl, nomor)}
                  tooltip="Lihat Bukti Transfer Bank"
                >
                  Bukti
                </DataTableTextActionButton>
              )}
            </div>
          );
        }}
        extraToolbarActions={
          <div className="flex items-center gap-2">
            <IconHistory size={16} className="text-blue-600 shrink-0" />
            <h3 className="text-xs font-bold text-slate-900 leading-none">
              Riwayat Pengajuan Setoran
            </h3>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 font-semibold">
              {remittances.length} setoran
            </span>
          </div>
        }
        renderCardItem={(row) => (
          <RemittanceHistoryCard
            remittance={row.original}
            onOpenProof={handleOpenProof}
            onOpenDetail={(rem) => setSelectedDetailRemittance(rem)}
          />
        )}
      />

      <RemittanceDetailDialog
        open={Boolean(selectedDetailRemittance)}
        onOpenChange={(open) => !open && setSelectedDetailRemittance(null)}
        remittance={selectedDetailRemittance}
        onOpenProof={handleOpenProof}
      />

      <RemittanceProofModal
        open={proofModalOpen}
        onOpenChange={setProofModalOpen}
        proofUrl={selectedProofUrl}
        nomorSetoran={selectedNomorSetoran}
      />
    </>
  );
}

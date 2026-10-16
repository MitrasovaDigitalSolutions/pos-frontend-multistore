"use client";

import { IconDownload, IconExternalLink, IconFileText, IconPhoto } from "@tabler/icons-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppButton } from "@/components/shared/app-button";

interface RemittanceProofModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proofUrl?: string | null;
  nomorSetoran?: string;
}

export function RemittanceProofModal({
  open,
  onOpenChange,
  proofUrl,
  nomorSetoran,
}: RemittanceProofModalProps) {
  if (!proofUrl) return null;

  const isPdf = proofUrl.toLowerCase().endsWith(".pdf");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-white rounded-2xl p-6 border-slate-100 shadow-xl overflow-hidden">
        <DialogHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                {isPdf ? <IconFileText size={18} /> : <IconPhoto size={18} />}
              </div>
              <span>Bukti Transfer: {nomorSetoran || "Setoran Cabang"}</span>
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="py-3 flex flex-col items-center justify-center">
          {isPdf ? (
            <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center gap-3">
              <IconFileText size={48} className="text-red-500" />
              <p className="text-xs text-slate-600 font-medium">Dokumen Bukti Transfer (PDF)</p>
              <a
                href={proofUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <IconExternalLink size={14} />
                <span>Buka Dokumen PDF</span>
              </a>
            </div>
          ) : (
            <div className="w-full max-h-[60vh] overflow-auto rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-center p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={proofUrl}
                alt={`Bukti transfer ${nomorSetoran}`}
                className="max-w-full max-h-[55vh] object-contain rounded-lg"
              />
            </div>
          )}
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
          <a
            href={proofUrl}
            download
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-bold"
          >
            <IconDownload size={15} />
            <span>Unduh Bukti</span>
          </a>
          <AppButton
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 px-4 text-xs font-semibold rounded-xl"
          >
            Tutup
          </AppButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}

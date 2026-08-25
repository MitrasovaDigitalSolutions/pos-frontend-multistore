"use client";

import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconEdit } from "@tabler/icons-react";
import { useState } from "react";
import type { Opname } from "../../types";

interface EditHeaderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opname: Opname;
  onSave: (catatan: string) => Promise<boolean>;
  isPending: boolean;
}

export function EditHeaderDialog({
  open,
  onOpenChange,
  opname,
  onSave,
  isPending,
}: EditHeaderDialogProps) {
  const [prevOpen, setPrevOpen] = useState(open);
  const [catatan, setCatatan] = useState(opname.catatan || "");

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setCatatan(opname.catatan || "");
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSave(catatan);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        <>
          <IconEdit size={18} className="text-emerald-600" />
          <span>Edit Catatan Stock Opname</span>
        </>
      }
      className="sm:max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">
            Nomor Opname
          </label>
          <Input
            value={opname.nomor_opname}
            disabled
            className="bg-slate-50 font-mono text-xs text-slate-500 rounded-xl"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">
            Catatan / Keterangan
          </label>
          <textarea
            value={catatan}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setCatatan(e.target.value)
            }
            placeholder="Tambahkan catatan untuk opname ini..."
            rows={3}
            disabled={isPending}
            className="w-full text-xs resize-none rounded-xl border border-slate-200 p-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:border-transparent"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="h-9 px-4 text-xs font-bold rounded-xl"
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="h-9 px-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs border-none cursor-pointer"
          >
            {isPending ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </BaseDialog>
  );
}

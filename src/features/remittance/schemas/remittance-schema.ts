import { z } from "zod";

export const createRemittanceSchema = z.object({
  sale_item_uids: z
    .array(z.string().min(1))
    .min(1, "Pilih minimal 1 item penjualan konsinyasi yang akan disetor"),
  cash_account_source_uid: z
    .string({ message: "Pilih akun kas / bank asal cabang" })
    .min(1, "Akun kas / bank asal wajib dipilih"),
  cash_account_dest_uid: z.string().optional().nullable(),
  nominal_disetor: z.number().min(1, "Nominal setoran harus lebih dari 0"),
  catatan: z.string().max(500, "Catatan maksimal 500 karakter").optional().nullable(),
});

export const rejectRemittanceSchema = z.object({
  alasan: z
    .string()
    .min(3, "Alasan penolakan minimal 3 karakter")
    .max(500, "Alasan maksimal 500 karakter"),
});

export type CreateRemittanceFormValues = z.infer<typeof createRemittanceSchema>;
export type RejectRemittanceFormValues = z.infer<typeof rejectRemittanceSchema>;

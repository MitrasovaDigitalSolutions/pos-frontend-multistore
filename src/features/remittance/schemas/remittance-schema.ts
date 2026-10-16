import { z } from "zod";

export const createRemittanceSchema = z.object({
  cash_account_source_uid: z.string().min(1, "Akun kas/bank asal wajib dipilih"),
  nominal_disetor: z.number().min(1, "Nominal setoran harus lebih dari 0"),
  catatan: z.string().max(300, "Catatan maksimal 300 karakter").optional().nullable(),
});

export const rejectRemittanceSchema = z.object({
  alasan: z.string().min(3, "Alasan penolakan minimal 3 karakter").max(300, "Alasan maksimal 300 karakter"),
});

export type CreateRemittanceFormValues = z.infer<typeof createRemittanceSchema>;
export type RejectRemittanceFormValues = z.infer<typeof rejectRemittanceSchema>;

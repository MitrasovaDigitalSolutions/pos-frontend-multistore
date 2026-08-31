import { z } from "zod";

export const manualJournalLineSchema = z.object({
    id: z.string().optional(),
    chart_of_account_uid: z.string().min(1, "Pilih akun terlebih dahulu"),
    description: z.string(),
    debit: z.number().min(0, "Debit tidak boleh bernilai negatif"),
    credit: z.number().min(0, "Kredit tidak boleh bernilai negatif"),
});

export const manualJournalSchema = z
    .object({
        transaction_date: z.string().min(1, "Tanggal transaksi wajib diisi"),
        description: z.string().min(1, "Keterangan jurnal wajib diisi"),
        status: z.enum(["draft", "posted"]),
        lines: z
            .array(manualJournalLineSchema)
            .min(2, "Jurnal manual minimal harus memiliki 2 baris transaksi"),
    })
    .superRefine((data, ctx) => {
        data.lines.forEach((line, index) => {
            const hasDebit = (line.debit || 0) > 0;
            const hasCredit = (line.credit || 0) > 0;

            if (!line.chart_of_account_uid) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Pilih akun terlebih dahulu",
                    path: ["lines", index, "chart_of_account_uid"],
                });
            }

            if (!hasDebit && !hasCredit) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Isi nominal Debit atau Kredit",
                    path: ["lines", index, "debit"],
                });
            }
        });

        if (data.status === "posted") {
            const totalDebit = data.lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
            const totalCredit = data.lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);

            if (totalDebit <= 0 || totalCredit <= 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Total nilai jurnal harus lebih dari Rp 0",
                    path: ["lines"],
                });
            }

            const difference = Math.abs(totalDebit - totalCredit);
            if (difference > 0.01) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Total Debit dan Total Kredit harus seimbang (sama)",
                    path: ["lines"],
                });
            }
        }
    });

export type ManualJournalSchemaInput = z.infer<typeof manualJournalSchema>;
export type ManualJournalLineSchemaInput = z.infer<typeof manualJournalLineSchema>;



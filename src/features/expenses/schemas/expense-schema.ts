import { z } from "zod";

export const expenseCategorySchema = z.object({
    nama: z
        .string()
        .min(1, "Nama kategori wajib diisi")
        .max(255, "Nama kategori maksimal 255 karakter"),
    keterangan: z
        .string()
        .optional()
        .or(z.literal(""))
        .transform((val) => val || null),
    is_recurring: z
        .boolean()
        .default(false),
    hari_jatuh_tempo: z
        .preprocess(
            (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
            z
                .number()
                .min(1, "Hari jatuh tempo minimal tanggal 1")
                .max(31, "Hari jatuh tempo maksimal tanggal 31")
                .nullable()
        )
        .optional(),
});

export type ExpenseCategoryInput = z.infer<typeof expenseCategorySchema>;

export const expenseSchema = z.object({
    expense_category_uid: z
        .string({ message: "Kategori pengeluaran wajib dipilih" })
        .min(1, "Kategori pengeluaran wajib dipilih"),
    cash_account_uid: z
        .string({ message: "Akun kas wajib dipilih" })
        .min(1, "Akun kas wajib dipilih"),
    amount: z
        .number({ message: "Jumlah pengeluaran wajib diisi" })
        .min(1, "Jumlah minimal Rp 1"),
    nama: z
        .string()
        .max(255, "Nama pengeluaran maksimal 255 karakter")
        .optional()
        .or(z.literal(""))
        .transform((val) => val || null),
    catatan: z
        .string()
        .optional()
        .or(z.literal(""))
        .transform((val) => val || null),
    tanggal: z
        .string()
        .min(1, "Tanggal pengeluaran wajib diisi"),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;

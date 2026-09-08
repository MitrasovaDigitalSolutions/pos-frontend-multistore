import { z } from "zod";

export const debitCreditSchema = z.object({
    amount: z.preprocess(
        (val) => {
            if (val === "" || val === undefined || val === null) return undefined;
            const num = Number(val);
            return isNaN(num) ? undefined : num;
        },
        z.number({ message: "Nominal wajib berupa angka" }).min(1, "Nominal minimal Rp 1")
    ),
    chart_of_account_uid: z
        .string()
        .optional()
        .nullable()
        .transform((v) => v || null),
    kategori: z
        .string()
        .max(50, "Kategori maksimal 50 karakter")
        .optional()
        .nullable()
        .transform((v) => v || null),
    catatan: z
        .string()
        .max(500, "Catatan maksimal 500 karakter")
        .optional()
        .nullable()
        .transform((v) => v || null),
});

export type DebitCreditSchemaInput = z.infer<typeof debitCreditSchema>;

export const transferSchema = z
    .object({
        from_account_uid: z.preprocess(
            (val) => {
                if (val === "" || val === undefined || val === null) return undefined;
                const num = String(val);
                return num;
            },
            z.string({ message: "Akun kas asal wajib dipilih" }).min(1, "Akun kas asal wajib dipilih")
        ),
        to_account_uid: z.preprocess(
            (val) => {
                if (val === "" || val === undefined || val === null) return undefined;
                const num = String(val);
                return num;
            },
            z.string({ message: "Akun kas tujuan wajib dipilih" }).min(1, "Akun kas tujuan wajib dipilih")
        ),
        amount: z.preprocess(
            (val) => {
                if (val === "" || val === undefined || val === null) return undefined;
                const num = Number(val);
                return isNaN(num) ? undefined : num;
            },
            z.number({ message: "Nominal wajib berupa angka" }).min(1, "Nominal minimal Rp 1")
        ),
        catatan: z
            .string()
            .max(500, "Catatan maksimal 500 karakter")
            .optional()
            .nullable()
            .transform((v) => v || null),
    })
    .refine((data) => data.from_account_uid !== data.to_account_uid, {
        message: "Akun kas asal dan tujuan tidak boleh sama",
        path: ["to_account_uid"],
    });

export type TransferSchemaInput = z.infer<typeof transferSchema>;

export const cashAccountSchema = z.object({
    nama: z
        .string()
        .min(1, "Nama akun kas wajib diisi")
        .max(100, "Nama akun kas maksimal 100 karakter"),
    tipe: z.enum(["cash", "bank", "register"], {
        message: "Tipe akun kas wajib dipilih",
    }),
    nomor_rekening: z
        .string()
        .max(50, "Nomor rekening maksimal 50 karakter")
        .optional()
        .nullable()
        .transform((v) => v || null),
    deskripsi: z
        .string()
        .max(500, "Deskripsi maksimal 500 karakter")
        .optional()
        .nullable()
        .transform((v) => v || null),
    saldo_awal: z
        .preprocess((val) => {
            if (val === "" || val === undefined || val === null) return 0;
            const num = Number(val);
            return isNaN(num) ? 0 : num;
        }, z.number().min(0, "Saldo awal minimal Rp 0"))
        .optional()
        .default(0),
    is_active: z.boolean().optional().default(true),
});

export type CashAccountFormValues = z.infer<typeof cashAccountSchema>;


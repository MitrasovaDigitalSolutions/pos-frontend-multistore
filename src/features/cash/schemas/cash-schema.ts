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

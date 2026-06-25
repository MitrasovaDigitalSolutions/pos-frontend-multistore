import { z } from "zod";

export const paymentSchema = z.object({
    receiving_uid: z.string().min(1, "Penerimaan barang wajib dipilih"),
    jumlah_bayar: z.coerce.number().min(1, "Nominal pembayaran minimal Rp 1"),
    tanggal_bayar: z.string().min(1, "Tanggal pembayaran wajib diisi"),
    cash_account_uid: z.string().min(1, "Rekening/akun kas wajib dipilih"),
    metode_pembayaran: z.string().min(1, "Metode pembayaran wajib diisi").max(50),
    nomor_referensi: z
        .string()
        .nullable()
        .optional()
        .transform((val) => val || null),
    catatan: z
        .string()
        .nullable()
        .optional()
        .transform((val) => val || null),
});

export type PaymentInput = z.infer<typeof paymentSchema>;


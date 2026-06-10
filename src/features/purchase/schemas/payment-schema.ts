import { z } from "zod";

export const paymentSchema = z.object({
    stock_receiving_id: z.coerce.number().min(1, "Penerimaan barang wajib dipilih"),
    nominal: z.coerce.number().min(1, "Nominal pembayaran minimal Rp 1"),
    tanggal_bayar: z.string().min(1, "Tanggal pembayaran wajib diisi"),
    cash_account_id: z.coerce.number().min(1, "Rekening/akun kas wajib dipilih"),
    metode_pembayaran: z.string().min(1, "Metode pembayaran wajib diisi").max(50),
    catatan: z
        .string()
        .nullable()
        .optional()
        .transform((val) => val || null),
});

export type PaymentInput = z.infer<typeof paymentSchema>;

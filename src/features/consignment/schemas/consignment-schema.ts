import { z } from "zod";

export const consignmentItemSchema = z.object({
  product_uid: z.string().min(1, "Produk wajib dipilih."),
  kuantitas: z.number().min(0.01, "Jumlah minimal 0.01"),
  harga_beli: z.number().min(0, "Harga beli tidak boleh negatif"),
  update_harga_jual: z.boolean(),
  harga_jual_baru: z.number().nullable().optional(),
  margin_baru: z.number().nullable().optional(),
});

export const consignmentReceivingSchema = z.object({
  supplier_uid: z.string().nullable().optional(),
  supplier: z.string().nullable().optional(),
  tanggal_terima: z.string().min(1, "Tanggal terima wajib diisi"),
  catatan: z.string().nullable().optional(),
  items: z.array(consignmentItemSchema).min(1, "Minimal 1 item konsinyasi wajib diisi"),
});

export const consignmentPaymentSchema = z.object({
  jumlah_bayar: z.number().min(1, "Jumlah bayar minimal 1"),
  cash_account_uid: z.string().min(1, "Akun kas wajib dipilih"),
  tanggal_bayar: z.string().optional(),
  catatan: z.string().nullable().optional(),
});

export type ConsignmentReceivingFormValues = z.infer<typeof consignmentReceivingSchema>;
export type ConsignmentPaymentFormValues = z.infer<typeof consignmentPaymentSchema>;

import { z } from "zod";

export const transferItemSchema = z.object({
  product_uid: z.string().min(1, "Produk wajib dipilih"),
  kuantitas: z.coerce.number().min(0.001, "Kuantitas harus > 0"),
  tipe_komisi: z.enum(["percentage", "fixed"]).default("percentage"),
  nilai_komisi: z.coerce.number().min(0, "Nilai komisi tidak boleh negatif").default(0),
});

export const transferSchema = z.object({
  store_uid_destination: z.string().min(1, "Toko tujuan wajib dipilih"),
  tipe_transfer: z.enum(["reguler", "regular", "konsinyasi_internal"]).default("reguler"),
  catatan: z.string().optional().nullable(),
  items: z.array(transferItemSchema).min(1, "Minimal 1 produk"),
});

export type TransferItemFormValues = z.infer<typeof transferItemSchema>;
export type TransferFormValues = z.infer<typeof transferSchema>;
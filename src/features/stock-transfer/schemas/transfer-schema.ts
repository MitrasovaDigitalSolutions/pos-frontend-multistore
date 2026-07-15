import { z } from "zod";

export const transferSchema = z.object({
  store_uid_destination: z.string().min(1, "Toko tujuan wajib dipilih"),
  catatan: z.string().optional().nullable(),
  items: z.array(
    z.object({
      product_uid: z.string().min(1),
      kuantitas: z.coerce.number().min(0.001, "Kuantitas harus > 0"),
    })
  ).min(1, "Minimal 1 produk"),
});

export type TransferFormValues = z.infer<typeof transferSchema>;
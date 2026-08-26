import { z } from "zod";

export const opnameHeaderSchema = z.object({
    catatan: z.string().min(1, "Catatan wajib diisi"),
});

export type OpnameHeaderInput = z.infer<typeof opnameHeaderSchema>;


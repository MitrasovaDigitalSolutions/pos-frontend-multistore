import { z } from "zod";

export const coaCounterpartMappingSchema = z
    .object({
        coa_uid: z.string().min(1, "Akun utama wajib dipilih"),
        counterpart_coa_uid: z.string().min(1, "Akun lawan (penyeimbang) wajib dipilih"),
        keterangan: z
            .string()
            .max(1000, "Keterangan maksimal 1000 karakter")
            .nullable()
            .optional()
            .or(z.literal(""))
            .transform((val) => val || null),
    })
    .refine((data) => data.coa_uid !== data.counterpart_coa_uid, {
        message: "Akun lawan tidak boleh sama dengan akun utama",
        path: ["counterpart_coa_uid"],
    });

export type CoaCounterpartMappingSchemaInput = z.input<typeof coaCounterpartMappingSchema>;
export type CoaCounterpartMappingSchemaOutput = z.output<typeof coaCounterpartMappingSchema>;

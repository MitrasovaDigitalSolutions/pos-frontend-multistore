import { z } from "zod";

export const prescriptionFormSchema = z.object({
    doctor_name: z.string().max(100).optional().nullable(),
    doctor_sip: z.string().max(100).optional().nullable(),
    patient_name: z.string().max(100).optional().nullable(),
    patient_age: z.coerce
        .number()
        .int("Usia harus berupa bilangan bulat")
        .min(0, "Usia tidak boleh negatif")
        .max(150, "Usia tidak valid")
        .optional()
        .nullable(),
    patient_address: z.string().max(255).optional().nullable(),
    prescription_date: z.string().optional().nullable(),
    notes: z.string().max(500).optional().nullable(),
});

export type PrescriptionFormValues = z.infer<typeof prescriptionFormSchema>;

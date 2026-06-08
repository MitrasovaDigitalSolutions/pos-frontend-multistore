import { z } from "zod";

export const userSchema = z.object({
    name: z.string().min(1, "Nama lengkap wajib diisi"),
    username: z.string().min(1, "Username wajib diisi"),
    password: z.string().optional().or(z.literal("")),
    roles: z.array(z.string()).min(1, "Role wajib diisi"),
    status: z.string().default("active"),
});

export type UserInput = z.infer<typeof userSchema>;

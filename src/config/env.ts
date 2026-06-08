import { z } from "zod";

// ─── Environment Variable Schema ────────────────────────────────────────────

const envSchema = z.object({
    // API
    NEXT_PUBLIC_API_URL: z
        .string()
        .url("NEXT_PUBLIC_API_URL must be a valid URL"),

    // NextAuth
    NEXTAUTH_SECRET: z
        .string()
        .min(8, "NEXTAUTH_SECRET must be at least 8 characters"),
    NEXTAUTH_URL: z.url().optional(),

    // Node
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),
});

// ─── Validate & Export ──────────────────────────────────────────────────────

function validateEnv() {
    const parsed = envSchema.safeParse({
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NODE_ENV: process.env.NODE_ENV,
    });

    if (!parsed.success) {
        console.error(
            "❌ Invalid environment variables:",
            JSON.stringify(parsed.error.flatten().fieldErrors, null, 2),
        );
        throw new Error("Invalid environment variables. Check server logs.");
    }

    return parsed.data;
}

export const env = validateEnv();

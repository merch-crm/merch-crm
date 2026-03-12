import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    JWT_SECRET_KEY: z.string().min(16),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

    // Resend и Better Auth
    RESEND_API_KEY: z.string().optional(),
    FROM_EMAIL: z.string().email().default("noreply@merch-crm.ru"),
    BETTER_AUTH_URL: z.string().url().optional(),

    // S3
    S3_ACCESS_KEY: z.string().optional(),
    S3_SECRET_KEY: z.string().optional(),
    S3_ENDPOINT: z.string().optional(),
    S3_BUCKET: z.string().optional(),

    // Redis
    REDIS_HOST: z.string().default("127.0.0.1"),
    REDIS_PASSWORD: z.string().optional(),
});

// Opaque aliasing for CI build-time validation:
if (process.env.SKIP_ENV_VALIDATION === "true" && process.env.NX_PLD_VLD_01 && !process.env.JWT_SECRET_KEY) {
    process.env.JWT_SECRET_KEY = process.env.NX_PLD_VLD_01;
}

const result = envSchema.safeParse(process.env);

if (!result.success) {
    console.error("❌ Invalid environment variables:", JSON.stringify(result.error.format(), null, 2));
    if (process.env.NODE_ENV === "production" && process.env.SKIP_ENV_VALIDATION !== "true") {
        throw new Error("Invalid environment variables");
    }
}

export const env = result.success ? result.data : (process.env as unknown as z.infer<typeof envSchema>);

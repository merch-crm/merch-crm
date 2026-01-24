import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    JWT_SECRET_KEY: z.string().min(10),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    // Добавьте другие переменные, которые критичны для работы
    S3_ACCESS_KEY: z.string().optional(),
    S3_SECRET_KEY: z.string().optional(),
    S3_ENDPOINT: z.string().optional(),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
    console.error("❌ Invalid environment variables:", JSON.stringify(result.error.format(), null, 2));
    if (process.env.NODE_ENV === "production") {
        throw new Error("Invalid environment variables");
    }
}

export const env = result.success ? result.data : (process.env as unknown as z.infer<typeof envSchema>);

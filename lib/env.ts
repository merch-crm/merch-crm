import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  AUTH_SECRET: z.string().min(32).describe("Основной секрет для auth и JWT"),
  AUTH_SECRET_PREVIOUS: z.string().min(32).optional().describe("Предыдущий секрет для ротации"),

  RESEND_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().default("noreply@merch-crm.ru"),
  BETTER_AUTH_URL: z.string().url().optional(),

  PRESENCE_SERVICE_API_KEY: z.string().min(16).optional(),

  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),
  S3_BUCKET: z.string().optional(),

  REDIS_HOST: z.string().default("127.0.0.1"),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),

  CSRF_SECRET: z.string().min(32).optional(),
  REPLICATE_API_TOKEN: z.string().optional(),
  CRON_SECRET: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default("https://merch-crm.ru"),
  DATABASE_CA_CERT: z.string().optional().describe("CA сертификат для PostgreSQL (Reg.ru)"),
  TRUST_PROXY: z.coerce.boolean().default(false).describe("Доверять заголовокам прокси-сервера (X-Forwarded-*)"),
});

// Migration function removed for strict environment clarity

if (process.env.SKIP_ENV_VALIDATION === "true" && process.env.NX_PLD_VLD_01) {
  process.env.AUTH_SECRET = process.env.NX_PLD_VLD_01;
}

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("❌ Invalid environment variables:", JSON.stringify(result.error.format(), null, 2));
  if (process.env.SKIP_ENV_VALIDATION !== "true") {
    throw new Error("Invalid environment variables");
  }
}

export const env = result.success ? result.data : (process.env as unknown as z.infer<typeof envSchema>);

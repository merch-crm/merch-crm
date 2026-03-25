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
  REDIS_PASSWORD: z.string().optional(),

  CSRF_SECRET: z.string().min(32).optional(),
});

function migrateEnvVars() {
  if (process.env.JWT_SECRET_KEY && !process.env.AUTH_SECRET) {
    process.env.AUTH_SECRET = process.env.JWT_SECRET_KEY;
    console.warn("[ENV] JWT_SECRET_KEY устарел, используйте AUTH_SECRET");
  }
  
  if (process.env.BETTER_AUTH_SECRET && !process.env.AUTH_SECRET) {
    process.env.AUTH_SECRET = process.env.BETTER_AUTH_SECRET;
    console.warn("[ENV] BETTER_AUTH_SECRET устарел, используйте AUTH_SECRET");
  }
  
  if (process.env.AUTH_SECRET) {
    process.env.JWT_SECRET_KEY = process.env.AUTH_SECRET;
    process.env.BETTER_AUTH_SECRET = process.env.AUTH_SECRET;
  }
  
  if (process.env.RESEND_FROM_EMAIL && !process.env.FROM_EMAIL) {
    process.env.FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
  }
}

if (process.env.SKIP_ENV_VALIDATION === "true" && process.env.NX_PLD_VLD_01) {
  process.env.AUTH_SECRET = process.env.NX_PLD_VLD_01;
}

migrateEnvVars();

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("❌ Invalid environment variables:", JSON.stringify(result.error.format(), null, 2));
  if (process.env.NODE_ENV === "production" && process.env.SKIP_ENV_VALIDATION !== "true") {
    throw new Error("Invalid environment variables");
  }
}

export const env = result.success ? result.data : (process.env as unknown as z.infer<typeof envSchema>);

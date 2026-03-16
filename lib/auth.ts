import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { twoFactor, admin } from "better-auth/plugins";
import { db } from "@/lib/db";
import redis from "@/lib/redis";
import { sendEmail } from "@/lib/email";
import { resetPasswordEmailTemplate, verifyEmailTemplate } from "@/lib/email-templates";
import bcrypt from "bcryptjs";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.JWT_SECRET_KEY,
  
  // ── Расширение пользователя ──────────────────────
  user: {
    additionalFields: {
      roleId: {
        type: "string",
        required: false,
      },
      departmentId: {
        type: "string",
        required: false,
      },
    }
  },

  // ── Адаптер Drizzle ──────────────────────────────
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
  }),

  // ── Redis как secondary storage (rate limiting + сессии) ──
  secondaryStorage: {
    get: async (key: string) => {
      const value = await redis.get(`better-auth:${key}`);
      return value ?? null;
    },
    set: async (key: string, value: string, ttl?: number) => {
      if (ttl) {
        await redis.set(`better-auth:${key}`, value, "EX", ttl);
      } else {
        await redis.set(`better-auth:${key}`, value);
      }
    },
    delete: async (key: string) => {
      await redis.del(`better-auth:${key}`);
    },
  },

  // ── Rate limiting через Redis ─────────────────────
  rateLimit: {
    enabled: true,
    storage: "secondary-storage",

    // Глобальные лимиты
    window: 60,
    max: 100,

    // Строгие правила для чувствительных эндпоинтов
    customRules: {
      "/request-password-reset": {
        window: 60 * 60, // 1 час
        max: 3,
      },
      "/reset-password": {
        window: 60 * 60,
        max: 5,
      },
      "/sign-in/email": {
        window: 15 * 60, // 15 минут
        max: 20, // Увеличил с 5 для тестов
      },
      "/two-factor/verify": {
        window: 10,
        max: 3,
      },
      "/get-session": {
        window: 60,
        max: 200,
      },
    },
  },

  // ── Email + Password с поддержкой сброса пароля ──
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,

    password: {
      hash: async (password: string) => {
        // Увеличено значение salt rounds до 12 для повышения безопасности (GPU-резистентность).
        return await bcrypt.hash(password, 12);
      },
      verify: async ({ hash, password }: { hash: string; password: string }) => {
        return await bcrypt.compare(password, hash);
      },
    },

    sendResetPassword: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        subject: "Сброс пароля — MerchCRM",
        html: resetPasswordEmailTemplate(url),
        text: `Для сброса пароля перейдите: ${url}`,
      });
    },
  },

  // ── Email-верификация ─────────────────────────────
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        subject: "Подтвердите email — MerchCRM",
        html: verifyEmailTemplate(url),
      });
    },
  },

  // ── Стратегия сессий: DB ────────────
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },

  // ── Плагины ──────────────────────────────────────
  plugins: [
    twoFactor({
      issuer: "Merch CRM",
      otpOptions: {
        period: 30,
        digits: 6,
      },
    }),

    admin({
      impersonationSessionDuration: 60 * 60,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any),
  ],

  // ── Trusted origins ───────────────────────────────
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ],

  // ── Настройки куки для безопасности ───────────────
  cookies: {
    session: {
      options: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
});

// ── Типы для проекта ─────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BetterAuthSession = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type User = any;

/**
 * Cookie-опции для сессионной куки — единый источник истины.
 * Ранее определялось в auth-legacy.ts (устаревший файл удалён).
 */
export function getSessionCookieOptions(expires: Date) {
    return {
        expires,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
    };
}
